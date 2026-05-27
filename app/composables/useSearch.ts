import { isAbortError, createAbortManager } from '~/util/apiHelper'

export const useSearch = () => {
  const toast = useToast()
  const abortManager = createAbortManager()

  const getSearch = async (credentials: { keyword?: string, location?: string, gender?: string, practice_area_id?: number, min_experience?: number, min_rating?: number }, isPublic: boolean = false) => {
    const signal = abortManager.getSignal()

    try {
      const url = isPublic ? '/api/public/search' : '/api/search'
      const response = await $fetch(url, {
        method: 'GET',
        query: { ...credentials },
        signal
      })

      if (response.status === 200) {
        toast.add({
          title: 'Success',
          description: response.message,
          icon: 'i-lucide-check',
          color: 'success',
          duration: 3000
        })

        return { success: true, data: response.data }
      } else {
        toast.add({
          title: 'Error',
          description: response.message,
          icon: 'i-lucide-alert-circle',
          color: 'error',
          duration: 3000
        })
      }
    } catch (error: any) {
      if (isAbortError(error)) {
        return { success: false, aborted: true }
      }

      toast.add({
        title: 'Error',
        description: error.data?.message || 'An error occurred.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    }
  }

  return {
    getSearch,
    abort: abortManager.abort
  }
}
