<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { displayApiError } from '~/util/apiHelper'

definePageMeta({ middleware: 'auth' })

const {
  getPracticeArea,
  createPracticeArea,
  deletePracticeArea,
  togglePracticeArea,
  searchPracticeArea
} = usePracticeArea()

const skeleton = ref(true)
const currentPage = ref(1)
const perPage = ref(20)
const totalItems = ref(0)
const totalPages = ref(1)

// Practice Areas pagination numbering (always 5 page numbers, no ellipsis)
const visiblePages = computed((): number[] => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)

  let start = current - 1
  let end = current + 3

  if (start < 1) {
    start = 1
    end = 5
  }

  if (end > total) {
    end = total
    start = total - 4
  }

  return Array.from({ length: 5 }, (_, i) => start + i)
})

const { currentUser } = useAuth()

const userRole = computed(() => {
  const u = currentUser.value as Record<string, unknown> | undefined
  const data = u?.data as Record<string, unknown> | undefined
  return data?.role || u?.role || 'Admin'
})

type PracticeAreaCard = {
  id: number
  name: string
  lawyers: number
  active: boolean
}

const practiceAreas = ref<PracticeAreaCard[]>([])
const listError = ref('')
const hasFetchError = ref(false)

// --- main list fetch ---
const fetchPracticeAreas = async (page: number = 1) => {
  listError.value = ''
  hasFetchError.value = false

  const result = await getPracticeArea({ page, per_page: perPage.value })

  if (!result?.success) {
    listError.value = result.validationMessages[0]
    hasFetchError.value = true
    return
  }

  console.log(result, 'result')
  if (result && result.data && result.data.data && result.data.data.success) {
    const meta = result.data.data.meta
    currentPage.value = meta.current_page || 1
    totalItems.value = meta.total || 0
    totalPages.value = meta.last_page || 1

    practiceAreas.value = result.data.data.data.map((area: {
      id: number
      name: string
      lawyers_count: number
      is_active: boolean
    }) => ({
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

// --- search dropdown only (does NOT affect main grid) ---
const searchQuery = ref('')
const isSearchDropdownOpen = ref(false)
const isSearchingDropdown = ref(false)

const searchResults = ref<PracticeAreaCard[]>([])

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (q) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)

  isSearchDropdownOpen.value = String(q ?? '').trim().length > 0

  searchDebounceTimer = setTimeout(async () => {
    const query = String(q ?? '').trim()

    // hide dropdown when empty
    if (!query) {
      isSearchDropdownOpen.value = false
      searchResults.value = []
      isSearchingDropdown.value = false
      return
    }

    isSearchingDropdown.value = true
    try {
      // requested: use per_page instead of limit, and q= for query
      const result = await searchPracticeArea({ q: query, per_page: 4, page: 1 })

      console.log('[Practice Areas][Dropdown] searchPracticeArea result:', result)
      console.log('[Practice Areas][Dropdown] search raw data:', result?.data.data.data.practice_areas)

      if (result && result.data && result.data.data && result.data.data.success) {
        searchResults.value = result.data.data.data.practice_areas.map((item: {
          id: number
          name: string
          lawyers_count: number
          is_active: boolean
        }) => {
          return {
            id: item.id,
            name: item.name,
            lawyers: item.lawyers_count,
            active: item.is_active
          }
        })
      }
    } finally {
      isSearchingDropdown.value = false
    }
  }, 400)
})

// --- Modal state (unchanged) ---
const isAddModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const lastAddedName = ref('')
const isDeleteConfirmOpen = ref(false)
const deleteItemId = ref<number | null>(null)
const isToggleConfirmOpen = ref(false)
const toggleItemId = ref<number | null>(null)
const toggleItemState = ref(false)

// Error modal state
const showErrorModal = ref(false)
const errorModalTitle = ref('Error')
const errorModalDescription = ref('')

const handleSavePracticeArea = async (name: string) => {
  console.log('[Practice Area] New area:', name)
  const result = await createPracticeArea({ name })
  if (result.success) {
    lastAddedName.value = name
    isAddModalOpen.value = false
    isSuccessModalOpen.value = true
    await fetchPracticeAreas(currentPage.value)
  } else {
    const errorMessage = (result as any).validationMessages?.[0] || (result as any).error || 'Failed to create practice area'
    errorModalTitle.value = 'Error'
    errorModalDescription.value = String(errorMessage)
    showErrorModal.value = true
  }
}

const handleDeleteClick = (id: number) => {
  deleteItemId.value = id
  isDeleteConfirmOpen.value = true
  console.log(id)
}

const confirmDelete = async () => {
  if (deleteItemId.value === null) return
  const result = await deletePracticeArea(deleteItemId.value)
  console.log(result, 'result -> 2')
  if (result.success) {
    searchQuery.value = ''
    isSearchDropdownOpen.value = false
    isDeleteConfirmOpen.value = false
    deleteItemId.value = null
    await fetchPracticeAreas(currentPage.value)
  } else {
    const errorMessage = (result as any).validationMessages?.[0] || (result as any).error || 'Failed to delete practice area'
    errorModalTitle.value = 'Error'
    errorModalDescription.value = String(errorMessage)
    showErrorModal.value = true
  }
}

const handleToggleClick = (id: number, nextState: boolean) => {
  toggleItemId.value = id
  toggleItemState.value = nextState
  isToggleConfirmOpen.value = true
}

const confirmToggle = async () => {
  if (toggleItemId.value === null) return
  const result = await togglePracticeArea(toggleItemId.value, { is_active: toggleItemState.value })

  if (result && result.data && result.data.data && result.data.data.success) {
    const searchFound = searchResults.value.findIndex(area => area.id === toggleItemId.value)
    if (searchFound > -1) {
      isToggleConfirmOpen.value = false
      searchResults.value[searchFound].active = toggleItemState.value
    }

    isToggleConfirmOpen.value = false
    toggleItemId.value = null
    await fetchPracticeAreas(currentPage.value)
  } else {
    const errorMessage = (result as any).validationMessages?.[0] || (result as any).error || 'Failed to toggle practice area status'
    errorModalTitle.value = 'Error'
    errorModalDescription.value = String(errorMessage)
    showErrorModal.value = true
    closeToggleConfirm()
  }
}

const closeToggleConfirm = () => {
  const found = practiceAreas.value.findIndex(area => area.id === toggleItemId.value)
  if (found > -1) {
    isToggleConfirmOpen.value = false
    practiceAreas.value[found].active = !toggleItemState.value
  }

  const searchFound = searchResults.value.findIndex(area => area.id === toggleItemId.value)
  if (searchFound > -1) {
    isToggleConfirmOpen.value = false
    searchResults.value[searchFound].active = !toggleItemState.value
  }

  if (found > -1 || searchFound > -1) {
    toggleItemId.value = null
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
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Top Bar -->
    <div class="flex items-center justify-between">
      <div class="relative">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search practice areas"
          size="md"
          :ui="{ base: 'rounded-full bg-white border-[#CCCCCC66] h-[42px] max-w-[500px] w-full font-light' }"
          color="neutral"
          @focus="isSearchDropdownOpen = String(searchQuery).trim().length > 0"
          @keydown.esc="isSearchDropdownOpen = false"
        />

        <div
          v-if="isSearchDropdownOpen"
          class="absolute left-0 right-0 z-50 mt-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden max-w-[450px] w-full xl:w-[600px]"
        >
          <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <div class="text-xs font-bold text-gray-400">
              Search results
            </div>
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-x"
              class="rounded-full"
              @click="isSearchDropdownOpen = false"
            />
          </div>

          <div
            v-if="isSearchingDropdown"
            class="p-3 text-sm text-gray-500"
          >
            Searching...
          </div>

          <template v-else>
            <div
              v-if="searchResults.length === 0"
              class="p-4 text-sm text-gray-500 w-[500px]"
            >
              No matching results
            </div>

            <div
              v-else
              class="max-h-60 overflow-auto"
            >
              <div
                v-for="area in searchResults"
                :key="area.id"
                class="flex justify-between gap-[11px] px-[16px] py-[20px] hover:bg-gray-50 cursor-pointer"
                @mousedown.prevent
                @click="isSearchDropdownOpen = false"
              >
                <div>
                  <div class="font-medium text-[14px] text-gray-900">
                    {{ area.name }}
                  </div>
                  <div class="text-[14px] font-light text-gray-500">
                    {{ area.lawyers }} lawyers
                  </div>
                </div>
                <div>
                  <USwitch
                    v-model:model-value="area.active"
                    class="shrink-0"
                    :ui="{ base: 'bg-[#013355]! w-[36px]', thumb: 'w-[16px] h-2' }"
                    @update:model-value="(next) => handleToggleClick(area.id, Boolean(next))"
                  />
                  <button
                    class="text-[12px] font-medium text-[#003357] hover:text-red-600 transition-colors"
                    @click="handleDeleteClick(area.id)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <UButton
        color="primary"
        class="bg-[#003357] hover:bg-[#004474] text-white px-5 py-[12.5px] rounded-lg text-[14px] font-semibold"
        icon="i-heroicons-plus"
        @click="isAddModalOpen = true"
        v-if="userRole == 'super_admin'"
      >
        Add Practice area
      </UButton>
    </div>

    <!-- Error Banner -->
    <SharedErrorBanner
      v-if="hasFetchError"
      :message="listError"
    />

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
          :action-label="userRole == 'super_admin' ? 'Add Practice Area' : ''"
          @action="isAddModalOpen = true"
        />
      </UCard>
    </template>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="area in practiceAreas"
          :key="area.id"
          class="bg-white rounded-2xl p-5 flex flex-col gap-[11px]"
        >
          <div class="flex items-start justify-between">
            <h3 class="text-[14px] font-medium text-gray-900 pr-2">
              {{ area.name }}
            </h3>
            <USwitch
              v-model:model-value="area.active"
              class="shrink-0"
              :ui="{ base: 'data-[state=checked]:bg-[#003357]! data-[state=checked]:text-white! w-[45.71428680419922px]', thumb: 'w-[26px]' }"
              @update:model-value="(next) => handleToggleClick(area.id, Boolean(next))"
            />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[14px] text-[#8A9BB1] font-light">
              {{ area.lawyers }} lawyers
            </span>
            <button
              class="text-[12px] font-medium text-[#003357] hover:text-red-600 transition-colors"
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
      <span class="font-medium">Showing {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} practice areas</span>
      <div class="flex items-center gap-1.5">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-heroicons-arrow-left"
          class="font-medium text-gray-500 bg-white h-8 border border-[#E8EAED]"
          :disabled="currentPage === 1"
          @click="handlePrevPage"
        >
          Prev
        </UButton>

        <UButton
          v-for="page in visiblePages"
          :key="page"
          :variant="page === currentPage ? 'solid' : 'ghost'"
          :color="page === currentPage ? 'primary' : 'neutral'"
          size="sm"
          class="w-8 h-8 flex items-center justify-center rounded-md font-medium"
          :class="page === currentPage ? 'bg-[#003357] hover:bg-[#004474] text-white' : 'text-gray-500 border bg-white border-[#E8EAED]'"
          @click="goToPage(page)"
        >
          {{ page }}
        </UButton>

        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          trailing-icon="i-heroicons-arrow-right"
          class="font-medium text-gray-500 bg-white h-8 border border-[#E8EAED]"
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
    <UModal
      :open="isDeleteConfirmOpen"
      @update:open="() => isDeleteConfirmOpen = !isDeleteConfirmOpen"
    >
      <template #content>
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
      </template>
    </UModal>

    <!-- Toggle Confirmation Modal -->
    <UModal
      :open="isToggleConfirmOpen"
      @update:open="isToggleConfirmOpen = false"
    >
      <template #content>
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
                @click="() => closeToggleConfirm()"
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
                @click="() => closeToggleConfirm()"
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
      </template>
    </UModal>

    <!-- Error Modal -->
    <SharedErrorModal
      v-model="showErrorModal"
      :title="errorModalTitle"
      :description="errorModalDescription"
      button-text="Dismiss"
    />
  </div>
</template>
