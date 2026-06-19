type ReportQuery = Record<string, string | number | boolean | null | undefined>

export const useReports = () => {
  const loading = ref(false)
  const updating = ref(false)

  const getReports = async (params: ReportQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/report', { method: 'GET', query: params })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const getReport = async (id: string | number) => {
    loading.value = true
    try {
      const data = await $fetch(`/api/report/${id}`, { method: 'GET' })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const updateReport = async (id: string | number, body: Record<string, unknown>) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/report/${id}`, { method: 'PUT', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const resolveReport = async (id: string | number, body: Record<string, unknown>) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/report/${id}/resolution`, { method: 'POST', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    } finally {
      updating.value = false
    }
  }

  const getReportStats = async () => {
    loading.value = true
    try {
      const data = await $fetch('/api/report/stats', { method: 'GET' })
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
    getReports,
    getReport,
    updateReport,
    resolveReport,
    getReportStats
  }
}
