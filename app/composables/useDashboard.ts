export const useDashboard = () => {
  const loading = ref(false)

  const getDashboard = async () => {
    loading.value = true
    try {
      const data = await $fetch('/api/dashboard', { method: 'GET' })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    getDashboard
  }
}
