export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const query = getQuery(event)

  let controller: AbortController | null = null

  const cleanQuery: any = { ...query }

  delete cleanQuery.controller

  const data = cleanQuery

  if (controller) {
    controller.abort()
  }

  controller = new AbortController()

  try {
    const response = await $fetch(`${apiBase}/public/search/`, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Nuxt-Nitro-Server',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      query: data,
      signal: controller.signal
    })

    const responseData = response as Record<string, unknown>

    return {
      status: 200,
      message: (responseData.message as string) || 'Search fetched successfully',
      data: response
    }
  } catch (error) {
    let statusCode = 401
    let message = 'Failed to fetch Search'

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>
      statusCode = (err.statusCode as number) || (err.status as number) || 401
      const data = err.data as Record<string, unknown> | undefined
      message = (data?.message as string) || 'Failed to fetch Search'

      console.log(data)
    }

    return {
      status: statusCode,
      message: message
    }
  } finally {
    // Optional: clear the controller reference once done
    controller = null
  }
})
