import { isAbortError } from '~/util/apiHelper'

export const useCases = () => {
  const toast = useToast()
  const loading = ref(false)
  const updating = ref(false)
  let response: { status: number, message: string }

  const controller = ref<AbortController | null>(null)
  // Manage abort controllers for queries and mutations
  const queryController = ref<AbortController | null>(null)
  const mutationController = ref<AbortController | null>(null)

  const getApiUrl = (path = '') => `/api/cases${path}`

  const getCases = async () => {
    controller.value?.abort()
    controller.value = new AbortController()

    loading.value = true

    try {
      const [user] = await Promise.all([
        $fetch(getApiUrl(), {
          method: 'GET',
          signal: controller.value.signal
        })
      ])

      console.log(user)

      return {
        success: true,
        data: {
          user
        }
      }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      toast.add({
        title: 'Error',
        description: 'Failed to load cases.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      console.error('Get event error:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const getCase = async (id: string | number) => {
    controller.value?.abort()
    controller.value = new AbortController()

    loading.value = true

    try {
      const data = await $fetch(getApiUrl(`/${id}`), {
        method: 'GET',
        signal: controller.value.signal
      })

      return { success: true, data }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      toast.add({
        title: 'Error',
        description: 'Failed to load case details.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      console.error('Get case error:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const searchCases = async (params: any) => {
    controller.value?.abort()
    controller.value = new AbortController()

    loading.value = true
    try {
      // Validate params against searchSchema
      // Note: Valibot parse will throw if invalid, or use safeParse
      // const validated = v.parse(searchSchema, params)

      const data = await $fetch('/api/cases/search', {
        method: 'GET',
        query: params,
        signal: controller.value.signal
      })

      return { success: true, data }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      toast.add({
        title: 'Error',
        description: 'Failed to search cases.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const createCase = async (formData: FormData) => {
    return { success: false, error: 'Route not available: use /api/cases endpoints only.' }
  }

  const deleteCase = async (id: string | number) => {
    return { success: false, error: 'Route not available: use suspend/reinstate.' }
  }

  const updateCaseStatus = async (id: string | number, status: string) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      const route = status.toLowerCase() === 'active'
        ? `/api/cases/${id}/reinstate`
        : `/api/cases/${id}/suspend`

      response = await $fetch(route, {
        method: 'POST',
        signal: mutationController.value.signal
      })

      if (response.status === 200) {
        toast.add({
          title: 'Success',
          description: response.message || 'Case updated successfully',
          icon: 'i-lucide-check-circle',
          color: 'success',
          duration: 3000
        })

        return { success: true, data: response }
      } else {
        toast.add({
          title: 'Error',
          description: response.message || 'Failed to update case',
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
        description: 'Failed to update case.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const uploadCaseDocument = async (id: string | number, formData: FormData) => {
    return { success: false, error: 'Route not available for admin API.' }
  }

  const getCaseDocuments = async (id: string | number) => {
    return { success: false, error: 'Route not available for admin API.' }
  }

  const deleteCaseDocument = async (caseId: string | number, documentId: string | number) => {
    return { success: false, error: 'Route not available for admin API.' }
  }

  const downloadCaseDocument = async (caseId: string | number, documentId: string | number, fileName: string) => {
    return { success: false, error: 'Route not available for admin API.' }
  }

  return {
    loading,
    updating,
    getCases,
    getCase,
    searchCases,
    createCase,
    deleteCase,
    updateCaseStatus,
    uploadCaseDocument,
    getCaseDocuments,
    deleteCaseDocument,
    downloadCaseDocument
  }
}
