import { ref } from 'vue'
import { resolveApiError } from '~/util/apiHelper'
import type { UpdateTicketPayload, ResolutionNotePayload } from '~/types/tickets'

type TicketQuery = Record<string, string | number | boolean | null | undefined>

export const useTickets = () => {
  const loading = ref(false)
  const updating = ref(false)

  const getTickets = async (params: TicketQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/admin/ticket', { method: 'GET', query: params })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to fetch tickets') }
    } finally {
      loading.value = false
    }
  }

  const getTicket = async (id: string | number) => {
    loading.value = true
    try {
      const data = await $fetch(`/api/admin/ticket/${id}`, { method: 'GET' })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to fetch ticket details') }
    } finally {
      loading.value = false
    }
  }

  const updateTicket = async (id: string | number, body: UpdateTicketPayload) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/admin/ticket/${id}`, { method: 'PUT', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to update ticket') }
    } finally {
      updating.value = false
    }
  }

  const addResolutionNote = async (id: string | number, body: ResolutionNotePayload) => {
    updating.value = true
    try {
      const data = await $fetch(`/api/admin/tickets/${id}/resolution-note`, { method: 'POST', body })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to add resolution note') }
    } finally {
      updating.value = false
    }
  }

  const getTicketStats = async (params: TicketQuery = {}) => {
    loading.value = true
    try {
      const data = await $fetch('/api/admin/ticket/stats', { method: 'GET', query: params })
      return { success: true, data }
    } catch (error) {
      return { success: false, ...resolveApiError(error, 'Failed to fetch ticket stats') }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    updating,
    getTickets,
    getTicket,
    updateTicket,
    addResolutionNote,
    getTicketStats
  }
}
