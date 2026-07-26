import { useToast } from '@nuxt/ui/composables'
import { resolveApiError } from '~/util/apiHelper'

interface LoginCredentials {
  email: string
  password: string
  role: string
}

/**
 * useAuth — central authentication composable.
 * Provides login(), logout(), and reactive auth state.
 */
export const useAuth = () => {
  const { loggedIn, user, fetch: refreshSession, clear: clearSession } = useUserSession()
  const toast = useToast()

  const isAuthenticated = computed(() => loggedIn.value)
  const currentUser = computed(() => user.value)

  /**
   * Login with email, password and role.
   * On success: refreshes session, shows toast, and navigates to the appropriate dashboard.
   * On failure: shows error toast with a user-friendly message.
   */
  const login = async (credentials: LoginCredentials) => {
    try {

      const response: { status: number, message: string, data?: Record<string, unknown>, requires_2fa?: boolean } = await $fetch('/api/login', {
        method: 'POST',
        body: credentials
      })

      if (response.requires_2fa) {
        await navigateTo({ path: '/verify-2fa', query: { email: credentials.email } })
        return { success: true, requires_2fa: true }
      }

      if (response.status === 200) {
        toast.add({
          title: 'Welcome back',
          description: response.message || 'Login successful.',
          icon: 'i-lucide-check-circle',
          color: 'success',
          duration: 3000
        })

        await refreshSession()

        // Determine redirect based on role
        if (credentials.role === 'admin') {
          await navigateTo('/dashboard')
        } else if (credentials.role === 'lawyers') {
          await navigateTo('/lawyer/dashboard')
        } else {
          await navigateTo('/dashboard')
        }

        return { success: true, message: response.message }
      } else {
        const errorMsg = response.message || 'Invalid email or password. Please try again.'
        toast.add({
          title: 'Login failed',
          description: errorMsg,
          icon: 'i-lucide-alert-circle',
          color: 'error',
          duration: 4000
        })
        return { success: false, error: errorMsg }
      }
    } catch (error) {
      const { error: message, validationMessages } = resolveApiError(error, 'Unable to connect to the server. Please check your internet connection and try again.')

      toast.add({
        title: 'Login failed',
        description: validationMessages[0] || message,
        icon: 'i-lucide-wifi-off',
        color: 'error',
        duration: 4000
      })

      return { success: false, error: validationMessages[0] || message }
    }
  }

  /**
   * Logout the current user.
   * Calls server /api/logout to clear the auth_token cookie and session,
   * then clears client-side session, shows toast, and navigates to /login.
   */
  const logout = async () => {
    try {
      // Call server-side logout to clear auth_token cookie and server session
      await $fetch('/api/logout', { method: 'POST' })

      // Clear the client-side session
      await clearSession()

      toast.add({
        title: 'Signed out',
        description: 'You have been logged out successfully.',
        icon: 'i-lucide-log-out',
        color: 'success',
        duration: 3000
      })

      await navigateTo('/login')
    } catch (error) {
      // Even if server call fails, still try to clear client session and redirect
      await clearSession().catch(() => {})

      toast.add({
        title: 'Signed out',
        description: 'You have been logged out.',
        icon: 'i-lucide-log-out',
        color: 'success',
        duration: 3000
      })

      await navigateTo('/login')
      console.error('[useAuth] Logout error:', error)
    }
  }

  return {
    isAuthenticated,
    currentUser,
    login,
    logout
  }
}
