export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const formData = await readFormData(event)

    function coerceIntArray(values: unknown): number[] {
      if (!values) return []
      if (Array.isArray(values)) {
        return values
          .map(v => typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN)
          .filter(n => Number.isInteger(n))
      }
      if (typeof values === 'string') {
        const n = Number(values)
        return Number.isInteger(n) ? [n] : []
      }
      if (typeof values === 'number') {
        return Number.isInteger(values) ? [values] : []
      }
      return []
    }

    function formDataToObject(formData: FormData) {
      const lawyerIdsA = formData.getAll('lawyer_ids[]')
      const lawyerIdsB = formData.getAll('lawyers_ids[]')

      const combined = [...lawyerIdsA, ...lawyerIdsB]
      const coerced = coerceIntArray(combined)

      return {
        lawyer_ids: coerced
      }
    }

    const lawyers: any = {
      lawyer_ids: formDataToObject(formData).lawyer_ids || []
    }


    const response = await $fetch(`${apiBase}/admin/settings/featured-lawyers`, {
      method: 'PUT',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'User-Agent': 'Nuxt-Nitro-Server',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': `${auth_type} ${auth_token}`
      },
      body: lawyers
    })

    const responseData = response as Record<string, unknown>

    return {
      status: 200,
      message: (responseData.message as string) || 'Featured lawyers updated successfully',
      data: response
    }
  } catch (error) {
    let statusCode = 401
    let message = 'Failed to update featured lawyers'

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>
      statusCode = (err.statusCode as number) || (err.status as number) || 401
      const data = err.data as Record<string, unknown> | undefined
      message = (data?.message as string) || 'Failed to update featured lawyers'

      console.log(data)
    }

    throw createError({
      statusCode,
      statusMessage: message,
      data: { message }
    })
  }
})
