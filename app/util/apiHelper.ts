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
