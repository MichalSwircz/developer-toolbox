import {
  INPUT_SIZE_ERROR,
  isInputWithinLimit,
} from '../../shared/inputLimits'

export type JwtJsonObject = Record<string, unknown>

export type JwtTimestampClaim =
  | { kind: 'valid'; seconds: number; iso: string }
  | { kind: 'invalid'; value: unknown; error: string }

export interface DecodedJwt {
  header: JwtJsonObject
  payload: JwtJsonObject
  headerJson: string
  payloadJson: string
  expiration: JwtTimestampClaim | null
  issuedAt: JwtTimestampClaim | null
  notBefore: JwtTimestampClaim | null
  isExpired: boolean | null
}

export type JwtDecodeResult =
  | { ok: true; decoded: DecodedJwt }
  | { ok: false; error: string }

type ValueResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

type JwtSection = 'header' | 'payload' | 'signature'

function normalizeBase64UrlSegment(
  segment: string,
  section: JwtSection,
  allowEmpty = false,
): ValueResult<string> {
  if (segment === '' && allowEmpty) {
    return { ok: true, value: '' }
  }
  if (segment === '') {
    return { ok: false, error: `JWT ${section} segment must not be empty.` }
  }

  const paddingStart = segment.indexOf('=')
  const content =
    paddingStart === -1 ? segment : segment.slice(0, paddingStart)
  const padding = paddingStart === -1 ? '' : segment.slice(paddingStart)

  if (!/^[A-Za-z0-9_-]+$/.test(content)) {
    return {
      ok: false,
      error: `JWT ${section} segment contains invalid Base64URL characters.`,
    }
  }

  const remainder = content.length % 4
  if (remainder === 1) {
    return {
      ok: false,
      error: `JWT ${section} segment has an invalid Base64URL length.`,
    }
  }

  const base64UrlAlphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  const finalCharacterValue = base64UrlAlphabet.indexOf(
    content[content.length - 1],
  )
  if (
    (remainder === 2 && finalCharacterValue % 16 !== 0) ||
    (remainder === 3 && finalCharacterValue % 4 !== 0)
  ) {
    return {
      ok: false,
      error: `JWT ${section} segment has non-zero unused Base64URL bits.`,
    }
  }

  const requiredPadding = (4 - remainder) % 4
  if (
    padding.length > 2 ||
    (padding.length > 0 &&
      (segment.length % 4 !== 0 || padding.length !== requiredPadding))
  ) {
    return {
      ok: false,
      error: `JWT ${section} segment has invalid Base64URL padding.`,
    }
  }

  return {
    ok: true,
    value:
      content.replace(/-/g, '+').replace(/_/g, '/') +
      '='.repeat(requiredPadding),
  }
}

function decodeBase64UrlText(
  segment: string,
  section: Exclude<JwtSection, 'signature'>,
): ValueResult<string> {
  const normalized = normalizeBase64UrlSegment(segment, section)
  if (!normalized.ok) {
    return normalized
  }

  let binary: string
  try {
    binary = atob(normalized.value)
  } catch {
    return {
      ok: false,
      error: `JWT ${section} segment contains invalid Base64URL data.`,
    }
  }

  const bytes = Uint8Array.from(binary, (character) =>
    character.charCodeAt(0),
  )

  try {
    return {
      ok: true,
      value: new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    }
  } catch {
    return {
      ok: false,
      error: `JWT ${section} segment is not valid UTF-8.`,
    }
  }
}

function isJsonObject(value: unknown): value is JwtJsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseJsonSection(
  segment: string,
  section: Exclude<JwtSection, 'signature'>,
): ValueResult<JwtJsonObject> {
  const text = decodeBase64UrlText(segment, section)
  if (!text.ok) {
    return text
  }

  let value: unknown
  try {
    value = JSON.parse(text.value)
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : ''
    return {
      ok: false,
      error: `JWT ${section} is not valid JSON.${detail}`,
    }
  }

  if (!isJsonObject(value)) {
    return {
      ok: false,
      error: `JWT ${section} must be a JSON object.`,
    }
  }

  return { ok: true, value }
}

function readTimestampClaim(
  payload: JwtJsonObject,
  claim: 'exp' | 'iat' | 'nbf',
): JwtTimestampClaim | null {
  if (!Object.prototype.hasOwnProperty.call(payload, claim)) {
    return null
  }

  const value = payload[claim]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return {
      kind: 'invalid',
      value,
      error: `The "${claim}" claim must be a finite NumericDate in seconds.`,
    }
  }

  const date = new Date(value * 1000)
  if (!Number.isFinite(date.getTime())) {
    return {
      kind: 'invalid',
      value,
      error: `The "${claim}" claim is outside the supported date range.`,
    }
  }

  return { kind: 'valid', seconds: value, iso: date.toISOString() }
}

export function decodeJwt(token: string, nowSeconds: number): JwtDecodeResult {
  if (!Number.isFinite(nowSeconds)) {
    return { ok: false, error: 'The current time must be a finite number.' }
  }

  if (!isInputWithinLimit(token)) {
    return { ok: false, error: INPUT_SIZE_ERROR }
  }

  const trimmedToken = token.trim()
  if (trimmedToken === '') {
    return { ok: false, error: 'Enter a JWT to decode.' }
  }

  const headerSeparator = trimmedToken.indexOf('.')
  const payloadSeparator = trimmedToken.indexOf('.', headerSeparator + 1)
  if (
    headerSeparator === -1 ||
    payloadSeparator === -1 ||
    trimmedToken.indexOf('.', payloadSeparator + 1) !== -1
  ) {
    return {
      ok: false,
      error: 'A JWT must contain exactly three dot-separated segments.',
    }
  }

  const headerSegment = trimmedToken.slice(0, headerSeparator)
  const payloadSegment = trimmedToken.slice(
    headerSeparator + 1,
    payloadSeparator,
  )
  const signatureSegment = trimmedToken.slice(payloadSeparator + 1)
  if (!headerSegment || !payloadSegment) {
    return {
      ok: false,
      error: 'JWT header and payload segments must not be empty.',
    }
  }

  const signature = normalizeBase64UrlSegment(
    signatureSegment,
    'signature',
    true,
  )
  if (!signature.ok) {
    return signature
  }

  const header = parseJsonSection(headerSegment, 'header')
  if (!header.ok) {
    return header
  }

  const payload = parseJsonSection(payloadSegment, 'payload')
  if (!payload.ok) {
    return payload
  }

  const expiration = readTimestampClaim(payload.value, 'exp')
  const issuedAt = readTimestampClaim(payload.value, 'iat')
  const notBefore = readTimestampClaim(payload.value, 'nbf')
  let headerJson: string | undefined
  let payloadJson: string | undefined
  try {
    headerJson = JSON.stringify(header.value, null, 2)
    payloadJson = JSON.stringify(payload.value, null, 2)
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Decoded JWT sections could not be formatted: ${error.message}`
          : 'Decoded JWT sections could not be formatted as JSON.',
    }
  }

  if (typeof headerJson !== 'string' || typeof payloadJson !== 'string') {
    return {
      ok: false,
      error: 'Decoded JWT sections could not be formatted as JSON.',
    }
  }

  return {
    ok: true,
    decoded: {
      header: header.value,
      payload: payload.value,
      headerJson,
      payloadJson,
      expiration,
      issuedAt,
      notBefore,
      isExpired:
        expiration?.kind === 'valid'
          ? nowSeconds >= expiration.seconds
          : null,
    },
  }
}
