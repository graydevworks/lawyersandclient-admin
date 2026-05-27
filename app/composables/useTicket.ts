import { ref } from 'vue'
import { isAbortError } from '~/util/apiHelper'

export const useTicket = () => {
  const toast = useToast()
  const loading = ref(false)
  const { user, fetch: refreshSession } = useUserSession()
  const mutationController = ref<AbortController | null>(null)

  const getRole = () => user.value?.role || 'lawyers'

  const createTicket = async (formData: FormData) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    loading.value = true
    try {
      const response: any = await $fetch('/api/ticket', {
        method: 'POST',
        body: formData,
        signal: mutationController.value.signal
      })

      // Standard API check
      if (response.status === 200 || response.success) {
        toast.add({
          title: 'Success',
          description: response.message || 'Ticket submitted successfully',
          icon: 'i-lucide-check-circle',
          color: 'success',
          duration: 3000
        })
        return { success: true, data: response }
      } else {
        toast.add({
          title: 'Error',
          description: response.message || 'Failed to submit ticket',
          icon: 'i-lucide-alert-circle',
          color: 'error',
          duration: 3000
        })
        return { success: false, error: response }
      }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      toast.add({
        title: 'Error',
        description: 'Failed to submit ticket.',
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
    loading,
    createTicket
  }
}
