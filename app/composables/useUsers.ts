import { resolveApiError } from '~/util/apiHelper'

type UsersQuery = Record<string, string | number | boolean | null | undefined>

export const useUsers = () => {
  const toast = useToast()
  const loading = ref(false)

  const getUsers = async (params: UsersQuery = {}) => {
    loading.value = true

    try {
      const user = await $fetch('/api/users', { method: 'GET', query: params })

      return {
        success: true,
        data: {
          user
        }
      }
    } catch (error) {
      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to load users.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      console.error('Get users error:', error)
      return { success: false, error: errMsg, validationMessages }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    getUsers
  }
}
