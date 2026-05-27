export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    // Get FormData from request
    const formData = await readFormData(event)

    const response: any = await $fetch(`${apiBase}/clients/profile/update`, {
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
      body: formData
    })

    if (response && response.status == 'success') {
      await replaceUserSession(event, {
        user: {
          email: response.data.email,
          role: 'clients',
          data: response ? response.data : null
        }
      })
    }

    console.log(response, 'hey')

    const responseData = response as Record<string, unknown>

    return {
      status: 200,
      message: (responseData.message as string) || 'Event created successfully',
      data: response
    }
  } catch (error) {
    let statusCode = 401
    let message = 'Failed to create event'

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>
      statusCode = (err.statusCode as number) || (err.status as number) || 401
      const data = err.data as Record<string, unknown> | undefined
      message = (data?.message as string) || 'Failed to create event'

      console.log(data)
    }

    return {
      status: statusCode,
      message: message
    }
  }
})
