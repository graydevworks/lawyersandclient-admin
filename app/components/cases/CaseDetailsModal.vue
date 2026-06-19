<script setup lang="ts">
/**
 * CaseDetailsModal — case detail view with Suspend Case action.
 * Shows a confirmation dialog before suspending.
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
  status: 'Active' | 'Stalled' | 'Pending' | 'Completed'
  openedDate: string
  timeElapsed: string
  lastActivity: string
}

const props = defineProps<{
  modelValue: boolean
  caseData: CaseDetails | null
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const showSuspendConfirm = ref(false)

const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'primary' | 'neutral' => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success'
    case 'stalled': return 'error'
    case 'pending': return 'warning'
    case 'completed': return 'primary'
    default: return 'neutral'
  }
}

const handleSuspendClick = () => {
  showSuspendConfirm.value = true
}

const confirmSuspend = () => {
  console.log('[Suspend Case] confirmed for:', props.caseData?.id)
  showSuspendConfirm.value = false
  isOpen.value = false
}

const cancelSuspend = () => {
  showSuspendConfirm.value = false
}
</script>

<template>
  <SharedBaseModal
    v-model="isOpen"
    title="Case details"
    max-width="max-w-[520px]"
  >
    <template v-if="caseData">
      <!-- Matter Section -->
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

      <!-- Parties Section -->
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

      <!-- Activity Section -->
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

      <!-- Suspend Case Button -->
      <UButton
        block
        class="bg-[#FF9500] hover:bg-[#E68600] text-white font-semibold py-3 rounded-[8px] text-[14px]"
        @click="handleSuspendClick"
      >
        Suspend case
      </UButton>
    </template>

    <!-- Suspend Confirmation -->
    <div
      v-if="showSuspendConfirm"
      class="mt-4 pt-4 border-t border-gray-100"
    >
      <p class="text-[14px] text-gray-700 font-medium mb-4">
        Are you sure you want to suspend this case? This will pause all activity.
      </p>
      <div class="flex items-center justify-end gap-3">
        <UButton
          variant="outline"
          color="neutral"
          class="border border-[#D1D5DB] text-gray-900 rounded-[8px] px-5 py-2.5 text-[14px] font-medium hover:bg-gray-50"
          @click="cancelSuspend"
        >
          Cancel
        </UButton>
        <UButton
          class="bg-[#FF9500] hover:bg-[#E68600] text-white rounded-[8px] px-5 py-2.5 text-[14px] font-medium"
          @click="confirmSuspend"
        >
          Yes, suspend
        </UButton>
      </div>
    </div>
  </SharedBaseModal>
</template>
