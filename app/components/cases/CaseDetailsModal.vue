<script setup lang="ts">
/**
 * CaseDetailsModal — case detail view with Suspend / Reinstate actions.
 */
import { displayApiError } from '~/util/apiHelper'
import SharedErrorModal from '~/components/shared/ErrorModal.vue'

interface CaseDetails {
  id: string
  matter: string
  category: string
  client: {
    name: string
    location: string
  }
  lawyer: {
    name: string
    location: string
  }
  practiceArea: string
  status: string
  openedDate: string
  timeElapsed: string
  lastActivity: string
}

const props = defineProps<{
  modelValue: boolean
  caseData: CaseDetails | null
}>()

const emit = defineEmits(['update:modelValue', 'status-changed'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const { updateCaseStatus, updating } = useCases()

const showSuspendConfirm = ref(false)
const showSuccessModal = ref(false)
const suspendReason = ref('')
const suspendErrors = ref<string[]>([])
const successTitle = ref('')
const successDescription = ref('')

const showErrorModal = ref(false)
const errorTitle = ref('Error')
const errorDescription = ref('')

const confirmSuspend = async () => {
  if (!props.caseData?.id || !suspendReason.value.trim()) return

  suspendErrors.value = []

  const result = await updateCaseStatus(props.caseData.id, 'suspended', suspendReason.value.trim())

  if (result?.success) {
    showSuspendConfirm.value = false
    suspendReason.value = ''
    suspendErrors.value = []
    successTitle.value = 'Case suspended successfully'
    successDescription.value = 'This case has been suspended. You can reinstate it later.'
    showSuccessModal.value = true
    emit('status-changed')
    return
  }

  const msg = displayApiError(result, 'Failed to suspend case.')
  suspendErrors.value = result?.validationMessages?.length ? result.validationMessages : [msg]
  errorTitle.value = 'Unable to suspend case'
  errorDescription.value = msg
  showErrorModal.value = true
}

const confirmReinstate = async () => {
  if (!props.caseData?.id) return

  const result = await updateCaseStatus(props.caseData.id, 'active')

  if (result?.success) {
    successTitle.value = 'Case reinstated successfully'
    successDescription.value = 'This case is active again.'
    showSuccessModal.value = true
    emit('status-changed')
    return
  }

  const msg = displayApiError(result, 'Failed to reinstate case.')
  errorTitle.value = 'Unable to reinstate case'
  errorDescription.value = msg
  showErrorModal.value = true
}

const handleSuccessComplete = () => {
  showSuccessModal.value = false
  isOpen.value = false
}

const isSuspended = computed(() => {
  const s = (props.caseData?.status || '').toLowerCase()
  return s.includes('suspend')
})

const handleActionClick = () => {
  if (isSuspended.value) {
    confirmReinstate()
  } else {
    suspendReason.value = ''
    suspendErrors.value = []
    showSuspendConfirm.value = true
  }
}

const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'primary' | 'neutral' => {
  switch (status?.toLowerCase()) {
    case 'accepted': return 'success'
    case 'suspended': return 'error'
    case 'open': return 'warning'
    case 'declined': return 'error'
    case 'pending': return 'warning'
    case 'completed': return 'neutral'
    default: return 'neutral'
  }
}
</script>

<template>
  <SharedBaseModal
    v-model="isOpen"
    title="Case details"
    max-width="max-w-[520px]"
  >
    <template v-if="caseData">
      <div class="mt-3 mb-6">
        <h4 class="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-2">
          Matter
        </h4>
        <h3 class="text-[16px] font-bold text-gray-900 leading-tight mb-1">
          {{ caseData.matter }}
        </h3>
        <p class="text-[12px] font-medium text-gray-400 uppercase tracking-widest">
          {{ caseData.category }}
        </p>
      </div>

      <div class="mb-6">
        <h4 class="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-3">
          Parties
        </h4>
        <div class="space-y-0">
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-[#3C475D]">Client</span>
            <span class="text-gray-900 font-semibold">{{ caseData.client.name }} · {{ caseData.client.location }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-[#3C475D]">Lawyer</span>
            <span class="text-gray-900 font-semibold">{{ caseData.lawyer.name }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3">
            <span class="text-[#3C475D]">Practice area</span>
            <span class="text-gray-900 font-semibold">{{ caseData.practiceArea }}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Activity
        </h4>
        <div class="space-y-0">
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-[#3C475D]">Status</span>
            <UBadge
              :color="getStatusColor(caseData.status)"
              variant="subtle"
              class="rounded-full px-3 py-[4px] font-bold text-[12px] capitalize"
            >
              {{ caseData.status }}
            </UBadge>
          </div>
          <div class="flex justify-between items-center text-[14px] py-3 border-b border-gray-100">
            <span class="text-[#3C475D]">Opened</span>
            <span class="text-gray-900 font-semibold">{{ caseData.openedDate }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-[#3C475D]">Days elapsed</span>
            <span class="text-gray-900 font-semibold">{{ caseData.timeElapsed }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3">
            <span class="text-[#3C475D]">Last activity</span>
            <span class="text-gray-900 font-semibold">{{ caseData.lastActivity }}</span>
          </div>
        </div>
      </div>

      <!-- Action button was intentionally commented out in original code -->
    </template>
  </SharedBaseModal>

  <SharedConfirmationModal
    v-model="showSuspendConfirm"
    title="Suspend case?"
    description="Are you sure you want to suspend this case? This will pause all activity."
    icon="i-lucide-flag"
    confirm-text="Continue"
    cancel-text="Cancel"
    confirm-color="danger"
    :loading="updating"
    :confirm-disabled="!suspendReason.trim()"
    @confirm="confirmSuspend"
  >
    <label class="text-[13px] font-semibold text-gray-600 mb-2 block">State reason</label>
    <UTextarea
      v-model="suspendReason"
      placeholder="Enter reason for suspension..."
      :rows="4"
      class="w-full"
      @input="suspendErrors = []"
    />
    <ul
      v-if="suspendErrors.length"
      class="mt-2 space-y-1"
    >
      <li
        v-for="(message, index) in suspendErrors"
        :key="index"
        class="text-sm text-red-600"
      >
        {{ message }}
      </li>
    </ul>
  </SharedConfirmationModal>

  <SharedErrorModal
    v-model="showErrorModal"
    :title="errorTitle"
    :description="errorDescription"
  />

  <SharedSuccessModal
    v-model="showSuccessModal"
    :title="successTitle"
    :description="successDescription"
    @complete="handleSuccessComplete"
  />
</template>

