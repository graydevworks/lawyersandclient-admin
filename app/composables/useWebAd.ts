export const useWebAd = () => {
  const loading = ref(false)
  const updating = ref(false)

  const getWebAds = async () => {
    loading.value = true
    try {
      const data = await $fetch('/api/web-ad', { method: 'GET' })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const createWebAd = async (body: FormData | Record<string, unknown>) => {
    updating.value = true
    try {
      const data = await $fetch('/api/web-ad', { method: 'POST', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const updateWebAd = async (id: string | number, body: FormData | Record<string, unknown>) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/web-ad/${id}`, { method: 'PUT', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const deleteWebAd = async (id: string | number) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/web-ad/${id}`, { method: 'DELETE' })
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
    getWebAds,
    createWebAd,
    updateWebAd,
    deleteWebAd
  }
}
