import * as v from 'valibot'
import { searchSchema } from '~/schema/searchSchema'
import { isAbortError } from '~/util/apiHelper'

export const useCases = () => {
  const toast = useToast()
  const loading = ref(false)
  const updating = ref(false)
  const { user, fetch: refreshSession } = useUserSession()
  let response: { status: number, message: string }

  const controller = ref<AbortController | null>(null)
  // Manage abort controllers for queries and mutations
  const queryController = ref<AbortController | null>(null)
  const mutationController = ref<AbortController | null>(null)

  const getRole = () => user.value?.role || 'clients'
  const getApiUrl = (path = '') => `/api/v1/${getRole()}/cases${path}`

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
        description: 'Failed to load events.',
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

      const data = await $fetch(getApiUrl(), {
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
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(getApiUrl(), {
        method: 'POST',
        body: formData,
        signal: mutationController.value.signal
      })

      if (response.status === 200) {
        toast.add({
          title: 'Success',
          description: response.message,
          icon: 'i-lucide-check-circle',
          color: 'success',
          duration: 3000
        })

        return { success: true, data: response }
      } else {
        toast.add({
          title: 'Error',
          description: response.message,
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
        description: 'Failed to update profile.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const deleteCase = async (id: string | number) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(getApiUrl(`/${id}`), {
        method: 'DELETE',
        signal: mutationController.value.signal
      })

      if (response.status === 200) {
        toast.add({
          title: 'Success',
          description: response.message || 'Case deleted successfully',
          icon: 'i-lucide-check-circle',
          color: 'success',
          duration: 3000
        })

        return { success: true, data: response }
      } else {
        toast.add({
          title: 'Error',
          description: response.message || 'Failed to delete case',
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
        description: 'Failed to delete case.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const updateCaseStatus = async (id: string | number, status: string) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(getApiUrl(`/${id}`), {
        method: 'PUT',
        body: { status },
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
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(getApiUrl(`/${id}/documents`), {
        method: 'POST',
        body: formData,
        signal: mutationController.value.signal
      })

      if (response.status === 200) {
        toast.add({
          title: 'Success',
          description: response.message || 'Document uploaded successfully',
          icon: 'i-lucide-check-circle',
          color: 'success',
          duration: 3000
        })

        return { success: true, data: response }
      } else {
        toast.add({
          title: 'Error',
          description: response.message || 'Failed to upload document',
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
        description: 'Failed to upload document.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const getCaseDocuments = async (id: string | number) => {
    controller.value?.abort()
    controller.value = new AbortController()

    loading.value = true
    try {
      const data = await $fetch(getApiUrl(`/${id}/documents`), {
        method: 'GET',
        signal: controller.value.signal
      })

      return { success: true, data }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      console.error('Get case documents error:', error)
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const deleteCaseDocument = async (caseId: string | number, documentId: string | number) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(getApiUrl(`/${caseId}/documents/${documentId}`), {
        method: 'DELETE',
        signal: mutationController.value.signal
      })

      if (response.status === 200) {
        toast.add({
          title: 'Success',
          description: response.message || 'Document deleted successfully',
          icon: 'i-lucide-check-circle',
          color: 'success',
          duration: 3000
        })

        return { success: true, data: response }
      } else {
        toast.add({
          title: 'Error',
          description: response.message || 'Failed to delete document',
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
        description: 'Failed to delete document.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const downloadCaseDocument = async (caseId: string | number, documentId: string | number, fileName: string) => {
    try {
      const blob = await $fetch(getApiUrl(`/${caseId}/documents/${documentId}/download`), {
        method: 'GET',
        responseType: 'blob'
      })

      const url = URL.createObjectURL(blob as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'document'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return { success: true }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      toast.add({
        title: 'Error',
        description: 'Failed to download document.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    }
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
