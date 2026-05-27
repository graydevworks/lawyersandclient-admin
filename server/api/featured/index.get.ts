export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)

  try {
    const response = await $fetch(`${apiBase}/admin/settings/featured-lawyers`, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Nuxt-Nitro-Server',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })

    const responseData = response as Record<string, unknown>

    return {
      status: 200,
      message: (responseData.message as string) || 'Lawyers fetched successfully',
      data: response
    }
  } catch (error) {
    let statusCode = 401
    let message = 'Failed to fetch lawyers'

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>
      statusCode = (err.statusCode as number) || (err.status as number) || 401
      const data = err.data as Record<string, unknown> | undefined
      message = (data?.message as string) || 'Failed to fetch lawyers'

      console.log(data)
    }

    return {
      status: statusCode,
      message: message
    }
  }
})
