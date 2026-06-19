type AnalyticsParams = Record<string, string | number | boolean | null | undefined>

export const useAnalytics = () => {
  const loading = ref(false)

  const getAnalytics = async (params: AnalyticsParams = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/analytics', {
        method: 'GET',
        query: params
      })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    getAnalytics
  }
}
