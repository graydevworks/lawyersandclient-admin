export default defineEventHandler(async (event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  const auth_token = getCookie(event, 'auth_token')
  const auth_type = getCookie(event, 'auth_type') || 'bearer'

  try {
    const formData = await readFormData(event)

    console.log(formData)

    const response = await $fetch(`${apiBase}/admin/settings/admins/${event.context.params?.id}`, {
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
      body: formData
    })

    const responseData = response as Record<string, unknown>

    return {
      status: 200,
      message: (responseData.message as string) || 'Admin account updated successfully',
      data: response
    }
  } catch (error) {
    // Backend errors come in shapes like:
    // { success:false, message:'Validation error.', errors:{ field:[msg] } }
    // or { success:false, message:'Super admin accounts cannot be modified through this endpoint.' }
    // throwApiError preserves data so the client can show the correct message.
    throwApiError(error, 'Failed to update admin account')
  }
})



