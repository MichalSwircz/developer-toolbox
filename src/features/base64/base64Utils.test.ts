import { describe, expect, it } from 'vitest'
import { INPUT_SIZE_ERROR, MAX_INPUT_BYTES } from '../../shared/inputLimits'
import { decodeBase64ToText, encodeTextToBase64 } from './base64Utils'

describe('Base64 utilities', () => {
  it('encodes and decodes ASCII text', () => {
    const encoded = encodeTextToBase64('Hello, world!')

    expect(encoded).toEqual({ ok: true, value: 'SGVsbG8sIHdvcmxkIQ==' })
    expect(decodeBase64ToText('SGVsbG8sIHdvcmxkIQ==')).toEqual({
      ok: true,
      value: 'Hello, world!',
    })
  })

  it('round-trips Polish characters', () => {
    const text = 'Zażółć gęślą jaźń'
    const encoded = encodeTextToBase64(text)

    expect(encoded.ok).toBe(true)
    if (encoded.ok) {
      expect(decodeBase64ToText(encoded.value)).toEqual({ ok: true, value: text })
    }
  })

  it('round-trips other Unicode characters', () => {
    const text = 'こんにちは 🌍 — café'
    const encoded = encodeTextToBase64(text)

    expect(encoded.ok).toBe(true)
    if (encoded.ok) {
      expect(decodeBase64ToText(encoded.value)).toEqual({ ok: true, value: text })
    }
  })

  it('treats empty text as an empty Base64 value', () => {
    expect(encodeTextToBase64('')).toEqual({ ok: true, value: '' })
    expect(decodeBase64ToText('')).toEqual({ ok: true, value: '' })
  })

  it('rejects malformed Base64 and invalid UTF-8 data', () => {
    expect(decodeBase64ToText('%%%')).toEqual({
      ok: false,
      error: 'Enter valid Base64 data to decode.',
    })
    expect(decodeBase64ToText('YQ=')).toEqual({
      ok: false,
      error: 'Enter valid Base64 data to decode.',
    })
    expect(decodeBase64ToText('/w==')).toEqual({
      ok: false,
      error: 'The Base64 data does not contain valid UTF-8 text.',
    })
    expect(decodeBase64ToText('YR==')).toEqual({
      ok: false,
      error: 'Enter valid Base64 data to decode.',
    })
  })

  it('accepts standard Base64 whitespace and unpadded input', () => {
    expect(decodeBase64ToText('SGVs bG8s\nIHdvcmxkIQ')).toEqual({
      ok: true,
      value: 'Hello, world!',
    })
  })

  it('rejects inputs beyond the configured size limit', () => {
    expect(encodeTextToBase64('a'.repeat(MAX_INPUT_BYTES + 1))).toEqual({
      ok: false,
      error: INPUT_SIZE_ERROR,
    })
    expect(decodeBase64ToText('A'.repeat(MAX_INPUT_BYTES + 1))).toEqual({
      ok: false,
      error: INPUT_SIZE_ERROR,
    })
    expect(encodeTextToBase64('é'.repeat(MAX_INPUT_BYTES / 2 + 1))).toEqual({
      ok: false,
      error: INPUT_SIZE_ERROR,
    })
  })
})
