import {
  INPUT_SIZE_ERROR,
  isInputWithinLimit,
} from '../../shared/inputLimits'

export type JsonIndentation = 2 | 4 | '\t'

export type JsonTransformResult =
  | { ok: true; output: string }
  | { ok: false; error: string }

export type JsonValidationResult =
  | { valid: true }
  | { valid: false; error: string }

type JsonParseResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string }

function describeParseError(error: unknown, input: string): string {
  if (!(error instanceof SyntaxError)) {
    return error instanceof Error
      ? `Could not parse JSON: ${error.message}`
      : 'The input could not be parsed as JSON.'
  }

  const message = error.message
  if (/\bline \d+\s*,?\s*column \d+\b/i.test(message)) {
    return message
  }

  const positionMatch = message.match(/\bposition\s+(\d+)\b/i)
  if (!positionMatch) {
    return message
  }

  const position = Math.min(Number(positionMatch[1]), input.length)
  const precedingInput = input.slice(0, position)
  const line = precedingInput.split('\n').length
  const column = precedingInput.length - precedingInput.lastIndexOf('\n')

  return `${message} (line ${line}, column ${column}).`
}

function parseJsonInput(input: string): JsonParseResult {
  if (!isInputWithinLimit(input)) {
    return { ok: false, error: INPUT_SIZE_ERROR }
  }

  if (input.trim() === '') {
    return { ok: false, error: 'Enter JSON data to continue.' }
  }

  try {
    const value: unknown = JSON.parse(input)
    return { ok: true, value }
  } catch (error) {
    return { ok: false, error: describeParseError(error, input) }
  }
}

function transformJson(
  input: string,
  indentation?: JsonIndentation,
): JsonTransformResult {
  const parsed = parseJsonInput(input)
  if (!parsed.ok) {
    return parsed
  }

  try {
    const output =
      indentation === undefined
        ? JSON.stringify(parsed.value)
        : JSON.stringify(parsed.value, null, indentation)

    if (typeof output !== 'string') {
      return { ok: false, error: 'The JSON input could not be serialized.' }
    }

    return { ok: true, output }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Could not transform JSON: ${error.message}`
          : 'The JSON input could not be transformed.',
    }
  }
}

export function formatJson(
  input: string,
  indentation: JsonIndentation = 2,
): JsonTransformResult {
  return transformJson(input, indentation)
}

export function minifyJson(input: string): JsonTransformResult {
  return transformJson(input)
}

export function validateJson(input: string): JsonValidationResult {
  const parsed = parseJsonInput(input)
  return parsed.ok ? { valid: true } : { valid: false, error: parsed.error }
}
