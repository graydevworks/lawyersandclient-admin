export const useFeatured = () => {
  const loading = ref(false)
  const updating = ref(false)

  const getFeaturedLawyers = async () => {
    loading.value = true
    try {
      const data = await $fetch('/api/featured', { method: 'GET' })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const updateFeaturedLawyers = async (body: FormData | Record<string, unknown>) => {
    updating.value = true
    try {
      // Always send multipart/form-data to match server readFormData()
      let payload: FormData | Record<string, unknown> = body
      if (!(body instanceof FormData)) {
        const fd = new FormData()
        for (const [k, v] of Object.entries(body)) {
          fd.append(k, Array.isArray(v) ? v.join(',') : String(v))
        }
        payload = fd
      }

      const data = await $fetch('/api/featured', { method: 'PUT', body: payload })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const searchFeaturedLawyers = async (query: Record<string, unknown> = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/featured/search', { method: 'GET', query })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    updating,
    getFeaturedLawyers,
    updateFeaturedLawyers,
    searchFeaturedLawyers
  }
}
