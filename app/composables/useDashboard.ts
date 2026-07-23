import { resolveApiError } from '~/util/apiHelper'

type DashboardQuery = Record<string, string | number | boolean | null | undefined>

export const useDashboard = () => {
  const loading = ref(false)

  const getDashboard = async (params: DashboardQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/dashboard', { method: 'GET', query: params })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to load dashboard.') }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    getDashboard
  }
}
