import { describe, expect, it } from 'vitest'
import { INPUT_SIZE_ERROR, MAX_INPUT_BYTES } from '../../shared/inputLimits'
import { decodeJwt } from './jwtUtils'

function encodeBase64Url(value: string): string {
  return btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function createToken(
  header: unknown,
  payload: unknown,
  signature = '',
): string {
  return [
    encodeBase64Url(JSON.stringify(header)),
    encodeBase64Url(JSON.stringify(payload)),
    signature,
  ].join('.')
}

describe('decodeJwt', () => {
  it('decodes the header and payload as formatted JSON', () => {
    const token = createToken(
      { alg: 'HS256', typ: 'JWT' },
      { sub: 'user-1', permissions: ['read', 'write'] },
      'c2ln',
    )

    const result = decodeJwt(token, 1_800_000_000)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.decoded.header).toEqual({ alg: 'HS256', typ: 'JWT' })
      expect(result.decoded.headerJson).toContain('"alg": "HS256"')
      expect(result.decoded.payloadJson).toContain('"permissions": [')
    }
  })

  it('rejects tokens with the wrong number of segments', () => {
    expect(decodeJwt('header.payload', 1_800_000_000)).toEqual({
      ok: false,
      error: 'A JWT must contain exactly three dot-separated segments.',
    })
  })

  it('rejects empty header or payload segments', () => {
    expect(decodeJwt('.e30.', 1_800_000_000)).toMatchObject({
      ok: false,
      error: expect.stringContaining('must not be empty'),
    })
    expect(decodeJwt('e30..', 1_800_000_000)).toMatchObject({
      ok: false,
      error: expect.stringContaining('must not be empty'),
    })
  })

  it('rejects invalid Base64URL characters in each segment', () => {
    expect(decodeJwt('@@.e30.', 1_800_000_000)).toMatchObject({
      ok: false,
      error: expect.stringContaining('header'),
    })
    expect(decodeJwt('e30.@@.', 1_800_000_000)).toMatchObject({
      ok: false,
      error: expect.stringContaining('payload'),
    })
    expect(decodeJwt('e30.e30.@', 1_800_000_000)).toMatchObject({
      ok: false,
      error: expect.stringContaining('signature'),
    })
  })

  it('rejects non-zero unused Base64URL bits', () => {
    expect(decodeJwt('YR.e30.', 1_800_000_000)).toEqual({
      ok: false,
      error: 'JWT header segment has non-zero unused Base64URL bits.',
    })
    expect(decodeJwt('e30.e30.YR', 1_800_000_000)).toEqual({
      ok: false,
      error: 'JWT signature segment has non-zero unused Base64URL bits.',
    })
  })

  it('rejects invalid JSON and non-object payloads', () => {
    const invalidJsonToken = `${encodeBase64Url('{"alg":"none"}')}.${encodeBase64Url('{')}.`

    expect(decodeJwt(invalidJsonToken, 1_800_000_000)).toMatchObject({
      ok: false,
      error: expect.stringContaining('payload is not valid JSON'),
    })
    expect(decodeJwt(createToken({ alg: 'none' }, []), 1_800_000_000)).toEqual({
      ok: false,
      error: 'JWT payload must be a JSON object.',
    })
    expect(decodeJwt(createToken([], {}), 1_800_000_000)).toEqual({
      ok: false,
      error: 'JWT header must be a JSON object.',
    })
  })

  it('reports absent time claims without failing to decode', () => {
    const result = decodeJwt(createToken({ alg: 'none' }, { sub: 'user-1' }), 100)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.decoded.expiration).toBeNull()
      expect(result.decoded.issuedAt).toBeNull()
      expect(result.decoded.notBefore).toBeNull()
      expect(result.decoded.isExpired).toBeNull()
    }
  })

  it('decodes NumericDate claims and marks an expired token', () => {
    const token = createToken(
      { alg: 'none' },
      { exp: 1_000, iat: 900, nbf: 950 },
    )
    const result = decodeJwt(token, 1_000)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.decoded.expiration).toEqual({
        kind: 'valid',
        seconds: 1_000,
        iso: '1970-01-01T00:16:40.000Z',
      })
      expect(result.decoded.issuedAt).toMatchObject({ seconds: 900 })
      expect(result.decoded.notBefore).toMatchObject({ seconds: 950 })
      expect(result.decoded.isExpired).toBe(true)
    }
  })

  it('marks a token as not expired before the exp timestamp', () => {
    const result = decodeJwt(createToken({}, { exp: 1_001 }), 1_000)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.decoded.isExpired).toBe(false)
    }
  })

  it('keeps decoding when a timestamp claim has an invalid type', () => {
    const result = decodeJwt(createToken({}, { exp: 'tomorrow' }), 1_000)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.decoded.expiration).toMatchObject({
        kind: 'invalid',
        error: 'The "exp" claim must be a finite NumericDate in seconds.',
      })
      expect(result.decoded.isExpired).toBeNull()
    }
  })

  it('reports invalid UTF-8 in encoded payloads', () => {
    expect(decodeJwt('eyJhbGciOiJub25lIn0.__8.', 1_800_000_000)).toEqual({
      ok: false,
      error: 'JWT payload segment is not valid UTF-8.',
    })
  })

  it('rejects empty input and a non-finite current time', () => {
    expect(decodeJwt('  ', 1_800_000_000)).toEqual({
      ok: false,
      error: 'Enter a JWT to decode.',
    })
    expect(decodeJwt('e30.e30.', Number.NaN)).toEqual({
      ok: false,
      error: 'The current time must be a finite number.',
    })
  })

  it('rejects tokens beyond the configured size limit', () => {
    expect(decodeJwt('a'.repeat(MAX_INPUT_BYTES + 1), 1_800_000_000)).toEqual({
      ok: false,
      error: INPUT_SIZE_ERROR,
    })
  })

  it('does not throw when deeply nested JWT JSON cannot be formatted', () => {
    const depth = 10_000
    const payload = `{"nested":${'['.repeat(depth)}0${']'.repeat(depth)}}`
    const token = `${encodeBase64Url('{}')}.${encodeBase64Url(payload)}.`

    expect(() => decodeJwt(token, 1_800_000_000)).not.toThrow()
  })

  it('counts UTF-8 bytes toward the input limit', () => {
    expect(decodeJwt('é'.repeat(MAX_INPUT_BYTES / 2 + 1), 1_800_000_000)).toEqual({
      ok: false,
      error: INPUT_SIZE_ERROR,
    })
  })
})
