export const MAX_INPUT_BYTES = 1_048_576
export const INPUT_SIZE_ERROR = 'Input must not exceed 1 MiB when encoded as UTF-8.'

export function isInputWithinLimit(input: string): boolean {
  if (input.length > MAX_INPUT_BYTES) {
    return false
  }

  return new TextEncoder().encode(input).byteLength <= MAX_INPUT_BYTES
}
