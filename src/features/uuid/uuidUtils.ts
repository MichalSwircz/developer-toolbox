export const MIN_UUID_COUNT = 1
export const MAX_UUID_COUNT = 100
export const DEFAULT_UUID_COUNT = 10

export type UuidCountValidation =
  | { valid: true; count: number }
  | { valid: false; error: string }

export type UuidGenerationResult =
  | { ok: true; uuids: string[] }
  | { ok: false; error: string }

export function validateUuidCount(value: string): UuidCountValidation {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return { valid: false, error: 'Enter the number of UUIDs to generate.' }
  }

  if (!/^\d+$/.test(trimmedValue)) {
    return { valid: false, error: 'Enter a whole number of UUIDs.' }
  }

  const count = Number(trimmedValue)
  if (!Number.isSafeInteger(count) || count < MIN_UUID_COUNT || count > MAX_UUID_COUNT) {
    return {
      valid: false,
      error: `Choose a quantity from ${MIN_UUID_COUNT} to ${MAX_UUID_COUNT}.`,
    }
  }

  return { valid: true, count }
}

export function generateUuids(
  count: number,
  cryptoSource: Pick<Crypto, 'randomUUID'> | null = globalThis.crypto,
): UuidGenerationResult {
  const validation = validateUuidCount(String(count))
  if (!validation.valid) {
    return { ok: false, error: validation.error }
  }

  if (!cryptoSource || typeof cryptoSource.randomUUID !== 'function') {
    return {
      ok: false,
      error:
        'Secure UUID generation is unavailable. Use a secure browser context that supports the Web Crypto API.',
    }
  }

  try {
    const uuids = Array.from({ length: validation.count }, () =>
      cryptoSource.randomUUID(),
    )
    return { ok: true, uuids }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Secure UUID generation failed: ${error.message}`
          : 'Secure UUID generation failed.',
    }
  }
}
