import { extractErrorMessage, resolveApiError } from '~/util/apiHelper'

export const useTwoFactor = () => {
  const loading = ref(false)

  const verifyTwoFactorLogin = async (email: string, otp: string) => {
    loading.value = true
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('otp', otp)
      const data = await $fetch('/api/2fa', { method: 'POST', body: formData })
      return { success: true, data }
    } catch (error: unknown) {
      return { success: false, ...resolveApiError(error, 'Verification failed') }
    } finally {
      loading.value = false
    }
  }

  const enableTwoFactor = async () => {
    loading.value = true
    try {
      const formData = new FormData()
      const data = await $fetch('/api/2fa/verify/enable', { method: 'POST', body: formData })
      return { success: true, data }
    } catch (error: unknown) {
      return { success: false, ...resolveApiError(error, 'Failed to enable 2FA') }
    } finally {
      loading.value = false
    }
  }

  const disableTwoFactor = async (password: string) => {
    loading.value = true
    try {
      const formData = new FormData()
      formData.append('password', password)
      const data = await $fetch('/api/2fa/verify/disable', { method: 'POST', body: formData })
      return { success: true, data }
    } catch (error: unknown) {
      console.log(error, '=>>')
      return { success: false, ...resolveApiError(error, 'Failed to disable 2FA') }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    verifyTwoFactorLogin,
    enableTwoFactor,
    disableTwoFactor,
    setupTwoFactor: verifyTwoFactorLogin,
    verifyTwoFactorEnable: enableTwoFactor,
    verifyTwoFactorDisable: disableTwoFactor
  }
}
