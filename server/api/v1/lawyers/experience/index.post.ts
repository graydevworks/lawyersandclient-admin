export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const formData = await readFormData(event)
    console.log(formData.get('is_current'))

    const response = await $fetch(`${apiBase}/lawyers/experiences`, {
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
      body: {
        company: formData.get('company'),
        job_title: formData.get('job_title'),
        start_year: formData.get('start_year'),
        end_year: formData.get('end_year'),
        description: formData.get('description'),
        is_current: formData.get('is_current') === 'true' ? true : false
      }
    })

    const responseData = response as Record<string, unknown>

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

    return {
      status: statusCode,
      message: message
    }
  }
})
