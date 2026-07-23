export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const response = await $fetch(`${apiBase}/admin/cases/${event.context.params?.id}`, {
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

    // // Debug log to inspect structure
    // try {
    //   const fs = await import('fs')
    //   fs.writeFileSync('/Users/ranger/jobs/www/Grey/lawyersandclient-web/api_response_log.json', JSON.stringify({
    //     timestamp: new Date().toISOString(),
    //     success: true,
    //     response: response
    //   }, null, 2))
    // } catch (e) {
    //   console.error('Failed to write api response log:', e)
    // }

    return {
      status: 200,
      message: (responseData.message as string) || 'Case details fetched successfully',
      data: response
    }
  } catch (error) {
    throwApiError(error, 'Failed to fetch case details')
  }
})
