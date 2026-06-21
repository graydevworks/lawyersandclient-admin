type LogsQuery = Record<string, string | number | boolean | null | undefined>

export const useLogs = () => {
  const loading = ref(false)

  const getLogs = async (params: LogsQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/logs', { method: 'GET', query: params })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    getLogs
  }
}
