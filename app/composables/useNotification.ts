import { isAbortError } from '~/util/apiHelper'

export const useNotification = () => {
  const toast = useToast()
  const loading = ref(false)
  const updating = ref(false)
  const { user } = useUserSession()

  const queryController = ref<AbortController | null>(null)
  const mutationController = ref<AbortController | null>(null)

  let response: { status: number, message: string }

  const getApiUrl = (path = '') => `/api/notifications${path}`

  const getNotifications = async () => {
    queryController.value?.abort()
    queryController.value = new AbortController()

    loading.value = true
    try {
      const data = await $fetch(getApiUrl(), {
        method: 'GET',
        signal: queryController.value.signal
      })
      return { success: true, data }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      toast.add({
        title: 'Error',
        description: 'Failed to load notifications.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const getNotification = async (id: string | number) => {
    queryController.value?.abort()
    queryController.value = new AbortController()

    loading.value = true
    try {
      const data = await $fetch(getApiUrl(`/${id}`), {
        method: 'GET',
        signal: queryController.value.signal
      })
      return { success: true, data }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      toast.add({
        title: 'Error',
        description: 'Failed to load notification.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id: string | number) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(getApiUrl(`/${id}/read`), {
        method: 'POST',
        signal: mutationController.value.signal
      })

      if (response.status === 200) {
        return { success: true, data: response }
      } else {
        return { success: false, error: response }
      }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const markAllAsRead = async () => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(getApiUrl('/read-all'), {
        method: 'POST',
        signal: mutationController.value.signal
      })

      if (response.status === 200) {
        toast.add({
          title: 'Success',
          description: response.message || 'All notifications marked as read',
          icon: 'i-lucide-check-circle',
          color: 'success',
          duration: 3000
        })
        return { success: true, data: response }
      } else {
        toast.add({
          title: 'Error',
          description: response.message || 'Failed to mark notifications as read',
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
        description: 'Failed to mark notifications as read.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  return {
    loading,
    updating,
    getNotifications,
    getNotification,
    markAsRead,
    markAllAsRead
  }
}
