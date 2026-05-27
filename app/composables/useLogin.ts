import { useToast } from '@nuxt/ui/composables'
import { isAbortError } from '~/util/apiHelper'

export const useLogin = async (credentials: { email: string, password: string, role: string }) => {
  const toast = useToast()
  const { fetch: refreshSession } = useUserSession()

  // Use a client-side only state to manage the abort controller
  const controller = useState<AbortController | null>('login-controller', () => null)

  if (import.meta.client) {
    controller.value?.abort()
    controller.value = new AbortController()
  }

  let response: { status: number, message: string }
  try {
    response = await $fetch('/api/login', {
      method: 'POST',
      body: credentials,
      signal: controller.value?.signal
    })

    if (response.status === 200) {
      toast.add({
        title: 'Success',
        description: response.message,
        icon: 'i-lucide-check',
        color: 'success',
        duration: 3000
      })

      // Refresh the session on client-side and redirect to the home page
      await refreshSession()

      let redirectUrl = ''
      if (credentials.role) {
        const authRedirect = window.localStorage.getItem('auth_redirect')
        if (authRedirect === 'message_redirect') {
          window.localStorage.removeItem('auth_redirect')
          redirectUrl = credentials.role === 'lawyers' ? '/lawyer/messages/new' : '/client/messages/new'
        }
      }

      if (redirectUrl) {
        await navigateTo(redirectUrl)
      } else if (credentials.role === 'lawyers') {
        await navigateTo('/lawyer/dashboard')
      } else {
        await navigateTo(credentials.role == 'clients' ? '/dashboard' : '/lawyer/dashboard')
      }
    } else {
      toast.add({
        title: 'Error',
        description: response.message,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
    }
  } catch (error) {
    if (isAbortError(error)) return

    toast.add({
      title: 'Error',
      description: 'An error occurred.',
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 3000
    })
    console.log(error)
  }

  return useState('login', () => response)
}
