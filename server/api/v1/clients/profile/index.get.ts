export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const response = await $fetch(`${apiBase}/clients/profile`, {
      method: 'GET',
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

    console.log('Profile fetched successfully', responseData.data)

    await replaceUserSession(event, {
      user: {
        email: responseData.data.email,
        role: 'clients',
        data: response && response.lawyer ? response.lawyer : response && response.client ? response.client : null
      }
    })

    return {
      status: 200,
      message: (responseData.message as string) || 'Profile fetched successfully',
      data: response
    }
  } catch (error) {
    let statusCode = 401
    let message = 'Failed to fetch profile'

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>
      statusCode = (err.statusCode as number) || (err.status as number) || 401
      const data = err.data as Record<string, unknown> | undefined
      message = (data?.message as string) || 'Failed to fetch profile'
    }

    return {
      status: statusCode,
      message: message
    }
  }
})
