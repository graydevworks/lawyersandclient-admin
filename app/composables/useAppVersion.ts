import { resolveApiError } from '~/util/apiHelper'

export const useAppVersion = () => {
  const toast = useToast()
  const loading = ref(false)
  const updating = ref(false)

  const getApiUrl = (path = '') => `/api/app-version${path}`

  // GET - Fetch app versions by role
  const getAppVersionsByRole = async (role: 'client' | 'lawyer') => {
    loading.value = true
    try {
      const response = await $fetch<{ status: number, message: string, data: { appVersion: string, forceUpdate: boolean } }>(getApiUrl(`/${role}`), {
        method: 'GET'
      })

      // Normalize response to always return {appVersion, forceUpdate}
      const normalizedData = {
        appVersion: response.data?.appVersion || '',
        forceUpdate: response.data?.forceUpdate ?? false
      }

      return { success: true, data: normalizedData }
    } catch (error) {
      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to load app versions.')
      toast.add({
        title: 'Error',
        description: errMsg,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 3000
      })
      return { success: false, error: errMsg, validationMessages }
    } finally {
      loading.value = false
    }
  }

  // POST - Create a new app version
  const createAppVersion = async (body: FormData | Record<string, unknown>) => {
    updating.value = true
    try {
      const data = await $fetch(getApiUrl(), {
        method: 'POST',
        body
      })
      return { success: true, data }
    } catch (error) {
      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to create app version.')
      return { success: false, error: errMsg, validationMessages }
    } finally {
      updating.value = false
    }
  }

  // PUT - Update an existing app version
  const updateAppVersion = async (id: string | number, body: FormData | Record<string, unknown>) => {
    updating.value = true
    try {
      const data = await $fetch(getApiUrl(`/${id}`), {
        method: 'PUT',
        body
      })
      return { success: true, data }
    } catch (error) {
      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to update app version.')
      return { success: false, error: errMsg, validationMessages }
    } finally {
      updating.value = false
    }
  }

  return {
    loading,
    updating,
    getAppVersionsByRole,
    createAppVersion,
    updateAppVersion
  }
}
