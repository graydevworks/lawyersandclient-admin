import { useToast } from '@nuxt/ui/composables'
import { isAbortError, extractErrorMessage } from '~/util/apiHelper'

export const parseIsAvailable = (value: unknown): boolean => {
  if (value === false || value === 0 || value === '0') return false
  return value === true || value === 1 || value === '1'
}

export const useUser = () => {
  const toast = useToast()
  const loading = useState('user-loading', () => false)
  const updating = useState('user-updating', () => false)
  const { user, fetch: refreshSession } = useUserSession()
  let response: { status: number, message: string }

  // Manage abort controllers for queries and mutations
  const queryController = ref<AbortController | null>(null)
  const mutationController = ref<AbortController | null>(null)

  const getRole = () => user.value?.role || 'lawyers'

  console.log('getRole', getRole(), user.value)
  const getApiUrl = (path = '') => `/api/v1/${getRole()}${path}`

  const applyAvailabilityFromProfile = (profileResponse: { data?: Record<string, unknown> }) => {
    const payload = profileResponse?.data
    const profileData = (payload && typeof payload === 'object' && 'data' in payload
      ? payload.data
      : payload) as Record<string, unknown> | undefined

    if (!profileData || !user.value?.data) return

    user.value.data.is_available = parseIsAvailable(profileData.is_available)
  }

  const isAvailable = computed(() => parseIsAvailable(user.value?.data?.is_available))

  const getUser = async () => {
    queryController.value?.abort()
    queryController.value = new AbortController()

    loading.value = true
    try {
      const profileResponse = await $fetch(getApiUrl(), {
        method: 'GET',
        signal: queryController.value.signal
      })
      applyAvailabilityFromProfile(profileResponse as { data?: Record<string, unknown> })
      await refreshSession()
      applyAvailabilityFromProfile(profileResponse as { data?: Record<string, unknown> })
      return { success: true, data: { user: profileResponse } }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const errMsg = extractErrorMessage(error, 'Failed to load profile.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error: errMsg }
    } finally {
      loading.value = false
    }
  }

  const updateUserProfile = async (formData: FormData) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()
    const { user, fetch: refreshSession } = useUserSession()

    updating.value = true
    try {
      response = await $fetch(getApiUrl(), {
        method: 'POST',
        body: formData,
        signal: mutationController.value.signal
      })

      toast.add({
        title: 'Success',
        description: response.message || 'Profile updated successfully.',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })

      await refreshSession()
      return { success: true, data: response }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const errMsg = extractErrorMessage(error, 'Failed to update profile.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error: errMsg }
    } finally {
      updating.value = false
    }
  }

  const updateUserPassword = async (formData: FormData) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(getApiUrl('/change-password'), {
        method: 'POST',
        body: formData,
        signal: mutationController.value.signal
      })

      toast.add({
        title: 'Success',
        description: response.message || 'Password updated successfully.',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })

      await refreshSession()
      return { success: true, data: response }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const errMsg = extractErrorMessage(error, 'Failed to update password.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error: errMsg }
    } finally {
      updating.value = false
    }
  }

  const getCertificateStatus = async () => {
    queryController.value?.abort()
    queryController.value = new AbortController()

    loading.value = true
    try {
      const user = await $fetch(`/api/v1/${getRole()}/status`, {
        method: 'GET',
        signal: queryController.value.signal
      })
      return { success: true, data: { user } }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const errMsg = extractErrorMessage(error, 'Failed to load profile.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error: errMsg }
    } finally {
      loading.value = false
    }
  }

  const updateBarCertificate = async (formData: FormData) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(`/api/v1/${getRole()}/bar-certificate`, {
        method: 'POST',
        body: formData,
        signal: mutationController.value.signal
      })

      toast.add({
        title: 'Success',
        description: response.message || 'Bar certificate updated successfully.',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })

      return { success: true, data: response }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const errMsg = extractErrorMessage(error, 'Failed to update bar certificate.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error: errMsg }
    } finally {
      updating.value = false
    }
  }

  const uploadGovernmentID = async (formData: FormData) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch(`/api/v1/${getRole()}/government`, {
        method: 'POST',
        body: formData,
        signal: mutationController.value.signal
      })

      toast.add({
        title: 'Success',
        description: response.message || 'Government ID uploaded successfully.',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })

      return { success: true, data: response }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const errMsg = extractErrorMessage(error, 'Failed to upload government ID.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error: errMsg }
    } finally {
      updating.value = false
    }
  }

  const updateAvailability = async (available: boolean) => {
    mutationController.value?.abort()
    mutationController.value = new AbortController()

    updating.value = true
    try {
      response = await $fetch('/api/v1/lawyers/profile/available', {
        method: 'POST',
        body: { available },
        signal: mutationController.value.signal
      })

      toast.add({
        title: 'Success',
        description: response.message || `You are now ${available ? 'available' : 'offline'}`,
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })

      if (user.value?.data && typeof user.value.data === 'object') {
        user.value.data.is_available = parseIsAvailable(available)
      }
      await refreshSession()
      if (user.value?.data && typeof user.value.data === 'object') {
        user.value.data.is_available = parseIsAvailable(available)
      }
      return { success: true, data: response }
    } catch (error) {
      if (isAbortError(error)) return { success: false, aborted: true }

      const errMsg = extractErrorMessage(error, 'Failed to update availability.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error: errMsg }
    } finally {
      updating.value = false
    }
  }

  return {
    loading,
    updating,
    isAvailable,
    getUser,
    getCertificateStatus,
    updateUserProfile,
    updateUserPassword,
    uploadGovernmentID,
    updateBarCertificate,
    updateAvailability
  }
}
