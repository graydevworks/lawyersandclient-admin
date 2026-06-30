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

const ERROR_CONTAINER_KEYS = new Set([
  'errors',
  'error',
  'validation_errors',
  'validationErrors',
  'field_errors',
  'fieldErrors'
])

const GENERIC_MESSAGE_KEYS = new Set([
  'message',
  'detail',
  'description',
  'statusMessage'
])

function isNoiseMessage(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('abort')
    || lower.includes('signal is aborted')
    || lower === 'fetch failed'
    || lower === 'validation error.'
    || lower === 'validation error'
}

function isFieldErrorValue(value: unknown): boolean {
  return typeof value === 'string'
    || (Array.isArray(value) && value.every(item => typeof item === 'string'))
}

function looksLikeFieldErrorMap(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const entries = Object.entries(value as Record<string, unknown>)
  if (entries.length === 0) return false

  return entries.every(([, val]) => isFieldErrorValue(val) || (val && typeof val === 'object'))
}

function addUniqueMessage(messages: string[], message: string) {
  const trimmed = message.trim()
  if (!trimmed || isNoiseMessage(trimmed)) return
  if (!messages.includes(trimmed)) messages.push(trimmed)
}

function collectStringsFromTree(node: unknown, messages: string[], seen: WeakSet<object>, depth = 0) {
  if (node == null || depth > 12) return

  if (typeof node === 'string') {
    addUniqueMessage(messages, node)
    return
  }

  if (Array.isArray(node)) {
    for (const item of node) collectStringsFromTree(item, messages, seen, depth + 1)
    return
  }

  if (typeof node !== 'object') return
  if (seen.has(node as object)) return
  seen.add(node as object)

  for (const value of Object.values(node as Record<string, unknown>)) {
    collectStringsFromTree(value, messages, seen, depth + 1)
  }
}

function findErrorContainers(node: unknown, containers: unknown[], seen: WeakSet<object>) {
  if (node == null || typeof node !== 'object') return
  if (seen.has(node as object)) return
  seen.add(node as object)

  if (Array.isArray(node)) {
    if (node.every(item => typeof item === 'string')) containers.push(node)
    for (const item of node) findErrorContainers(item, containers, seen)
    return
  }

  const record = node as Record<string, unknown>

  if (looksLikeFieldErrorMap(record) && !('success' in record) && !('data' in record)) {
    containers.push(record)
  }

  for (const [key, value] of Object.entries(record)) {
    if (ERROR_CONTAINER_KEYS.has(key)) containers.push(value)
    findErrorContainers(value, containers, seen)
  }
}

function collectPayloadRoots(error: Record<string, unknown>): unknown[] {
  const roots: unknown[] = []
  const data = error.data

  if (data !== undefined) roots.push(data)

  if (data && typeof data === 'object') {
    const nested = (data as Record<string, unknown>).data
    if (nested !== undefined) roots.push(nested)
  }

  return roots
}

export type ResolvedApiError = {
  error: string
  validationMessages: string[]
}

/**
 * Resolve any API error into a display string and optional field-level messages.
 * Field names are not assumed — works for any backend validation shape.
 */
export function resolveApiError(error: unknown, fallback = 'Something went wrong'): ResolvedApiError {
  return {
    error: extractErrorMessage(error, fallback),
    validationMessages: extractValidationMessages(error)
  }
}

/**
 * Pick the best user-facing message from a failed composable result.
 */
export function displayApiError(
  result: { error?: unknown, validationMessages?: string[] } | null | undefined,
  fallback = 'Something went wrong'
): string {
  if (result?.validationMessages?.length) {
    return result.validationMessages.join('. ')
  }

  if (typeof result?.error === 'string' && result.error.trim()) {
    return result.error.trim()
  }

  if (result?.error) {
    return extractErrorMessage(result.error, fallback)
  }

  return fallback
}

/**
 * Extract all backend validation messages from an error, regardless of field names,
 * nesting depth, or number of fields (e.g. reason, email, password, nested objects).
 */
export function extractValidationMessages(error: unknown): string[] {
  if (!error || typeof error !== 'object' || isAbortError(error)) return []

  const err = error as Record<string, unknown>
  const containers: unknown[] = []
  const seen = new WeakSet<object>()
  const messages: string[] = []

  for (const root of collectPayloadRoots(err)) {
    findErrorContainers(root, containers, seen)
  }

  const messageSeen = new WeakSet<object>()
  for (const container of containers) {
    collectStringsFromTree(container, messages, messageSeen)
  }

  return messages
}

/**
 * Extract a user-friendly error message from a thrown error.
 * Prefers specific backend validation messages over generic summaries.
 */
export function extractErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error || typeof error !== 'object') return fallback
  if (isAbortError(error)) return fallback

  const validationMessages = extractValidationMessages(error)
  if (validationMessages.length > 0) {
    return validationMessages.join('. ')
  }

  const err = error as Record<string, unknown>
  const data = err.data

  const messageSources: unknown[] = [data, err]

  for (const source of messageSources) {
    if (!source || typeof source !== 'object') continue

    for (const key of GENERIC_MESSAGE_KEYS) {
      const value = (source as Record<string, unknown>)[key]
      if (typeof value === 'string' && value.trim() && !isNoiseMessage(value)) {
        return value.trim()
      }
    }

    const nested = (source as Record<string, unknown>).data
    if (nested && typeof nested === 'object') {
      for (const key of GENERIC_MESSAGE_KEYS) {
        const value = (nested as Record<string, unknown>)[key]
        if (typeof value === 'string' && value.trim() && !isNoiseMessage(value)) {
          return value.trim()
        }
      }
    }
  }

  if (typeof err.statusMessage === 'string' && err.statusMessage.trim() && !isNoiseMessage(err.statusMessage)) {
    return err.statusMessage.trim()
  }

  if (typeof err.message === 'string' && err.message.trim() && !isNoiseMessage(err.message)) {
    return err.message.trim()
  }

  return fallback
}
