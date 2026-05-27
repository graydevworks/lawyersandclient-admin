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
  const { user, fetch: refreshSession } = useUserSession()

  const getRole = () => user.value?.role || 'clients'
  const getApiUrl = (path = '') => `/api/v1/${getRole()}/cases${path}`

  const getLawyers = async (isPublic: boolean = false) => {
    loading.value = true
    try {
      const url = isPublic ? '/api/public/lawyers' : '/api/lawyer'
      const lawyers = await $fetch(url, { method: 'GET' })
      return { success: true, data: { lawyers } }
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'Failed to load profile.',
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
        description: 'Failed to load profile.',
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
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/lawyers/${id}`, { method: 'POST' })
      toast.add({
        title: 'Saved!',
        description: response.message || 'Lawyer saved to your list.',
        icon: 'i-lucide-bookmark-check',
        color: 'success',
        duration: 3000
      })
      return { success: true, data: response }
    } catch (error: any) {
      toast.add({
        title: 'Error',
        description: error.data?.message || 'Failed to save lawyer.',
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
    getLawyers,
    showLawyers,
    saveLawyer
  }
}
