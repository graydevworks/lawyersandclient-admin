import { extractErrorMessage } from '~/util/apiHelper'

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
      formData.append('new_password', body.password)
      formData.append('new_password_confirmation', body.password_confirmation)

      const data = await $fetch('/api/change-password', { method: 'POST', body: formData })
      return { success: true, data }
    } catch (error: unknown) {
      const errMsg = extractErrorMessage(error, 'Failed to change password')
      return { success: false, error: errMsg }
    } finally {
      loading.value = false
    }
  }

  return { loading, changePassword }
}
