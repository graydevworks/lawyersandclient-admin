import { isAbortError } from '~/util/apiHelper'
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

      toast.add({
        title: 'Error',
        description: 'Failed to load practice areas.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
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

      toast.add({
        title: 'Error',
        description: 'Failed to load practice areas.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
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

      if (response.status === 200) {
        toast.add({
          title: 'Success',
          description: response.message || 'Practice areas saved successfully',
          icon: 'i-lucide-check-circle',
          color: 'success',
          duration: 3000
        })

        await getUser()
        return { success: true, data: response }
      } else {
        toast.add({
          title: 'Error',
          description: response.message || 'Failed to save practice areas',
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
        description: 'Failed to save practice areas.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
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
        return { success: false, error }
      } finally {
        loading.value = false
      }
    },
    createPracticeArea: async (body: Record<string, unknown>) => {
      updating.value = true
      try {
        const data = await $fetch('/api/practice-area', {
          method: 'POST',
          body
        })
        return { success: true, data }
      } catch (error) {
        return { success: false, error }
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
        return { success: false, error }
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
        return { success: false, error }
      } finally {
        updating.value = false
      }
    },
    togglePracticeArea: async (id: string | number, body: Record<string, unknown> = {}) => {
      updating.value = true
      try {
        const data = await $fetch(`/api/practice-area/${id}/toggle`, {
          method: 'PUT',
          body
        })
        return { success: true, data }
      } catch (error) {
        return { success: false, error }
      } finally {
        updating.value = false
      }
    },
    getLawyerPracticeAreas,
    savePracticeAreas
  }
}
