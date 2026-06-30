import { extractErrorMessage, resolveApiError } from '~/util/apiHelper'

export const useBanner = () => {
  const loading = ref(false)
  const updating = ref(false)

  const getBanners = async () => {
    loading.value = true
    try {
      const data = await $fetch('/api/banner', { method: 'GET' })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to fetch banners') }
    } finally {
      loading.value = false
    }
  }

  const createBanner = async (body: FormData | Record<string, unknown>) => {
    updating.value = true
    try {
      const data = await $fetch('/api/banner', { method: 'POST', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to create banner') }
    } finally {
      updating.value = false
    }
  }

  const updateBanner = async (id: string | number, body: FormData | Record<string, unknown>) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/banner/${id}`, { method: 'PUT', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to update banner') }
    } finally {
      updating.value = false
    }
  }

  const deleteBanner = async (id: string | number) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/banner/${id}`, { method: 'DELETE' })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to delete banner') }
    } finally {
      updating.value = false
    }
  }

  const reorderBanners = async (body: FormData | Record<string, unknown>) => {
    updating.value = true
    try {
      const data = await $fetch('/api/banner/reorder', { method: 'POST', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to reorder banners') }
    } finally {
      updating.value = false
    }
  }

  return {
    loading,
    updating,
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners
  }
}
