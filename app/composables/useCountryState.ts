export const useCountryState = () => {
  const toast = useToast()
  const loading = ref(false)

  const getStates = async () => {
    loading.value = true
    try {
      const states = await $fetch('/api/states', { method: 'GET' })
      return { success: true, data: { states } }
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'Failed to load states.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    getStates
  }
}
