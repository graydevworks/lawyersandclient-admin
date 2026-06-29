import { useToast } from '@nuxt/ui/composables'
import { extractErrorMessage } from '~/util/apiHelper'

export const useMessage = () => {
  const toast = useToast()
  const loading = ref(false)
  const { user } = useUserSession()

  const getRole = () => (user.value as any)?.role || 'clients'

  const getConversations = async () => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/messages`, { method: 'GET' })
      return { success: true, data: response }
    } catch (error) {
      const errMsg = extractErrorMessage(error, 'Failed to load conversations.')
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

  const createConversation = async (formData: FormData) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/messages`, {
        method: 'POST',
        body: formData
      })
      toast.add({
        title: 'Success',
        description: response.message || 'Conversation created successfully.',
        icon: 'i-lucide-bookmark-check',
        color: 'success',
        duration: 3000
      })
      return { success: true, data: response }
    } catch (error: any) {
      const errMsg = extractErrorMessage(error, 'Failed to create conversation.')
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

  const initiateConversation = async (formData: FormData) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/messages`, {
        method: 'POST',
        body: formData
      })
      toast.add({
        title: 'Success',
        description: response.message || 'Conversation started successfully.',
        icon: 'i-lucide-message-square',
        color: 'success',
        duration: 3000
      })
      // Navigate to messages page after creating conversation
      const conversationId = response?.data?.id || response?.conversation?.id || ''
      await navigateTo({ path: '/messages', query: conversationId ? { id: conversationId } : {} })
      return { success: true, data: response }
    } catch (error: any) {
      const errMsg = extractErrorMessage(error, 'Failed to start conversation.')
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

  const getConversationMessages = async (conversationId: number | string) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/messages/conversations/${conversationId}`, { method: 'GET' })
      return { success: true, data: response }
    } catch (error) {
      const errMsg = extractErrorMessage(error, 'Failed to load conversation messages.')
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

  const sendMessage = async (conversationId: number | string, formData: FormData) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/messages/conversations/${conversationId}`, {
        method: 'POST',
        body: formData
      })
      return { success: true, data: response }
    } catch (error: any) {
      const errMsg = extractErrorMessage(error, 'Failed to send message.')
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

  const uploadFile = async (conversationId: number | string, formData: FormData) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/messages/conversations/${conversationId}/files`, {
        method: 'POST',
        body: formData
      })
      toast.add({
        title: 'Success',
        description: 'File uploaded successfully.',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })
      return { success: true, data: response }
    } catch (error: any) {
      const errMsg = extractErrorMessage(error, 'Failed to upload file.')
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

  const markMessageAsRead = async (messageId: number | string) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/messages/conversations/${messageId}`, {
        method: 'PUT'
      })
      return { success: true, data: response }
    } catch (error: any) {
      const errMsg = extractErrorMessage(error, 'Failed to mark message as read.')
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

  const archiveConversation = async (conversationId: number | string) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/messages/conversations/${conversationId}/archive`, {
        method: 'PUT'
      })
      toast.add({
        title: 'Success',
        description: 'Conversation archived successfully.',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })
      return { success: true, data: response }
    } catch (error: any) {
      const errMsg = extractErrorMessage(error, 'Failed to archive conversation.')
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

  const deleteConversation = async (conversationId: number | string) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/messages/conversations/${conversationId}`, {
        method: 'DELETE'
      })
      toast.add({
        title: 'Success',
        description: 'Conversation deleted successfully.',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })
      return { success: true, data: response }
    } catch (error: any) {
      const errMsg = extractErrorMessage(error, 'Failed to delete conversation.')
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

  const blockConversation = async (conversationId: number | string) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/messages/conversations/${conversationId}/block`, {
        method: 'POST'
      })
      toast.add({
        title: 'Success',
        description: 'Conversation blocked successfully.',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })
      return { success: true, data: response }
    } catch (error: any) {
      const errMsg = extractErrorMessage(error, 'Failed to block conversation.')
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

  const unblockConversation = async (conversationId: number | string) => {
    loading.value = true
    try {
      const response = await $fetch(`/api/v1/${getRole()}/messages/conversations/${conversationId}/block`, {
        method: 'DELETE'
      })
      toast.add({
        title: 'Success',
        description: 'Conversation unblocked successfully.',
        icon: 'i-lucide-check-circle',
        color: 'success',
        duration: 3000
      })
      return { success: true, data: response }
    } catch (error: any) {
      const errMsg = extractErrorMessage(error, 'Failed to unblock conversation.')
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

  return {
    loading,
    getConversations,
    createConversation,
    initiateConversation,
    getConversationMessages,
    sendMessage,
    uploadFile,
    markMessageAsRead,
    archiveConversation,
    deleteConversation,
    blockConversation,
    unblockConversation
  }
}
