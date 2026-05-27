export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  const caseId = event.context.params?.id || ''
  const documentId = event.context.params?.documentId || ''

  try {
    const response = await $fetch(`${apiBase}/lawyers/cases/${caseId}/documents/${documentId}/download`, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': '*/*',
        'User-Agent': 'Nuxt-Nitro-Server',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': `${auth_type} ${auth_token}`
      },
      responseType: 'blob'
    })

    // Forward the blob response
    return response
  } catch (error) {
    let statusCode = 401
    let message = 'Failed to download document'

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>
      statusCode = (err.statusCode as number) || (err.status as number) || 401
      const data = err.data as Record<string, unknown> | undefined
      message = (data?.message as string) || 'Failed to download document'

      console.log(data)
    }

    return {
      status: statusCode,
      message: message
    }
  }
})
