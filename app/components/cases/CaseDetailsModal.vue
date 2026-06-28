<script setup lang="ts">
/**
 * CaseDetailsModal — case detail view with Suspend / Reinstate actions.
 */
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
const successTitle = ref('')
const successDescription = ref('')

const isSuspended = computed(() => {
  const s = (props.caseData?.status || '').toLowerCase()
  return s.includes('suspend') || s === 'stalled'
})

const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'primary' | 'neutral' => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success'
    case 'stalled':
    case 'suspended': return 'error'
    case 'pending': return 'warning'
    case 'completed': return 'primary'
    default: return 'neutral'
  }
}

const handleActionClick = () => {
  if (isSuspended.value) {
    confirmReinstate()
  } else {
    suspendReason.value = ''
    showSuspendConfirm.value = true
  }
}

const confirmSuspend = async () => {
  if (!props.caseData?.id || !suspendReason.value.trim()) return

  const result = await updateCaseStatus(props.caseData.id, 'suspended', suspendReason.value.trim())
  if (result?.success) {
    showSuspendConfirm.value = false
    suspendReason.value = ''
    successTitle.value = 'Case suspended successfully'
    successDescription.value = 'This case has been suspended. You can reinstate it later.'
    showSuccessModal.value = true
    emit('status-changed')
  }
}

const confirmReinstate = async () => {
  if (!props.caseData?.id) return

  const result = await updateCaseStatus(props.caseData.id, 'active')
  if (result?.success) {
    successTitle.value = 'Case reinstated successfully'
    successDescription.value = 'This case is active again.'
    showSuccessModal.value = true
    emit('status-changed')
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
    title="Case details"
    max-width="max-w-[520px]"
  >
    <template v-if="caseData">
      <div class="mt-3 mb-6">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Matter
        </h4>
        <h3 class="text-[18px] font-bold text-gray-900 leading-tight mb-1">
          {{ caseData.matter }}
        </h3>
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          {{ caseData.category }}
        </p>
      </div>

      <div class="mb-6">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Parties
        </h4>
        <div class="space-y-0">
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Client</span>
            <span class="text-gray-900 font-semibold">{{ caseData.client.name }} · {{ caseData.client.location }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Lawyer</span>
            <span class="text-gray-900 font-semibold">{{ caseData.lawyer.name }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3">
            <span class="text-gray-500">Practice area</span>
            <span class="text-gray-900 font-semibold">{{ caseData.practiceArea }}</span>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Activity
        </h4>
        <div class="space-y-0">
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Status</span>
            <UBadge
              :color="getStatusColor(caseData.status)"
              variant="subtle"
              class="rounded-full px-3 py-0.5 font-bold text-[12px]"
            >
              {{ caseData.status }}
            </UBadge>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Opened</span>
            <span class="text-gray-900 font-semibold">{{ caseData.openedDate }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Time elapsed</span>
            <span class="text-gray-900 font-semibold">{{ caseData.timeElapsed }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3">
            <span class="text-gray-500">Last activity</span>
            <span class="text-gray-900 font-semibold">{{ caseData.lastActivity }}</span>
          </div>
        </div>
      </div>

      <UButton
        block
        :loading="updating"
        class="font-semibold py-3 rounded-[8px] text-[14px] text-white"
        :class="isSuspended ? 'bg-[#003357] hover:bg-[#004474]' : 'bg-[#FF9500] hover:bg-[#E68600]'"
        @click="handleActionClick"
      >
        {{ isSuspended ? 'Reinstate case' : 'Suspend case' }}
      </UButton>
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
    />
  </SharedConfirmationModal>

  <SharedSuccessModal
    v-model="showSuccessModal"
    :title="successTitle"
    :description="successDescription"
    @complete="handleSuccessComplete"
  />
</template>
