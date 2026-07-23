import { useToast } from '@nuxt/ui/composables'
import { isAbortError } from '~/util/apiHelper'

export const useRegister = async (credentials: { email: string, password: string, role: string }) => {
  const toast = useToast()
  const { fetch: refreshSession } = useUserSession()

  const controller = useState<AbortController | null>('register-controller', () => null)
  if (process.client) {
    controller.value?.abort()
    controller.value = new AbortController()
  }

  let response: { status: number, message: string }
  try {
    response = await $fetch('/api/register', {
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
      await navigateTo('/verify-token?email=' + credentials.email)
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
  }

  return useState('register', () => response)
}

export const useVerifyToken = async (credentials: { email: string, otp: string, role: string }) => {
  const toast = useToast()
  const { fetch: refreshSession } = useUserSession()

  const controller = useState<AbortController | null>('verify-token-controller', () => null)
  if (process.client) {
    controller.value?.abort()
    controller.value = new AbortController()
  }

  let response: { status: number, message: string }
  try {
    response = await $fetch('/api/verify-token', {
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
      await navigateTo(credentials.role == 'clients' ? '/login' : '/lawyers-login')
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
    if (isAbortError(error)) return { status: 0, message: 'aborted' }

    response = { status: 500, message: 'An error occurred.' }
    toast.add({
      title: 'Error',
      description: 'An error occurred.',
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 3000
    })
  }
  return useState('verifyToken', () => response)
}

export const useResendToken = async (credentials: { email: string, role: string }) => {
  const toast = useToast()
  const { fetch: refreshSession } = useUserSession()

  const controller = useState<AbortController | null>('resend-token-controller', () => null)
  if (process.client) {
    controller.value?.abort()
    controller.value = new AbortController()
  }

  let response: { status: number, message: string }
  try {
    response = await $fetch('/api/reset-token', {
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
    if (isAbortError(error)) return { status: 0, message: 'aborted' }

    response = { status: 500, message: 'An error occurred.' }
    toast.add({
      title: 'Error',
      description: 'An error occurred.',
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 3000
    })
  }
  return useState('resend', () => response)
}
