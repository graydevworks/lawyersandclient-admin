import { useToast } from '@nuxt/ui/composables'
import { isAbortError } from '~/util/apiHelper'

export const useLogout = async () => {
  const toast = useToast()
  const { clear } = useUserSession()

  const controller = useState<AbortController | null>('logout-controller', () => null)
  if (process.client) {
    controller.value?.abort()
    controller.value = new AbortController()
  }

  try {
    // Clear the user session
    await clear({
      signal: controller.value?.signal
    })

    toast.add({
      title: 'Success',
      description: 'You have been logged out successfully.',
      icon: 'i-lucide-check',
      color: 'success',
      duration: 3000
    })

    // Get the role before clearing to determine redirect
    const role = window.localStorage.getItem('role')

    // Clear local storage
    window.localStorage.removeItem('role')

    // Redirect based on role
    if (role === 'clients') {
      await navigateTo('/login')
    } else {
      await navigateTo('/lawyers-login')
    }
  } catch (error) {
    if (isAbortError(error)) return

    toast.add({
      title: 'Error',
      description: 'An error occurred while logging out.',
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 3000
    })
    console.error('Logout error:', error)
  }
}
