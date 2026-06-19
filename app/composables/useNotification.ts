import { isAbortError } from '~/util/apiHelper'

type NotificationQuery = Record<string, string | number | boolean | null | undefined>

export const useNotification = () => {
  const toast = useToast()
  const loading = ref(false)
  const updating = ref(false)

  const queryController = ref<AbortController | null>(null)
  const mutationController = ref<AbortController | null>(null)

  let response: { status: number, message: string }

  const getApiUrl = (path = '') => `/api/notifications${path}`

  const getNotifications = async (params: NotificationQuery = {}) => {
    queryController.value?.abort()
    queryController.value = new AbortController()

    loading.value = true
    try {
      const data = await $fetch(getApiUrl(), {
        method: 'GET',
        query: params,
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
      response = await $fetch(getApiUrl(), {
        method: 'POST',
        body: { id },
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

  const getNotificationStats = async (params: NotificationQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/notifications/stats', {
        method: 'GET',
        query: params,
        signal: queryController.value?.signal
      })
      return { success: true, data }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      toast.add({
        title: 'Error',
        description: 'Failed to fetch notification stats.',
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
    updating,
    getNotifications,
    getNotification,
    markAsRead,
    getNotificationStats
  }
}
