import { describe, expect, it } from 'vitest'
import {
  DEFAULT_UUID_COUNT,
  MAX_UUID_COUNT,
  MIN_UUID_COUNT,
  generateUuids,
  validateUuidCount,
} from './uuidUtils'

describe('validateUuidCount', () => {
  it.each([
    ['1', MIN_UUID_COUNT],
    ['10', DEFAULT_UUID_COUNT],
    ['100', MAX_UUID_COUNT],
  ])('accepts a whole-number count of %s', (value, count) => {
    expect(validateUuidCount(value)).toEqual({ valid: true, count })
  })

  it.each([
    ['', 'Enter the number of UUIDs to generate.'],
    ['0', 'Choose a quantity from 1 to 100.'],
    ['101', 'Choose a quantity from 1 to 100.'],
    ['2.5', 'Enter a whole number of UUIDs.'],
    ['abc', 'Enter a whole number of UUIDs.'],
    ['999999999999999999999', 'Choose a quantity from 1 to 100.'],
  ])('rejects invalid count %j', (value, error) => {
    expect(validateUuidCount(value)).toEqual({ valid: false, error })
  })
})

describe('generateUuids', () => {
  it('uses the Web Crypto API to generate the requested number of UUID v4 values', () => {
    const result = generateUuids(12)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.uuids).toHaveLength(12)
      expect(
        result.uuids.every((uuid) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            uuid,
          ),
        ),
      ).toBe(true)
      expect(new Set(result.uuids).size).toBe(12)
    }
  })

  it('rejects an invalid count before generation', () => {
    expect(generateUuids(0)).toEqual({
      ok: false,
      error: 'Choose a quantity from 1 to 100.',
    })
  })

  it('reports when the secure UUID API is unavailable', () => {
    expect(generateUuids(1, null)).toEqual({
      ok: false,
      error:
        'Secure UUID generation is unavailable. Use a secure browser context that supports the Web Crypto API.',
    })
  })

  it('reports errors from the secure UUID API', () => {
    const failingCrypto = {
      randomUUID() {
        throw new Error('Random source failed')
      },
    }

    expect(generateUuids(1, failingCrypto)).toEqual({
      ok: false,
      error: 'Secure UUID generation failed: Random source failed',
    })
  })
})
