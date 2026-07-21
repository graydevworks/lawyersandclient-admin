<script setup lang="ts">
/**
 * ClientProfileModal — User details modal with Reset Password, Suspend and Reinstate actions.
 */
import { displayApiError } from '~/util/apiHelper'

const { currentUser } = useAuth()

const userRole = computed(() => {
  const u = currentUser.value as Record<string, unknown> | undefined
  const data = u?.data as Record<string, unknown> | undefined
  return data?.role || u?.role || 'Admin'
})

interface ClientInfo {
  id: string
  name: string
  email?: string
  contact?: string
  location?: string
  status: string
  avatar?: string
  joined: string
  lastActive: string
  totalChats?: number
  reportsFiled?: number
}

const props = defineProps<{
  modelValue: boolean
  client: ClientInfo | null
}>()

const emit = defineEmits(['update:modelValue', 'action-complete'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success'
    case 'suspended': return 'error'
    case 'new': return 'secondary'
    default: return 'neutral'
  }
}

const statusBadgeColor = computed(() => getStatusColor(props.client?.status || ''))
const isSuspended = computed(() => (props.client?.status || '').toLowerCase().includes('suspend'))

const { suspendClient, reinstateClient, resetClientPassword, updating } = useClients()

const showResetConfirm = ref(false)
const showSuspendForm = ref(false)
const showReinstateConfirm = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const errorMessage = ref('')
const successTitle = ref('')
const successDescription = ref('')
const successSecondaryText = ref('')
const successButtonText = ref('Complete')

const suspendReason = ref('')
const suspendReasons = [
  'Abuse / misconduct',
  'Spam or fraudulent activity',
  'Violation of terms of service',
  'Multiple complaints',
  'Other'
]

const userEmail = computed(() => props.client?.email || props.client?.contact || 'user@email.com')
const userName = computed(() => props.client?.name || 'this user')

const handleResetPassword = () => {
  showResetConfirm.value = true
}

const confirmResetPassword = async () => {
  if (!props.client) return
  showResetConfirm.value = false
  const result = await resetClientPassword(props.client.id)
  if (result.success) {
    successTitle.value = 'Password reset link sent successfully'
    successDescription.value = `Password reset link has been sent to ${userEmail.value}. The user must click the link to reset their password.`
    successSecondaryText.value = ''
    successButtonText.value = 'Complete'
    showSuccessModal.value = true
  } else {
    errorMessage.value = displayApiError(result.validationMessages[0], 'Failed to send password reset link.')
    showErrorModal.value = true
  }
}

const handleSuspend = () => {
  suspendReason.value = suspendReasons[0]!
  showSuspendForm.value = true
}

const confirmSuspend = async () => {
  if (!props.client) return
  showSuspendForm.value = false
  const result = await suspendClient(props.client.id, suspendReason.value)
  if (result.success) {
    successTitle.value = 'Account suspended successfully'
    successDescription.value = 'Suspended users cannot log in or interact with the platform. You can reinstate them later.'
    successSecondaryText.value = 'Reinstate'
    successButtonText.value = 'Complete'
    showSuccessModal.value = true
    emit('action-complete')
  } else {
    errorMessage.value = displayApiError(result.validationMessages[0], 'Failed to suspend account.')
    showErrorModal.value = true
  }
}

const handleReinstate = () => {
  showReinstateConfirm.value = true
}

const confirmReinstate = async () => {
  if (!props.client) return
  showReinstateConfirm.value = false
  const result = await reinstateClient(props.client.id)
  if (result.success) {
    successTitle.value = 'Account reinstated successfully'
    successDescription.value = 'The user can now log in and interact with the platform again.'
    successSecondaryText.value = ''
    successButtonText.value = 'Complete'
    showSuccessModal.value = true
    emit('action-complete')
  } else {
    errorMessage.value = displayApiError(result.validationMessages[0], 'Failed to reinstate account.')
    showErrorModal.value = true
  }
}

const handleSuccessSecondary = () => {
  showSuccessModal.value = false
  handleReinstate()
}

const handleSuccessComplete = () => {
  showSuccessModal.value = false
  isOpen.value = false
}
</script>

