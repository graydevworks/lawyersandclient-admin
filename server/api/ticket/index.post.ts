export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const session = await getUserSession(event)

    console.log((session.user as any)?.role)

    const role = (session.user as any)?.role || 'clients'
    const formData = await readFormData(event)

    const response = await $fetch(`${apiBase}/${role}/tickets`, {
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

    const responseData = response as Record<string, unknown>

    return {
      status: 200,
      message: (responseData.message as string) || 'Ticket submitted successfully',
      data: response
    }
  } catch (error) {
    throwApiError(error, 'Failed to submit ticket')
  }
})
