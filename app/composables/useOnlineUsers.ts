import { resolveApiError } from '~/util/apiHelper'

type OnlineQuery = Record<string, string | number | boolean | null | undefined>

export const useOnlineUsers = () => {
  const loading = ref(false)

  const getOnlineUsers = async (params: OnlineQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/online', { method: 'GET', query: params })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to load online users.') }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    getOnlineUsers
  }
}