<template>
  <SharedBaseModal
    v-model="isOpen"
    title="User details"
    max-width="max-w-[520px]"
  >
    <template v-if="client">
      <div class="flex items-center gap-4 mt-3 mb-6">
        <UAvatar
          :src="client.avatar || `https://?u=${client.name}`"
          :alt="client.name"
          size="lg"
          class="size-[56px]"
        />
        <div>
          <h3 class="text-[18px] font-bold text-gray-900">
            {{ client.name }}
          </h3>
          <p class="text-[12px] font-light text-gray-400">
            Client since {{ client.joined }}
          </p>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Account Info
        </h4>
        <div class="space-y-0">
          <div class="flex justify-between items-center text-[14px] py-3 border-b border-gray-100">
            <span class="text-gray-500">User ID</span>
            <span class="font-semibold text-gray-900">{{ client.id }}</span>
          </div>
          <div class="flex justify-between items-center text-[14px] py-3 border-b border-gray-100">
            <span class="text-gray-500">Email</span>
            <span class="text-gray-900">{{ client.email || client.contact || 'N/A' }}</span>
          </div>
          <div class="flex justify-between items-center text-[14px] py-3 border-b border-gray-100">
            <span class="text-gray-500">Location</span>
            <span class="text-gray-900">{{ client.location || 'N/A' }}</span>
          </div>
          <div class="flex justify-between items-center text-[14px] py-3">
            <span class="text-gray-500">Status</span>
            <UBadge
              :color="statusBadgeColor"
              variant="subtle"
              class="rounded-full px-3 font-medium text-[14px] capitalize py-[6px]"
            >
              {{ client.status }}
            </UBadge>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Activity
        </h4>
        <div class="space-y-0">
          <div class="flex justify-between items-center text-[14px] py-3 border-b border-gray-100">
            <span class="text-gray-500">Total chats</span>
            <span class="font-semibold text-gray-900">{{ client.totalChats ?? 0 }}</span>
          </div>
          <div class="flex justify-between items-center text-[14px] py-3 border-b border-gray-100">
            <span class="text-gray-500">Reports filed</span>
            <span class="font-semibold text-gray-900">{{ client.reportsFiled ?? 0 }}</span>
          </div>
          <div class="flex justify-between items-center text-[14px] py-3 border-b border-gray-100">
            <span class="text-gray-500">Last active</span>
            <span class="text-gray-900">{{ client.lastActive }}</span>
          </div>
          <div class="flex justify-between items-center text-[14px] py-3">
            <span class="text-gray-500">Joined</span>
            <span class="text-gray-900">{{ client.joined }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3" v-if="userRole == 'super_admin'">
        <!-- <UButton
          block
          :loading="updating"
          class="bg-[#003357] hover:bg-[#004474] text-white font-semibold py-3 rounded-[8px] text-[14px]"
          @click="handleResetPassword"
        >
          Reset password
        </UButton> -->
        <UButton
          v-if="!isSuspended"
          block
          variant="outline"
          color="neutral"
          :loading="updating"
          class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 px-4 rounded-[8px] text-[14px] hover:bg-gray-50 ring-[0.5px] text-left ring-[#E5E7EB] justify-start"
          @click="handleSuspend"
        >
          Suspend account
        </UButton>
        <UButton
          v-else
          block
          variant="outline"
          color="neutral"
          :loading="updating"
          class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 px-4 rounded-[8px] text-[14px] hover:bg-gray-50 ring-[0.5px] text-left justify-start"
          @click="handleReinstate"
        >
          Reinstate account
        </UButton>
      </div>
    </template>
  </SharedBaseModal>

  <SharedResetPasswordModal
    v-model="showResetConfirm"
    :email="userEmail"
    @confirm="confirmResetPassword"
  />

  <SharedConfirmationModal
    v-model="showSuspendForm"
    title="Suspend Account"
    :description="`Temporarily disable ${userName}'s access to the platform. You can reinstate the account anytime.`"
    icon="i-lucide-flag"
    confirm-text="Suspend"
    cancel-text="Cancel"
    confirm-color="danger"
    :loading="updating"
    @confirm="confirmSuspend"
  >
    <label class="text-[13px] font-semibold text-gray-600 mb-2 block">State reason</label>
    <USelect
      v-model="suspendReason"
      :items="suspendReasons"
      class="w-full"
      :content="{ class: 'z-[100000]! important', strategy: 'fixed' }"
    />
  </SharedConfirmationModal>

  <SharedConfirmationModal
    v-model="showReinstateConfirm"
    title="Reinstate account"
    :description="`Restore ${userName}'s access to the platform.`"
    icon="i-lucide-user-check"
    confirm-text="Reinstate"
    cancel-text="Cancel"
    :loading="updating"
    @confirm="confirmReinstate"
  />

  <SharedSuccessModal
    v-model="showSuccessModal"
    :title="successTitle"
    :description="successDescription"
    :button-text="successButtonText"
    :secondary-button-text="successSecondaryText || undefined"
    @secondary="handleSuccessSecondary"
    @complete="handleSuccessComplete"
  />

  <SharedErrorModal
    v-model="showErrorModal"
    :description="errorMessage"
    @complete="showErrorModal = false"
  />
</template>
