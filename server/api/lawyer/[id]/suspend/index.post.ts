import { getErrorStatusCode, extractErrorMessage } from "~/util/apiHelper"

export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const formData = await readFormData(event)

    const response = await $fetch(`${apiBase}/admin/lawyers/${event.context.params?.id}/suspend`, {
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
    console.log(responseData)

    return {
      status: 200,
      message: (responseData.message as string) || 'Lawyer suspended successfully',
      data: response
    }
  } catch (error) {
    const statusCode = getErrorStatusCode(error, 400)
    const message = extractErrorMessage(error, 'Failed to suspend profile')

    return {
      status: statusCode,
      message: message
    }
  }
})
