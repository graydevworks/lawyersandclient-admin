<script setup lang="ts">
/**
 * NewUsersProfileModal — User details modal for new-users page.
 * Supports both clients and lawyers with reset password & suspend actions.
 */

interface UserInfo {
  id: string
  name: string
  contact?: string
  email?: string
  role: string
  status: string
  avatar?: string
  joined: string
  location?: string
}

const props = defineProps<{
  modelValue: boolean
  user: UserInfo | null
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
    case 'pending': return 'warning'
    default: return 'neutral'
  }
}

const statusBadgeColor = computed(() => getStatusColor(props.user?.status || ''))
const isLawyer = computed(() => props.user?.role?.toLowerCase() === 'lawyer')

const { suspendClient, resetClientPassword } = useClients()
const { suspendLawyer, resetLawyerPassword } = useLawyers()
const updating = ref(false)

// Modal state
const showResetConfirm = ref(false)
const showSuspendForm = ref(false)
const showSuccessModal = ref(false)
const successTitle = ref('')
const successDescription = ref('')
const showErrorModal = ref(false)
const errorModalTitle = ref('Error')
const errorModalDescription = ref('')

const suspendReason = ref('')
const suspendReasons = [
  'Abuse / misconduct',
  'Spam or fraudulent activity',
  'Violation of terms of service',
  'Multiple complaints',
  'Other'
]

const userEmail = computed(() => props.user?.email || props.user?.contact || 'user@email.com')
const userName = computed(() => props.user?.name || 'this user')
const roleLabel = computed(() => isLawyer.value ? 'Lawyer' : 'Client')

// const handleResetPassword = () => {
//   showResetConfirm.value = true
// }

const confirmResetPassword = async () => {
  if (!props.user) return
  showResetConfirm.value = false
  updating.value = true
  let result
  if (isLawyer.value) {
    result = await resetLawyerPassword(props.user.id)
  } else {
    result = await resetClientPassword(props.user.id)
  }
  updating.value = false
  if (result.success) {
    successTitle.value = 'Password reset link sent successfully'
    successDescription.value = `Password reset link has been sent to ${userEmail.value}. The user must click the link to reset their password.`
    showSuccessModal.value = true
  } else {
    const errorMessage = (result as any).validationMessages?.[0] || (result as any).error || 'Failed to reset password'
    errorModalTitle.value = 'Error'
    errorModalDescription.value = String(errorMessage)
    showErrorModal.value = true
  }
}

const handleSuspend = () => {
  suspendReason.value = suspendReasons[0]!
  showSuspendForm.value = true
}

const confirmSuspend = async () => {
  if (!props.user) return
  showSuspendForm.value = false
  updating.value = true
  let result
  if (isLawyer.value) {
    result = await suspendLawyer(props.user.id, suspendReason.value)
  } else {
    result = await suspendClient(props.user.id, suspendReason.value)
  }
  updating.value = false
  if (result.success) {
    successTitle.value = 'Account suspended successfully'
    successDescription.value = 'Suspended users cannot log in or interact with the platform. You can reinstate them later.'
    showSuccessModal.value = true
    emit('action-complete')
  } else {
    const errorMessage = (result as any).validationMessages?.[0] || (result as any).error || 'Failed to suspend account'
    errorModalTitle.value = 'Error'
    errorModalDescription.value = String(errorMessage)
    showErrorModal.value = true
  }
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
    <template v-if="user">
      <!-- Profile Header -->
      <div class="flex items-center gap-4 mt-3 mb-6">
        <UAvatar
          :src="user.avatar || `empty?u=${user.id}`"
          :alt="user.name"
          size="lg"
          class="size-[56px]"
        />
        <div>
          <h3 class="text-[18px] font-bold text-gray-900">
            {{ user.name }}
          </h3>
          <p class="text-[13px] text-gray-400">
            {{ roleLabel }} &middot; Joined {{ user.joined }}
          </p>
        </div>
      </div>

      <!-- Account Info Section -->
      <div class="mb-6">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Account Info
        </h4>
        <div class="space-y-0">
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">User ID</span>
            <span class="font-semibold text-gray-900">{{ user.id }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Email</span>
            <span class="text-gray-900">{{ user.email || user.contact || 'N/A' }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Role</span>
            <span class="font-semibold text-gray-900">{{ roleLabel }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Location</span>
            <span class="text-gray-900">{{ user.location || 'N/A' }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3">
            <span class="text-gray-500">Status</span>
            <UBadge
              :color="statusBadgeColor"
              variant="subtle"
              class="rounded-full px-3 py-0.5 font-bold text-[12px] capitalize py-1.5"
            >
              {{ user.status }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <!-- <div class="flex flex-col gap-3">
        <UButton
          block
          :loading="updating"
          class="bg-[#003357] hover:bg-[#004474] text-white font-semibold py-3 rounded-[8px] text-[14px]"
          @click="handleResetPassword"
        >
          Reset password
        </UButton>
        <UButton
          block
          variant="outline"
          color="neutral"
          :loading="updating"
          class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 rounded-[8px] text-[14px] hover:bg-gray-50"
          @click="handleSuspend"
        >
          Suspend account
        </UButton>
      </div> -->
    </template>
  </SharedBaseModal>

  <!-- Reset Password Confirmation -->
  <SharedBaseModal
    v-model="showResetConfirm"
    title="Reset Password"
    max-width="max-w-[440px]"
  >
    <div class="mt-2">
      <p class="text-[14px] text-gray-500 mb-6">
        Send a password reset link to the user's registered email: <span class="font-semibold text-gray-900">{{ userEmail }}</span>
      </p>
      <div class="flex gap-3">
        <UButton
          block
          variant="outline"
          color="neutral"
          class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 rounded-[8px]"
          @click="showResetConfirm = false"
        >
          Cancel
        </UButton>
        <UButton
          block
          :loading="updating"
          class="bg-[#003357] hover:bg-[#004474] text-white font-semibold py-3 rounded-[8px]"
          @click="confirmResetPassword"
        >
          Confirm
        </UButton>
      </div>
    </div>
  </SharedBaseModal>

  <!-- Suspend Account Form -->
  <SharedBaseModal
    v-model="showSuspendForm"
    title="Suspend Account"
    max-width="max-w-[440px]"
  >
    <div class="mt-2">
      <p class="text-[14px] text-gray-500 mb-5">
        Temporarily disable {{ userName }}'s access to the platform. You can reinstate the account anytime.
      </p>
      <label class="text-[13px] font-semibold text-gray-600 mb-2 block">State reason</label>
      <USelect
        v-model="suspendReason"
        :items="suspendReasons"
        class="w-full mb-6"
      />
      <div class="flex gap-3">
        <UButton
          block
          variant="outline"
          color="neutral"
          class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 rounded-[8px]"
          @click="showSuspendForm = false"
        >
          Cancel
        </UButton>
        <UButton
          block
          :loading="updating"
          class="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold py-3 rounded-[8px]"
          @click="confirmSuspend"
        >
          Suspend
        </UButton>
      </div>
    </div>
  </SharedBaseModal>

  <!-- Error Modal -->
  <ErrorModal
    v-model="showErrorModal"
    :title="errorModalTitle"
    :description="errorModalDescription"
    button-text="Dismiss"
  />

  <!-- Success Modal (always on top) -->
  <SharedSuccessModal
    v-model="showSuccessModal"
    :title="successTitle"
    :description="successDescription"
    @complete="handleSuccessComplete"
  />
</template>
