<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ middleware: 'auth' })

// --- Fetch practice areas on mount ---
const { getPracticeArea, createPracticeArea, deletePracticeArea, togglePracticeArea } = usePracticeArea()

const skeleton = ref(true)
const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)

const fetchPracticeAreas = async (page: number = 1) => {
  const result = await getPracticeArea({ page, per_page: perPage.value })
  // Map real API data when available
  console.log(result, 'result')
  if (result && result.data && result.data.data && result.data.data.success) {
    console.log(result.data.data.data, 'data')

    const meta = result.data.data.meta
    currentPage.value = meta.current_page || 1
    totalItems.value = meta.total || 0
    totalPages.value = meta.last_page || 1

    practiceAreas.value = result.data.data.data.map((area: { id: number, name: string, lawyers_count: number, is_active: boolean }) => ({
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
const { start } = useIntervalFetch(() => fetchPracticeAreas(currentPage.value), 60000)
onMounted(() => start())

const searchQuery = ref('')

// --- Modal state ---
const isAddModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const lastAddedName = ref('')
const isDeleteConfirmOpen = ref(false)
const deleteItemId = ref<number | null>(null)
const isToggleConfirmOpen = ref(false)
const toggleItemId = ref<number | null>(null)
const toggleItemState = ref(false)

const handleSavePracticeArea = async (name: string) => {
  console.log('[Practice Area] New area:', name)
  const result = await createPracticeArea({ name })
  if (result.success) {
    lastAddedName.value = name
    isAddModalOpen.value = false
    isSuccessModalOpen.value = true
    await fetchPracticeAreas(currentPage.value)
  }
}

const handleDeleteClick = (id: number) => {
  deleteItemId.value = id
  isDeleteConfirmOpen.value = true
}

const confirmDelete = async () => {
  if (deleteItemId.value === null) return
  const result = await deletePracticeArea(deleteItemId.value)
  if (result.success) {
    isDeleteConfirmOpen.value = false
    deleteItemId.value = null
    await fetchPracticeAreas(currentPage.value)
  }
}

const handleToggleClick = (id: number, currentState: boolean) => {
  toggleItemId.value = id
  toggleItemState.value = !currentState
  isToggleConfirmOpen.value = true
}

const confirmToggle = async () => {
  if (toggleItemId.value === null) return
  const result = await togglePracticeArea(toggleItemId.value, { is_active: toggleItemState.value })
  if (result.success) {
    isToggleConfirmOpen.value = false
    toggleItemId.value = null
    await fetchPracticeAreas(currentPage.value)
  }
}

const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchPracticeAreas(currentPage.value)
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchPracticeAreas(currentPage.value)
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchPracticeAreas(page)
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
              :model-value="area.active"
              class="shrink-0"
              :ui="{ base: 'bg-[#013355]! w-[45.71428680419922px]', thumb: 'w-[26px]' }"
              @update:model-value="handleToggleClick(area.id, area.active)"
            />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[14px] text-[#8A9BB1] font-normal">
              {{ area.lawyers }} lawyers
            </span>
            <button
              class="text-[14px] font-semibold text-[#003357] hover:text-red-600 transition-colors"
              @click="handleDeleteClick(area.id)"
            >
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
      <span>Showing {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} practice areas</span>
      <div class="flex items-center gap-1.5">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-heroicons-arrow-left"
          class="font-medium text-gray-500"
          :disabled="currentPage === 1"
          @click="handlePrevPage"
        >
          Prev
        </UButton>
        <UButton
          v-for="page in Math.min(5, totalPages)"
          :key="page"
          :variant="page === currentPage ? 'solid' : 'ghost'"
          :color="page === currentPage ? 'primary' : 'neutral'"
          size="sm"
          class="w-8 h-8 flex items-center justify-center rounded-md font-medium"
          :class="page === currentPage ? 'bg-[#003357] hover:bg-[#004474] text-white' : 'text-gray-500'"
          @click="goToPage(page)"
        >
          {{ page }}
        </UButton>
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          trailing-icon="i-heroicons-arrow-right"
          class="font-medium text-gray-500"
          :disabled="currentPage === totalPages"
          @click="handleNextPage"
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

    <!-- Delete Confirmation Modal -->
    <UModal v-model="isDeleteConfirmOpen">
      <UCard class="rounded-xl">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              Delete Practice Area
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isDeleteConfirmOpen = false"
            />
          </div>
        </template>
        <div class="space-y-4">
          <p class="text-gray-600">
            Are you sure you want to delete this practice area? This action cannot be undone.
          </p>
        </div>
        <template #footer>
          <div class="flex gap-3">
            <UButton
              color="gray"
              @click="isDeleteConfirmOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              color="red"
              @click="confirmDelete"
            >
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Toggle Confirmation Modal -->
    <UModal v-model="isToggleConfirmOpen">
      <UCard class="rounded-xl">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ toggleItemState ? 'Activate' : 'Deactivate' }} Practice Area
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="isToggleConfirmOpen = false"
            />
          </div>
        </template>
        <div class="space-y-4">
          <p class="text-gray-600">
            Are you sure you want to {{ toggleItemState ? 'activate' : 'deactivate' }} this practice area?
          </p>
        </div>
        <template #footer>
          <div class="flex gap-3">
            <UButton
              color="gray"
              @click="isToggleConfirmOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              :color="toggleItemState ? 'green' : 'orange'"
              @click="confirmToggle"
            >
              {{ toggleItemState ? 'Activate' : 'Deactivate' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
