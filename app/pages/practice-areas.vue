<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ middleware: 'auth' })

// --- Fetch practice areas on mount ---
const { getPracticeArea } = usePracticeArea()

const skeleton = ref(true)

const fetchPracticeAreas = async () => {
  const result = await getPracticeArea()
  // Map real API data when available
  console.log(result, 'result')
  if (result && result.data && result.data.data && result.data.data.success) {
    console.log(result.data.data.data, 'data')

    practiceAreas.value = result.data.data.data.map((area: any) => ({
      id: area.id,
      name: area.name,
      lawyers: area.lawyers_count,
      active: area.is_active
    }))
  }
}

onMounted(async () => {
  await fetchPracticeAreas()
  skeleton.value = false
})

// Silent background refresh every 60 seconds
const { start } = useIntervalFetch(fetchPracticeAreas, 60000)
onMounted(() => start())

const searchQuery = ref('')

// --- Modal state ---
const isAddModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const lastAddedName = ref('')

const handleSavePracticeArea = (name: string) => {
  console.log('[Practice Area] New area:', name)
  lastAddedName.value = name
  isAddModalOpen.value = false
  isSuccessModalOpen.value = true
}

const practiceAreas = ref<{
  id: number
  name: string
  lawyers: number
  active: boolean
}[]>([])
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Top Bar -->
    <div class="flex items-center justify-between">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Search practice areas"
        class="w-[400px]"
        size="md"
        :ui="{ base: 'rounded-full' }"
        color="neutral"
      />
      <UButton
        color="primary"
        class="bg-[#003357] hover:bg-[#004474] text-white px-5 py-2.5 rounded-lg text-sm font-medium"
        icon="i-heroicons-plus"
        @click="isAddModalOpen = true"
      >
        Add Practice area
      </UButton>
    </div>

    <!-- Practice Areas Grid -->
    <!-- Skeleton Loading -->
    <template v-if="skeleton">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UCard
          v-for="i in 8"
          :key="i"
          class="rounded-2xl border-0 ring-0"
        >
          <div class="space-y-3">
            <div class="flex justify-between">
              <USkeleton class="h-4 w-2/3" />
              <USkeleton class="h-5 w-10 rounded-full" />
            </div>
            <div class="flex justify-between">
              <USkeleton class="h-4 w-1/3" />
              <USkeleton class="h-4 w-12" />
            </div>
          </div>
        </UCard>
      </div>
    </template>

    <!-- Empty State -->
    <template v-else-if="practiceAreas.length === 0">
      <UCard class="rounded-[18px] border-0 ring-0">
        <SharedEmptyState
          icon="i-lucide-scale"
          title="No practice areas"
          description="There are no practice areas configured yet. Add one to get started."
          action-label="Add Practice Area"
          @action="isAddModalOpen = true"
        />
      </UCard>
    </template>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="area in practiceAreas"
          :key="area.id"
          class="bg-white rounded-2xl p-5 flex flex-col gap-[12.5px]"
        >
          <div class="flex items-start justify-between">
            <h3 class="text-[14px] font-medium text-gray-900 pr-2">
              {{ area.name }}
            </h3>
            <USwitch
              v-model="area.active"
              class="shrink-0"
              :ui="{ base: 'bg-[#013355]! w-[45.71428680419922px]', thumb: 'w-[26px]' }"
            />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[14px] text-[#8A9BB1] font-normal">
              {{ area.lawyers }} lawyers
            </span>
            <button class="text-[14px] font-semibold text-[#003357] hover:text-red-600 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Pagination -->
    <div
      v-if="!skeleton && practiceAreas.length > 0"
      class="flex items-center justify-between text-sm text-gray-500 pt-2"
    >
      <span>Showing 1–10 of 20 practice areas</span>
      <div class="flex items-center gap-1.5">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-heroicons-arrow-left"
          class="font-medium text-gray-500"
        >
          Prev
        </UButton>
        <UButton
          v-for="page in 5"
          :key="page"
          :variant="page === 1 ? 'solid' : 'ghost'"
          :color="page === 1 ? 'primary' : 'neutral'"
          size="sm"
          class="w-8 h-8 flex items-center justify-center rounded-md font-medium"
          :class="page === 1 ? 'bg-[#003357] hover:bg-[#004474] text-white' : 'text-gray-500'"
        >
          {{ page }}
        </UButton>
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          trailing-icon="i-heroicons-arrow-right"
          class="font-medium text-gray-500"
        >
          Next
        </UButton>
      </div>
    </div>

    <!-- Add Practice Area Modal -->
    <PracticeAreaAddModal
      v-model="isAddModalOpen"
      @save="handleSavePracticeArea"
    />

    <!-- Success Confirmation Modal -->
    <SharedSuccessModal
      v-model="isSuccessModalOpen"
      title="Practice area added successfully"
      :description="`'${lastAddedName}' has been added to your practice areas list.`"
    />
  </div>
</template>
