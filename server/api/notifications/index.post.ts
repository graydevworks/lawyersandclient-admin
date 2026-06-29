export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const body = await readBody(event)

    console.log(body, 'sbbsdkhjds')

    const response = await $fetch(`${apiBase}/admin/notifications`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'User-Agent': 'Nuxt-Nitro-Server',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': `${auth_type} ${auth_token}`
      },
      body
    })

    const responseData = response as Record<string, unknown>

    return {
      status: 200,
      message: (responseData.message as string) || 'Notification created successfully',
      data: response
    }
  } catch (error) {
    let statusCode = 401
    let message = 'Failed to create notification'

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>
      statusCode = (err.statusCode as number) || (err.status as number) || 401
      const data = err.data as Record<string, unknown> | undefined
      message = (data?.message as string) || 'Failed to create notification'

      console.log(data)
    }

    throw createError({
      statusCode,
      statusMessage: message,
      data: { message }
    })
  }
})
