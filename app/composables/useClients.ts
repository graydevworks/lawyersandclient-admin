type ClientQuery = Record<string, string | number | boolean | null | undefined>

export const useClients = () => {
  const loading = ref(false)
  const updating = ref(false)

  const getClients = async (params: ClientQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/clients', { method: 'GET', query: params })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const getClient = async (id: string | number) => {
    loading.value = true
    try {
      const data = await $fetch(`/api/clients/${id}`, { method: 'GET' })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const suspendClient = async (id: string | number, reason?: string) => {
    updating.value = true
    try {
      const body = new FormData()
      if (reason) body.append('reason', reason)
      const data = await $fetch(`/api/clients/${id}/suspend`, { method: 'POST', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const reinstateClient = async (id: string | number) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/clients/${id}/reinstate`, { method: 'POST' })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const resetClientPassword = async (id: string | number) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/clients/${id}/reset-password`, { method: 'POST' })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  return {
    loading,
    updating,
    getClients,
    getClient,
    suspendClient,
    reinstateClient,
    resetClientPassword
  }
}
