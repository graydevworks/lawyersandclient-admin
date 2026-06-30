import { extractErrorMessage, resolveApiError } from '~/util/apiHelper'

type VerificationQuery = Record<string, string | number | boolean | null | undefined>

export const useVerification = () => {
  const loading = ref(false)
  const updating = ref(false)

  const getVerificationQueue = async (params: VerificationQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/verification', { method: 'GET', query: params })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to fetch verification queue') }
    } finally {
      loading.value = false
    }
  }

  const getVerification = async (id: string | number) => {
    loading.value = true
    try {
      const data = await $fetch(`/api/verification/${id}`, { method: 'GET' })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to fetch verification details') }
    } finally {
      loading.value = false
    }
  }

  const getVerificationDocuments = async (id: string | number) => {
    loading.value = true
    try {
      const data = await $fetch(`/api/verification/${id}/documents`, { method: 'GET' })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to fetch verification documents') }
    } finally {
      loading.value = false
    }
  }

  const reviewVerification = async (id: string | number, body: Record<string, unknown>) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/verification/${id}`, { method: 'POST', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to review verification') }
    } finally {
      updating.value = false
    }
  }

  const approveVerification = async (id: string | number) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/verification/${id}/approve`, { method: 'POST' })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to approve verification') }
    } finally {
      updating.value = false
    }
  }

  const declineVerification = async (id: string | number, body: Record<string, unknown> = {}) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/verification/${id}/decline`, { method: 'POST', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to decline verification') }
    } finally {
      updating.value = false
    }
  }

  return {
    loading,
    updating,
    getVerificationQueue,
    getVerification,
    getVerificationDocuments,
    reviewVerification,
    approveVerification,
    declineVerification
  }
}
