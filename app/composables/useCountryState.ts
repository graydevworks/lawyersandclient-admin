import { resolveApiError } from '~/util/apiHelper'

export const useCountryState = () => {
  const toast = useToast()
  const loading = ref(false)

  const getStates = async () => {
    loading.value = true
    try {
      const states = await $fetch('/api/states', { method: 'GET' })
      return { success: true, data: { states } }
    } catch (error) {
      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to load states.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error: errMsg, validationMessages }
    } finally {
      loading.value = false
    }
  }

  return {
    getStates
  }
}
