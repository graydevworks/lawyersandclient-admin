export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const query = getQuery(event)
    const response = await $fetch(`${apiBase}/admin/verification-queue/${event.context.params?.id}/documents`, {
      method: 'GET',
      query,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Nuxt-Nitro-Server',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': `${auth_type} ${auth_token}`
      }
    })

    const responseData = response as Record<string, unknown>

    return {
      status: 200,
      message: (responseData.message as string) || 'Verification documents fetched successfully',
      data: response
    }
  } catch (error) {
    let statusCode = 401
    let message = 'Failed to fetch verification documents'

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>
      statusCode = (err.statusCode as number) || (err.status as number) || 401
      const data = err.data as Record<string, unknown> | undefined
      message = (data?.message as string) || 'Failed to fetch verification documents'

      console.log(data)
    }

    throw createError({
      statusCode,
      statusMessage: message,
      data: { message }
    })
  }
})
