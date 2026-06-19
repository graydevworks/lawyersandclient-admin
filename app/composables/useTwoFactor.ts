export const useTwoFactor = () => {
  const loading = ref(false)

  const setupTwoFactor = async (body: Record<string, unknown> = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/2fa', { method: 'POST', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const verifyTwoFactorEnable = async (body: Record<string, unknown>) => {
    loading.value = true
    try {
      const data = await $fetch('/api/2fa/verify/enable', { method: 'POST', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const verifyTwoFactorDisable = async (body: Record<string, unknown>) => {
    loading.value = true
    try {
      const data = await $fetch('/api/2fa/verify/disable', { method: 'POST', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    setupTwoFactor,
    verifyTwoFactorEnable,
    verifyTwoFactorDisable
  }
}
