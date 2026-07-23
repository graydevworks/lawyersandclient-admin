import { isAbortError, extractErrorMessage, resolveApiError } from '~/util/apiHelper'

export const useExperience = () => {
  const toast = useToast()
  const loading = ref(false)
  const updating = ref(false)

  const queryController = ref<AbortController | null>(null)
  const mutationController = ref<AbortController | null>(null)

  let response: { status: number, message: string }

  const getExperiences = async () => {
    queryController.value?.abort()
    queryController.value = new AbortController()

    loading.value = true
    try {
      const data = await $fetch('/api/v1/lawyers/experience', {
        method: 'GET',
        signal: queryController.value.signal
      })
      return { success: true, data }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to load experiences.')
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

  const createExperience = async (formData: FormData) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch('/api/v1/lawyers/experience', {
        method: 'POST',
        body: formData,
        signal: mutationController.value.signal
      })

      toast.add({
        title: 'Success',
        description: response.message || 'Experience saved successfully',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })
      return { success: true, data: response }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to save experience.')
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

  const updateExperience = async (id: string | number, formData: FormData) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(`/api/v1/lawyers/experience/${id}`, {
        method: 'POST',
        body: formData,
        signal: mutationController.value.signal
      })

      toast.add({
        title: 'Success',
        description: response.message || 'Experience updated successfully',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })
      return { success: true, data: response }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to update experience.')
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

  const deleteExperience = async (id: string | number) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(`/api/v1/lawyers/experience/${id}`, {
        method: 'DELETE',
        signal: mutationController.value.signal
      })

      toast.add({
        title: 'Success',
        description: response.message || 'Experience deleted successfully',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })
      return { success: true, data: response }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to delete experience.')
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

  return {
    loading,
    updating,
    getExperiences,
    createExperience,
    updateExperience,
    deleteExperience
  }
}
