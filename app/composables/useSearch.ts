import { extractErrorMessage, resolveApiError } from '~/util/apiHelper'

type SearchParams = Record<string, string | number | boolean | null | undefined>

export const useSearch = () => {
  const toast = useToast()
  const loading = ref(false)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const search = async (url: string, params: SearchParams = {}) => {
    loading.value = true
    try {
      const response = await $fetch(url, {
        method: 'GET',
        query: params
      })

      return { success: true, data: response }
    } catch (error: unknown) {
      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to fetch search results.')
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

  const searchLawyers = (params: SearchParams = {}) => search('/api/lawyer/search', params)
  const searchClients = (params: SearchParams = {}) => search('/api/clients/search', params)
  const searchCases = (params: SearchParams = {}) => search('/api/cases/search', params)
  const searchPracticeAreas = (params: SearchParams = {}) => search('/api/practice-area/search', params)
  const searchVerification = (params: SearchParams = {}) => search('/api/verification/search', params)
  const searchFeaturedLawyers = (params: SearchParams = {}) => search('/api/featured/search', params)

  const debounceSearch = async <T>(
    runner: () => Promise<T>,
    delay = 350
  ): Promise<T> => {
    if (debounceTimer) clearTimeout(debounceTimer)

    return await new Promise((resolve, reject) => {
      debounceTimer = setTimeout(async () => {
        try {
          const result = await runner()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }

  const cancelDebounce = () => {
    if (!debounceTimer) return
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  return {
    loading,
    searchLawyers,
    searchClients,
    searchCases,
    searchPracticeAreas,
    searchVerification,
    searchFeaturedLawyers,
    debounceSearch,
    cancelDebounce
  }
}
