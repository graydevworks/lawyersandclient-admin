import { isAbortError, createAbortManager } from '~/util/apiHelper'

export const useSavedLawyers = () => {
  const toast = useToast()
  const loading = ref(false)
  const abortManager = createAbortManager()
  const { user, fetch: refreshSession } = useUserSession()

  const getRole = () => user.value?.role || 'clients'
  const getApiUrl = (path = '') => `/api/v1/${getRole()}/cases${path}`

  const getSavedLawyers = async () => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/lawyers`, { method: 'GET' })
      return { success: true, data: response.data }
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error.data?.message || 'Failed to load saved lawyers.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const searchSavedLawyers = async (credentials: { q?: string, state_id?: number, practice_area_id?: number, min_experience?: number, is_available?: boolean }) => {
    const signal = abortManager.getSignal()
    loading.value = true

    try {
      const response = await $fetch(`/api/v1/${getRole()}/lawyers/search`, {
        method: 'GET',
        query: { ...credentials },
        signal
      })

      return { success: true, data: response.data }
    } catch (error: any) {
      if (isAbortError(error)) {
        return { success: false, aborted: true }
      }

      toast.add({
        title: 'Error',
        description: error.data?.message || 'Search failed.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const removeSavedLawyer = async (id: number | string) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/lawyers/${id}`, { method: 'DELETE' })

      toast.add({
        title: 'Success',
        description: 'Lawyer removed from saved list.',
        icon: 'i-lucide-check',
        color: 'success',
        duration: 3000
      })

      return { success: true, data: response.data }
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error.data?.message || 'Failed to remove lawyer.',
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
    getSavedLawyers,
    searchSavedLawyers,
    removeSavedLawyer,
    abort: abortManager.abort
  }
}
