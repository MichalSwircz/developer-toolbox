import { describe, expect, it } from 'vitest'
import { INPUT_SIZE_ERROR, MAX_INPUT_BYTES } from '../../shared/inputLimits'
import { formatJson, minifyJson, validateJson } from './jsonUtils'

describe('formatJson', () => {
  it('pretty-prints a valid object using two-space indentation by default', () => {
    expect(formatJson('{"name":"Ada","active":true}')).toEqual({
      ok: true,
      output: '{\n  "name": "Ada",\n  "active": true\n}',
    })
  })

  it('formats nested objects and arrays', () => {
    expect(formatJson('{"items":[{"id":1},{"id":2}]}')).toEqual({
      ok: true,
      output:
        '{\n  "items": [\n    {\n      "id": 1\n    },\n    {\n      "id": 2\n    }\n  ]\n}',
    })
  })

  it('uses four-space indentation when requested', () => {
    expect(formatJson('{"name":"Ada"}', 4)).toEqual({
      ok: true,
      output: '{\n    "name": "Ada"\n}',
    })
  })

  it('supports tab indentation', () => {
    expect(formatJson('{"nested":{"ready":true}}', '\t')).toEqual({
      ok: true,
      output: '{\n\t"nested": {\n\t\t"ready": true\n\t}\n}',
    })
  })

  it('returns a useful error for invalid JSON', () => {
    const result = formatJson('{\n  "name": "Ada",\n}')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/line \d+\s*,?\s*column \d+/i)
    }
  })

  it('reports empty or whitespace-only input', () => {
    expect(formatJson(' \n\t ')).toEqual({
      ok: false,
      error: 'Enter JSON data to continue.',
    })
  })

  it('rejects inputs beyond the configured size limit', () => {
    expect(formatJson(' '.repeat(MAX_INPUT_BYTES + 1))).toEqual({
      ok: false,
      error: INPUT_SIZE_ERROR,
    })
  })
})

describe('minifyJson', () => {
  it('removes insignificant whitespace from objects and arrays', () => {
    expect(minifyJson('{\n  "items": [1, 2, 3]\n}')).toEqual({
      ok: true,
      output: '{"items":[1,2,3]}',
    })
  })

  it('returns a useful error for invalid JSON', () => {
    const result = minifyJson('{"name":}')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).not.toBe('')
    }
  })

  it('reports empty input', () => {
    expect(minifyJson(' ')).toEqual({
      ok: false,
      error: 'Enter JSON data to continue.',
    })
  })
})

describe('validateJson', () => {
  it.each(['{"valid":true}', '[1,{"nested":[]} ]', '"text"', '42', 'null'])(
    'accepts valid JSON: %s',
    (input) => {
      expect(validateJson(input)).toEqual({ valid: true })
    },
  )

  it('rejects invalid and empty input with an error message', () => {
    expect(validateJson('{"missing":}')).toMatchObject({
      valid: false,
      error: expect.any(String),
    })
    expect(validateJson('')).toEqual({
      valid: false,
      error: 'Enter JSON data to continue.',
    })
  })
})
