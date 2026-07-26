import { useToast } from '@nuxt/ui/composables'
import { isAbortError, resolveApiError } from '~/util/apiHelper'

export const useForgotPassword = async (credentials: { email: string, role: string }) => {
  const toast = useToast()

  const controller = useState<AbortController | null>('forgot-password-controller', () => null)
  if (process.client) {
    controller.value?.abort()
    controller.value = new AbortController()
  }

  let response: { status: number, message: string, errMsg?: Record<string, unknown> }
  try {
    response = await $fetch('/api/forgot-password', {
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

    const { error: errMsg } = resolveApiError(error, 'Failed to send reset email. Please try again.')
    response = { status: 500, message: errMsg }
    toast.add({
      title: 'Error',
      description: errMsg,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 3000
    })
  }

  return useState('forgotPassword', () => response)
}

export const useResetPassword = async (credentials: { email: string, otp: string, password: string, passwordConfirmation: string, role: string }) => {
  const toast = useToast()

  const controller = useState<AbortController | null>('reset-password-controller', () => null)
  if (process.client) {
    controller.value?.abort()
    controller.value = new AbortController()
  }

  let response: { status: number, message: string, errMsg?: Record<string, unknown> }
  try {
    response = await $fetch('/api/reset-password', {
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

      // Redirect to login after successful password reset
      await navigateTo(credentials.role == 'clients' ? '/dashboard' : '/lawyer/dashboard')
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

    const { error: errMsg } = resolveApiError(error, 'Failed to reset password. Please try again.')
    response = { status: 500, message: errMsg }
    toast.add({
      title: 'Error',
      description: errMsg,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 3000
    })
  }
  return useState('resetPassword', () => response)
}
