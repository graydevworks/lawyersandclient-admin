import { isAbortError, extractErrorMessage, resolveApiError } from '~/util/apiHelper'

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

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to load notifications.')
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

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to load notification.')
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

      return { success: true, data: response }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }
      return { success: false, ...resolveApiError(error, 'Failed to mark notification as read.') }
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

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to fetch notification stats.')
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
    loading,
    updating,
    getNotifications,
    getNotification,
    markAsRead,
    getNotificationStats
  }
}
