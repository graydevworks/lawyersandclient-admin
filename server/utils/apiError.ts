type ApiErrorPayload = Record<string, unknown>

/**
 * Re-throw a backend API error to the client, preserving validation `errors`
 * and other fields from the upstream response.
 */
export function throwApiError(error: unknown, fallback: string): never {
  let statusCode = 500
  let message = fallback
  let payload: ApiErrorPayload = { message: fallback }

  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>
    statusCode = (err.statusCode as number) || (err.status as number) || 500
    const data = err.data as ApiErrorPayload | undefined

    if (data) {
      payload = data
      message = (typeof data.message === 'string' && data.message) ? data.message : fallback
    }
  }

  throw createError({
    statusCode,
    statusMessage: message,
    data: payload
  })
}
