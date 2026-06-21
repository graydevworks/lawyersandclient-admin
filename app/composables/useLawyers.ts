import { useToast } from '@nuxt/ui/composables'

// export const showLawyer = () => {
//   return useState('lawyer', () => null)
// }

// export const updateLawyer = () => {
//   return useState('lawyer', () => null)
// }

// export const deleteLawyer = () => {
//   return useState('lawyer', () => null)
// }

// export const logoutLawyer = () => {
//   return useState('lawyer', () => null)
// }

export const useLawyers = () => {
  const toast = useToast()
  const loading = ref(false)
  const updating = ref(false)

  const getLawyers = async (params: Record<string, string | number | boolean | null | undefined> = {}) => {
    loading.value = true
    try {
      const lawyers = await $fetch('/api/lawyer', { method: 'GET', query: params })
      return { success: true, data: { lawyers } }
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'Failed to load lawyers.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const showLawyers = async (id: number | string) => {
    loading.value = true
    try {
      const lawyers = await $fetch('/api/lawyer/' + id, { method: 'GET' })
      return { success: true, data: { lawyers } }
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'Failed to load lawyer details.',
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const saveLawyer = async (id: number | string) => {
    updating.value = true
    try {
      const response = await $fetch(`/api/lawyer/${id}`, { method: 'GET' })
      toast.add({
        title: 'Saved!',
        description: response.message || 'Lawyer saved successfully.',
        icon: 'i-lucide-bookmark-check',
        color: 'success',
        duration: 3000
      })
      return { success: true, data: response }
    } catch (error: unknown) {
      const errMsg = (error as Record<string, unknown>)?.data
        ? ((error as Record<string, unknown>).data as Record<string, unknown>)?.message as string
        : 'Failed to save lawyer.'
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const searchLawyers = async (query: Record<string, unknown> = {}) => {
    loading.value = true
    try {
      const lawyers = await $fetch('/api/lawyer/search', { method: 'GET', query })
      return { success: true, data: { lawyers } }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const suspendLawyer = async (id: number | string, reason?: string) => {
    updating.value = true
    try {
      const body = new FormData()
      if (reason) body.append('reason', reason)
      const response = await $fetch(`/api/lawyer/${id}/suspend`, { method: 'POST', body })
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const reinstateLawyer = async (id: number | string) => {
    updating.value = true
    try {
      const response = await $fetch(`/api/lawyer/${id}/reinstate`, { method: 'POST' })
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const resetLawyerPassword = async (id: number | string) => {
    updating.value = true
    try {
      const response = await $fetch(`/api/lawyer/${id}/reset-password`, { method: 'POST' })
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const deleteLawyer = async (id: number | string) => {
    updating.value = true
    try {
      const response = await $fetch(`/api/lawyer/${id}`, { method: 'DELETE' })
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const getLawyerDocument = async (id: number | string) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/lawyer/${id}/document`, { method: 'GET' })
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    updating,
    getLawyers,
    showLawyers,
    saveLawyer,
    searchLawyers,
    suspendLawyer,
    reinstateLawyer,
    resetLawyerPassword,
    deleteLawyer,
    getLawyerDocument
  }
}
