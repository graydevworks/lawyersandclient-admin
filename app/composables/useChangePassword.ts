export const useChangePassword = () => {
  const loading = ref(false)

  const changePassword = async (body: {
    current_password: string
    password: string
    password_confirmation: string
  }) => {
    loading.value = true
    try {
      const formData = new FormData()
      formData.append('current_password', body.current_password)
      formData.append('password', body.password)
      formData.append('password_confirmation', body.password_confirmation)

      const data = await $fetch('/api/change-password', { method: 'POST', body: formData })
      return { success: true, data }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      return { success: false, error: err?.data?.message || 'Failed to change password' }
    } finally {
      loading.value = false
    }
  }

  return { loading, changePassword }
}
