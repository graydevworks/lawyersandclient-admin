import { resolveApiError } from '~/util/apiHelper'

type AdminQuery = Record<string, string | number | boolean | null | undefined>

export const useAdmin = () => {
  const loading = ref(false)
  const updating = ref(false)

  // Get general settings
  const getGeneralSettings = async (params: AdminQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/admin', { query: params })
      console.log('[useAdmin] getGeneralSettings response:', data)
      return { success: true, data }
    } catch (error) {
      const { error: errMsg, validationMessages } = resolveApiError(error, 'Failed to load getGeneralSettings.')
      return { success: false, error: errMsg, validationMessages }
    } finally {
      loading.value = false
    }
  }

  // Update general settings
  const updateGeneralSettings = async (formData: FormData) => {
    updating.value = true
    try {
      const data = await $fetch('/api/admin/settings/general', { method: 'POST' as const, body: formData })
      console.log('[useAdmin] updateGeneralSettings response:', data)
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to update general settings.') }
    } finally {
      updating.value = false
    }
  }

  // Get security settings
  const getSecuritySettings = async (params: AdminQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/admin/settings/security', { query: params })
      console.log('[useAdmin] getSecuritySettings response:', data)
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to load security settings.') }
    } finally {
      loading.value = false
    }
  }

  // Update security settings
  const updateSecuritySettings = async (formData: FormData) => {
    updating.value = true
    try {
      const data = await $fetch('/api/admin/settings/security', { method: 'POST' as const, body: formData })
      console.log('[useAdmin] updateSecuritySettings response:', data)
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to update security settings.') }
    } finally {
      updating.value = false
    }
  }

  // Get admin accounts
  const getAdminAccounts = async (params: AdminQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/admin', { query: params })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to load admin accounts.') }
    } finally {
      loading.value = false
    }
  }

  // Create admin account
  const createAdminAccount = async (formData: FormData) => {
    updating.value = true
    try {
      const data = await $fetch('/api/admin', { method: 'post', body: formData })
      console.log('[useAdmin] createAdminAccount response:', data)
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to create admin account.') }
    } finally {
      updating.value = false
    }
  }

  // Update admin account
  const updateAdminAccount = async (id: number, formData: FormData) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/admin/${id}`, { method: 'PUT', body: formData })
      console.log('[useAdmin] updateAdminAccount response:', data)
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to update admin account.') }
    } finally {
      updating.value = false
    }
  }

  // Delete admin account
  const deleteAdminAccount = async (id: number) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/admin/accounts/${id}`, { method: 'DELETE' as const })
      console.log('[useAdmin] deleteAdminAccount response:', data)
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to delete admin account.') }
    } finally {
      updating.value = false
    }
  }

  // Get permissions
  const getPermissions = async (params: AdminQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/admin/permissions', { query: params })
      console.log('[useAdmin] getPermissions response:', data)
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to load permissions.') }
    } finally {
      loading.value = false
    }
  }

  // Update permissions
  const updatePermissions = async (formData: FormData) => {
    updating.value = true
    try {
      const data = await $fetch('/api/admin/permissions', { method: 'POST' as const, body: formData })
      console.log('[useAdmin] updatePermissions response:', data)
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to update permissions.') }
    } finally {
      updating.value = false
    }
  }

  return {
    loading,
    updating,
    getGeneralSettings,
    updateGeneralSettings,
    getSecuritySettings,
    updateSecuritySettings,
    getAdminAccounts,
    createAdminAccount,
    updateAdminAccount,
    deleteAdminAccount,
    getPermissions,
    updatePermissions
  }
}
