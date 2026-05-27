import { useToast } from '@nuxt/ui/composables'

export const useUsers = () => {
  const toast = useToast()
  const loading = ref(false)

  const getUser = async () => {
    loading.value = true

    try {
      const [user] = await Promise.all([
        $fetch('/api/v1/clients/profile', { method: 'GET' })
      ])

      console.log(user)

      return {
        success: true,
        data: {
          user
        }
      }
    } catch (error) {
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

  return {
    loading,
    getUser
  }
}
