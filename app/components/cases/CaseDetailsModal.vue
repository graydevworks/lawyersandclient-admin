<script setup lang="ts">
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

const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'primary' | 'neutral' => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success'
    case 'stalled': return 'error'
    case 'pending': return 'warning'
    case 'completed': return 'primary'
    default: return 'neutral'
  }
}
</script>

<template>
  <UModal
    v-model="isOpen"
  >
    <UCard
      class="overflow-hidden"
    >
      <template #header>
        <div class="px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">
            Case details
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            class="-my-1"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div class="p-6 space-y-8">
        <!-- Matter Section -->
        <div>
          <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Matter
          </h4>
          <h2 class="text-xl font-bold text-gray-900 leading-tight mb-1">
            {{ caseData?.matter }}
          </h2>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {{ caseData?.category }}
          </p>
        </div>

        <!-- Parties Section -->
        <div>
          <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Parties
          </h4>
          <div class="space-y-4">
            <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <span class="text-gray-500 font-medium">Client</span>
              <span class="text-gray-900 font-semibold">{{ caseData?.client.name }} · {{ caseData?.client.location }}</span>
            </div>
            <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <span class="text-gray-500 font-medium">Lawyer</span>
              <span class="text-gray-900 font-semibold">{{ caseData?.lawyer.name }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500 font-medium">Practice area</span>
              <span class="text-gray-900 font-semibold">{{ caseData?.practiceArea }}</span>
            </div>
          </div>
        </div>

        <!-- Activity Section -->
        <div>
          <h4 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Activity
          </h4>
          <div class="space-y-4">
            <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <span class="text-gray-500 font-medium">Status</span>
              <UBadge
                :color="getStatusColor(caseData?.status || '')"
                variant="subtle"
                class="rounded-full px-3 py-0.5 font-bold"
              >
                {{ caseData?.status }}
              </UBadge>
            </div>
            <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <span class="text-gray-500 font-medium">Opened</span>
              <span class="text-gray-900 font-semibold">{{ caseData?.openedDate }}</span>
            </div>
            <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <span class="text-gray-500 font-medium">Time elapsed</span>
              <span class="text-gray-900 font-semibold">{{ caseData?.timeElapsed }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-500 font-medium">Last activity</span>
              <span class="text-gray-900 font-semibold">{{ caseData?.lastActivity }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <UButton
          block
          size="lg"
          class="bg-[#FF9500] hover:bg-[#E68600] text-white font-bold py-4 rounded-xl shadow-lg border-0"
        >
          Suspend case
        </UButton>
      </template>
    </UCard>
  </UModal>
</template>
