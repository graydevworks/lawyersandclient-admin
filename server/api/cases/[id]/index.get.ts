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
      message: (responseData.message as string) || 'Lawyer saved successfully',
      data: response
    }
  } catch (error) {
    let statusCode = 401
    let message = 'Failed to save lawyer'

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>
      statusCode = (err.statusCode as number) || (err.status as number) || 401
      const data = err.data as Record<string, unknown> | undefined
      message = (data?.message as string) || 'Failed to save lawyer'

      console.log(data)
    }

    // // Debug log to inspect error structure
    // try {
    //   const fs = await import('fs')
    //   fs.writeFileSync('/Users/ranger/jobs/www/Grey/lawyersandclient-web/api_response_log.json', JSON.stringify({
    //     timestamp: new Date().toISOString(),
    //     success: false,
    //     statusCode,
    //     message,
    //     error: error && typeof error === 'object' ? {
    //       message: (error as any).message,
    //       stack: (error as any).stack,
    //       data: (error as any).data
    //     } : error
    //   }, null, 2))
    // } catch (e) {
    //   console.error('Failed to write api error log:', e)
    // }

    return {
      status: statusCode,
      message: message
    }
  }
})
