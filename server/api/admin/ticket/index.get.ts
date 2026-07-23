export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const query = getQuery(event)

    const params = new URLSearchParams()

    if (query.q) params.append('q', String(query.q))
    if (query.status) params.append('status', String(query.status))
    if (query.date_from) params.append('date_from', String(query.date_from))
    if (query.date_to) params.append('date_to', String(query.date_to))
    if (query.per_page) params.append('per_page', String(query.per_page))
    if (query.page) params.append('page', String(query.page))

    const response = await $fetch(`${apiBase}/admin/tickets?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'User-Agent': 'Nuxt-Nitro-Server',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': `${auth_type} ${auth_token}`
      }
    })

    return response
  } catch (error) {
    throwApiError(error, 'Failed to fetch tickets')
  }
})
