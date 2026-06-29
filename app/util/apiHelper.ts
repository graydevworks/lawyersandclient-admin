/**
 * Utility helpers for API composables.
 */

/**
 * Check whether a caught error is an AbortError from an AbortController signal.
 */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * Create an abort manager that handles stale requests.
 * Call `getSignal()` before each request to auto-abort the previous one.
 */
export function createAbortManager() {
  let controller: AbortController | null = null

  return {
    getSignal(): AbortSignal {
      controller?.abort()
      controller = new AbortController()
      return controller.signal
    },
    abort() {
      controller?.abort()
      controller = null
    }
  }
}

/**
 * Extract a user-friendly error message from a thrown error.
 * Works with Nuxt's `createError()` / `$fetch` FetchError shape:
 *   error.data?.data?.message  (server `createError({ data: { message } })`)
 *   error.data?.message        (FetchError wrapper)
 *   error.statusMessage        (H3 statusMessage)
 *   fallback string
 */
export function extractErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error || typeof error !== 'object') return fallback
  const err = error as Record<string, unknown>

  // Nuxt $fetch wraps the server response in error.data
  const data = err.data as Record<string, unknown> | undefined

  // Server createError({ data: { message } }) → error.data.data.message
  const nestedData = data?.data as Record<string, unknown> | undefined
  if (typeof nestedData?.message === 'string' && nestedData.message) return nestedData.message

  // Direct data.message (some error shapes)
  if (typeof data?.message === 'string' && data.message) return data.message

  // H3 statusMessage
  if (typeof err.statusMessage === 'string' && err.statusMessage) return err.statusMessage

  // Generic Error.message
  if (typeof err.message === 'string' && err.message) return err.message

  return fallback
}
