import {
  INPUT_SIZE_ERROR,
  MAX_INPUT_BYTES,
  isInputWithinLimit,
} from '../../shared/inputLimits'

export type Base64Result =
  | { ok: true; value: string }
  | { ok: false; error: string }

export function encodeTextToBase64(text: string): Base64Result {
  if (text.length > MAX_INPUT_BYTES) {
    return { ok: false, error: INPUT_SIZE_ERROR }
  }

  const bytes = new TextEncoder().encode(text)
  if (bytes.byteLength > MAX_INPUT_BYTES) {
    return { ok: false, error: INPUT_SIZE_ERROR }
  }

  let binary = ''
  const chunkSize = 0x8000

  try {
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(
        ...bytes.subarray(offset, offset + chunkSize),
      )
    }

    return { ok: true, value: btoa(binary) }
  } catch {
    return { ok: false, error: 'Could not encode the text as Base64.' }
  }
}

function isValidBase64(value: string): boolean {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    return false
  }

  const paddingLength = value.endsWith('==')
    ? 2
    : value.endsWith('=')
      ? 1
      : 0
  const dataLength = value.length - paddingLength

  if (paddingLength > 0) {
    return (
      value.length % 4 === 0 &&
      (paddingLength === 2 ? dataLength % 4 === 2 : dataLength % 4 === 3)
    )
  }

  return dataLength % 4 !== 1
}

export function decodeBase64ToText(encoded: string): Base64Result {
  if (!isInputWithinLimit(encoded)) {
    return { ok: false, error: INPUT_SIZE_ERROR }
  }

  const normalized = encoded.replace(/[\t\n\f\r ]/g, '')

  if (!isValidBase64(normalized)) {
    return { ok: false, error: 'Enter valid Base64 data to decode.' }
  }

  let binary: string
  try {
    binary = atob(normalized)
  } catch {
    return { ok: false, error: 'Enter valid Base64 data to decode.' }
  }

  const canonicalBase64 = btoa(binary)
  if (normalized.replace(/=+$/, '') !== canonicalBase64.replace(/=+$/, '')) {
    return { ok: false, error: 'Enter valid Base64 data to decode.' }
  }

  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))

  try {
    return {
      ok: true,
      value: new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    }
  } catch {
    return {
      ok: false,
      error: 'The Base64 data does not contain valid UTF-8 text.',
    }
  }
}
