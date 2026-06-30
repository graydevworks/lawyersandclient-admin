import { isAbortError, extractErrorMessage, resolveApiError } from '~/util/apiHelper'
import { useUser } from '#imports'

export const usePracticeArea = () => {
  const toast = useToast()
  const loading = ref(false)
  const updating = ref(false)
  const { getUser } = useUser()

  const queryController = ref<AbortController | null>(null)
  const mutationController = ref<AbortController | null>(null)

  let response: { status: number, message: string }

  const getPracticeArea = async (params: Record<string, string | number | boolean | null | undefined> = {}) => {
    queryController.value?.abort()
    queryController.value = new AbortController()

    loading.value = true
    try {
      const data = await $fetch('/api/practice-area', {
        method: 'GET',
        signal: queryController.value.signal,
        query: params
      })
      return { success: true, data }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to load practice areas.')
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

  const getLawyerPracticeAreas = async () => {
    queryController.value?.abort()
    queryController.value = new AbortController()

    loading.value = true
    try {
      const data = await $fetch('/api/v1/lawyers/practice-area', {
        method: 'GET',
        signal: queryController.value.signal
      })
      return { success: true, data }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to load practice areas.')
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

  /**
   * Submit an array of practice area IDs to the lawyers practice-area endpoint.
   * @param ids Array of numeric practice area IDs
   */
  const savePracticeAreas = async (ids: number[]) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      const formData = new FormData()
      ids.forEach(id => formData.append('practice_areas[]', String(id)))

      response = await $fetch('/api/v1/lawyers/practice-area', {
        method: 'POST',
        body: formData,
        signal: mutationController.value.signal
      })

      toast.add({
        title: 'Success',
        description: response.message || 'Practice areas saved successfully',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })

      await getUser()
      return { success: true, data: response }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to save practice areas.')
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
    getPracticeArea,
    searchPracticeArea: async (query: Record<string, unknown> = {}) => {
      loading.value = true
      try {
        const data = await $fetch('/api/practice-area/search', {
          method: 'GET',
          query
        })
        return { success: true, data }
      } catch (error) {
        return { success: false, ...resolveApiError(error, 'Failed to search practice areas.') }
      } finally {
        loading.value = false
      }
    },
    createPracticeArea: async (body: Record<string, unknown>) => {
      updating.value = true
      try {
        const formData = new FormData()
        // backend expects multipart/form-data (readFormData)
        for (const [key, value] of Object.entries(body)) {
          if (value === undefined || value === null) continue
          formData.append(key, String(value))
        }

        const data = await $fetch('/api/practice-area', {
          method: 'POST',
          body: formData
        })
        return { success: true, data }
      } catch (error) {
        return { success: false, ...resolveApiError(error, 'Failed to create practice area.') }
      } finally {
        updating.value = false
      }
    },
    updatePracticeArea: async (id: string | number, body: Record<string, unknown>) => {
      updating.value = true
      try {
        const data = await $fetch(`/api/practice-area/${id}`, {
          method: 'PUT',
          body
        })
        return { success: true, data }
      } catch (error) {
        return { success: false, ...resolveApiError(error, 'Failed to update practice area.') }
      } finally {
        updating.value = false
      }
    },
    deletePracticeArea: async (id: string | number) => {
      updating.value = true
      try {
        const data = await $fetch(`/api/practice-area/${id}`, {
          method: 'DELETE'
        })
        return { success: true, data }
      } catch (error) {
        return { success: false, ...resolveApiError(error, 'Failed to delete practice area.') }
      } finally {
        updating.value = false
      }
    },
    togglePracticeArea: async (id: string | number, body: Record<string, unknown> = {}) => {
      updating.value = true
      try {
        const formData = new FormData()
        const next = body?.is_active

        // backend reads form-data; send is_active explicitly as 1/0
        if (typeof next === 'boolean') formData.append('is_active', next ? '1' : '0')
        else if (next !== undefined && next !== null) formData.append('is_active', String(next))

        const data = await $fetch(`/api/practice-area/${id}/toggle`, {
          method: 'PUT',
          body: formData
        })
        return { success: true, data }
      } catch (error) {
        return { success: false, ...resolveApiError(error, 'Failed to toggle practice area.') }
      } finally {
        updating.value = false
      }
    },
    getLawyerPracticeAreas,
    savePracticeAreas
  }
}
