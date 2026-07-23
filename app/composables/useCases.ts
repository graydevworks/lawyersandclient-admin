import { isAbortError, resolveApiError } from '~/util/apiHelper'

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

  const getCases = async (params: Record<string, string | number | boolean | null | undefined> = {}) => {
    controller.value?.abort()
    controller.value = new AbortController()

    loading.value = true

    try {
      const user = await $fetch(getApiUrl(), {
        method: 'GET',
        query: params,
        signal: controller.value.signal
      })

      return {
        success: true,
        data: {
          user
        }
      }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to load cases.')
      // toast.add({
      //   title: 'Error',
      //   description: errMsg,
      //   icon: 'i-lucide-alert-circle',
      //   color: 'error',
      //   duration: 3000
      // })
      console.error('Get cases error:', error)
      return { success: false, error: errMsg, validationMessages }
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

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to load case details.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      console.error('Get case error:', error)
      return { success: false, error: errMsg, validationMessages }
    } finally {
      loading.value = false
    }
  }

  const searchCases = async (params: any) => {
    controller.value?.abort()
    controller.value = new AbortController()

    loading.value = true
    try {
      const data = await $fetch('/api/cases/search', {
        method: 'GET',
        query: params,
        signal: controller.value.signal
      })

      return { success: true, data }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to search cases.')
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

  const createCase = async (formData: FormData) => {
    return { success: false, error: 'Route not available: use /api/cases endpoints only.' }
  }

  const deleteCase = async (id: string | number) => {
    return { success: false, error: 'Route not available: use suspend/reinstate.' }
  }

  const updateCaseStatus = async (id: string | number, status: string, reason?: string) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      const isReinstate = status.toLowerCase() === 'active' || status.toLowerCase() === 'reinstate'
      const route = isReinstate
        ? `/api/cases/${id}/reinstate`
        : `/api/cases/${id}/suspend`

      const body = isReinstate
        ? undefined
        : (() => {
            const formData = new FormData()
            if (reason) formData.append('reason', reason)
            return formData
          })()

      response = await $fetch(route, {
        method: 'POST',
        body,
        signal: mutationController.value.signal
      })

      toast.add({
        title: 'Success',
        description: response.message || 'Case updated successfully',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })

      return { success: true, data: response }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to update case.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error: errMsg, validationMessages }
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
