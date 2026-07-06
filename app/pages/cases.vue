<script setup lang="ts">
import CaseDetailsModal from '~/components/cases/CaseDetailsModal.vue'
import { formatRelativeDate } from '~/util/helper'
import { displayApiError } from '~/util/apiHelper'

definePageMeta({ middleware: 'auth' })

// --- Fetch cases data on mount ---
const { getCases, searchCases } = useCases()
const { debounceSearch } = useSearch()

const skeleton = ref(true)
const listError = ref('')
const searchQuery = ref('')

interface CaseRow {
  id: string
  date: string
  matter: string
  category: string
  client: string
  location: string
  lawyer: string
  lawyerLoc: string
  status: string
  duration: string
}

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
  status: 'Accepted' | 'Open' | 'Declined' | 'Pending' | 'Completed'
  openedDate: string
  timeElapsed: string
  lastActivity: string
}

interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const stats = ref<StatItem[]>([
  { title: 'Total active cases', value: '318', trend: '+24', trendType: 'positive', trendSuffix: 'this month' },
  { title: 'Completed this month', value: '91', trendType: 'neutral', trendSuffix: 'Avg. 14 days to close' },
  { title: 'Open cases', value: '16', trend: '', trendType: 'neutral' },
  { title: 'Declined cases', value: '5', trend: '', trendType: 'negative' }
])

const cases = ref<CaseRow[]>([])

const columns = [
  { accessorKey: 'id', header: 'Case ID' },
  { accessorKey: 'matter', header: 'Matter' },
  { accessorKey: 'client', header: 'Client' },
  { accessorKey: 'lawyer', header: 'Lawyer' },
  { accessorKey: 'status', header: 'Status' },
  // { accessorKey: 'duration', header: 'Duration' },
  { accessorKey: 'actions', header: 'Action' }
]

const isModalOpen = ref(false)
const selectedCase = ref<CaseDetails | null>(null)

const viewCase = (row: CaseRow) => {
  selectedCase.value = {
    id: row.id,
    matter: row.matter,
    category: row.category.toUpperCase(),
    client: {
      name: row.client,
      location: row.location
    },
    lawyer: {
      name: row.lawyer,
      location: row.lawyerLoc
    },
    practiceArea: row.category,
    status: row.status as 'Accepted' | 'Open' | 'Declined' | 'Pending' | 'Completed',
    openedDate: '22 Mar 2026',
    timeElapsed: row.duration,
    lastActivity: 'Yesterday'
  }
  isModalOpen.value = true
}

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'accepted': return 'success'
    case 'open': return 'warning'
    case 'declined': return 'error'
    case 'completed': return 'neutral'
    default: return 'neutral'
  }
}

const activeFilter = ref('All')
const filters = [
  {
    label: 'All',
    value: 'All'
  },
  {
    label: 'Pending',
    value: 'Open'
  },
  {
    label: 'Active',
    value: 'Accepted'
  },
  {
    label: 'Completed',
    value: 'Completed'
  },
  {
    label: 'Declined',
    value: 'Declined'
  }]

const fromDate = ref('')
const toDate = ref('')

// Pagination numbering (design parity with Clients/New Users)
const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)

const isSearching = computed(() => searchQuery.value.trim().length > 0)

const mapCaseRow = (caseData: any): CaseRow => ({
  id: caseData.id,
  date: caseData.opened_at ? formatRelativeDate(caseData.opened_at) : 'N/A',
  matter: caseData.title,
  category: caseData.practice_area,
  client: caseData.client,
  location: caseData.location,
  lawyer: caseData.lawyer,
  lawyerLoc: caseData.lawyer_loc,
  status: caseData.status,
  duration: caseData.duration ?? caseData.days_elapsed ?? ''
})

const extractCasesPayload = (result: { success?: boolean, data?: any }, mode: 'list' | 'search') => {
  if (!result?.success) return null

  const root = mode === 'search'
    ? result.data?.data ?? result.data
    : result.data?.user?.data ?? result.data?.data ?? result.data

  if (!root?.success) return null

  return {
    cases: (root.data?.cases ?? []) as any[],
    stats: root.data?.stats as Record<string, string> | undefined,
    meta: root.meta as Record<string, number> | undefined
  }
}

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

const fetchCases = async (page: number = currentPage.value) => {
  listError.value = ''

  const params: Record<string, string | number | undefined> = {
    from: fromDate.value || undefined,
    to: toDate.value || undefined,
    page,
    per_page: perPage.value
  }

  const searching = searchQuery.value.trim().length > 0
  let result

  if (searching) {
    result = await searchCases({ q: searchQuery.value.trim(), ...params })
  } else {
    if (activeFilter.value !== 'All') {
      params.status = activeFilter.value.toLowerCase()
    }
    result = await getCases(params)
  }

  if (result?.aborted) return

  if (!result?.success) {
    listError.value = displayApiError(result, 'Failed to load cases.')
    cases.value = []
    return
  }

  const payload = extractCasesPayload(result, searching ? 'search' : 'list')
  if (!payload) {
    listError.value = displayApiError(result, 'Failed to load cases.')
    cases.value = []
    return
  }

  const meta = payload.meta
  if (meta) {
    currentPage.value = meta.current_page || page
    totalItems.value = meta.total || 0
    totalPages.value = meta.last_page || 1
  }

  cases.value = payload.cases.map(mapCaseRow)

  if (!searching && payload.stats) {
    const statistics = payload.stats
    stats.value = [
      { title: 'Total Active cases', value: statistics.total_active, trendType: 'positive', trendSuffix: '' },
      { title: 'Completed this month', value: statistics.completed_this_month, trendType: 'positive', trendSuffix: '' },
      { title: 'Open cases', value: statistics.open || '0', trend: '', trendType: 'neutral' },
      { title: 'Declined cases', value: statistics.declined || '0', trend: '', trendType: 'negative' }
    ]
  }
}

const handleFilterClick = (filter: string) => {
  searchQuery.value = ''
  listError.value = ''
  activeFilter.value = filter
  currentPage.value = 1
  fetchCases(1)
}

const resetSearch = () => {
  searchQuery.value = ''
  listError.value = ''
  activeFilter.value = 'All'
  currentPage.value = 1
  fetchCases(1)
}

const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchCases(currentPage.value)
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchCases(currentPage.value)
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchCases(page)
}

onMounted(async () => {
  skeleton.value = true
  await fetchCases()
  skeleton.value = false
})

const applyDateFilter = () => {
  currentPage.value = 1
  fetchCases(1)
}

const clearDateFilter = () => {
  fromDate.value = ''
  toDate.value = ''
  currentPage.value = 1
  fetchCases(1)
}

const handleCaseStatusChanged = async () => {
  await fetchCases(currentPage.value)
}

watch(searchQuery, () => {
  if (searchQuery.value.trim()) {
    activeFilter.value = 'All'
  }
  currentPage.value = 1
  debounceSearch(() => fetchCases(1))
})

// Silent background refresh every 60 seconds
const { start } = useIntervalFetch(() => fetchCases(currentPage.value), 60000)
onMounted(() => start())
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-[16px] font-bold text-gray-900 leading-tight">
          Cases
        </h1>
        <p class="text-[14px] text-gray-500">
          All active lawyer-client engagements
        </p>
      </div>
      <SharedDateRangePicker
        v-model:from="fromDate"
        v-model:to="toDate"
        variant="header"
        @apply="applyDateFilter"
        @clear="clearDateFilter"
      />
    </div>

    <!-- Skeleton Loading -->
    <template v-if="skeleton">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UCard
          v-for="i in 4"
          :key="i"
          class="rounded-[10px] border-0 ring-0"
        >
          <div class="space-y-3">
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-7 w-1/3" />
            <USkeleton class="h-3 w-1/2" />
          </div>
        </UCard>
      </div>
      <UCard class="rounded-[18px] border-0 ring-0">
        <div class="space-y-4">
          <div
            v-for="i in 6"
            :key="i"
            class="flex items-center gap-3"
          >
            <USkeleton class="w-10 h-10 rounded" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-3/4" />
              <USkeleton class="h-3 w-1/2" />
            </div>
            <USkeleton class="h-6 w-16 rounded-full" />
            <USkeleton class="h-8 w-16 rounded" />
          </div>
        </div>
      </UCard>
    </template>

    <!-- Real Content -->
    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SharedStatCard
          v-for="stat in stats"
          :key="stat.title"
          v-bind="stat"
        />
      </div>

      <!-- Table Section -->
      <UCard class="overflow-hidden rounded-[18px] border-0 ring-0">
        <!-- Filter Bar -->
        <div class="flex flex-col xl:flex-row lg:items-center justify-between gap-4">
          <div class="flex w-full flex-wrap items-center gap-2 xl:flex-1 xl:max-w-lg">
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              placeholder="Search by name or email..."
              class="w-full xl:w-[367px]"
              :ui="{ base: 'rounded-[36px] text-[14px] py-[10px] w-full' }"
            />
            <UButton
              v-if="isSearching"
              label="Reset"
              variant="outline"
              color="neutral"
              size="sm"
              class="rounded-[36px] text-[13px] font-semibold text-[#003357] border-[#E2E8F0]"
              @click="resetSearch"
            />
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <!-- <USelect
              placeholder="All statuses"
              color="neutral"
              variant="outline"
              icon="i-lucide-list-filter"
              class="whitespace-nowrap rounded-[36px] text-[14px] py-[10px]"
              :items="['All categories']"
            />
            <USelect
              placeholder="All categories"
              color="neutral"
              variant="outline"
              icon="i-lucide-list-filter"
              class="whitespace-nowrap rounded-[36px] text-[14px] py-[10px]"
              :items="['All categories']"
            /> -->

            <div class="flex bg-gray-100 p-0.5 rounded-lg ml-2">
              <button
                v-for="filter in filters"
                :key="filter.value"
                class="px-5 py-1.5 text-sm font-medium rounded-md transition-all"
                :class="activeFilter === filter.value && !isSearching ? 'bg-white text-[#003357] shadow-sm' : 'text-gray-500 hover:text-gray-900'"
                @click="handleFilterClick(filter.value)"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <template v-if="cases.length === 0 && !listError">
          <SharedEmptyState
            icon="i-lucide-file-text"
            :title="isSearching ? 'No matching cases' : 'No cases found'"
            :description="isSearching ? `No cases match &quot;${searchQuery}&quot;.` : 'There are no cases to display right now.'"
          />
        </template>

        <template v-else>
          <!-- Desktop Table (xl and above) -->
          <div class="hidden xl:block">
            <UTable
              :data="cases"
              :columns="columns"
              :ui="{
                base: 'divider-none border-none mt-4',
                th: 'divider-none border-none! font-light!',
                tr: 'divider-none border-none!',
                thead: 'divider-none border-none bg-[#F9F9FB]',
                separator: 'hidden'
              }"
            >
              <template #id-cell="{ row }">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">ID: {{ row.original.id }}</span>
                  <span class="text-[12px] text-gray-400 font-medium">{{ row.original.date }}</span>
                </div>
              </template>

              <template #matter-cell="{ row }">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">{{ row.original.matter }}</span>
                  <span class="text-[12px] text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                    {{ row.original.category }}
                  </span>
                </div>
              </template>

              <template #client-cell="{ row }">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">{{ row.original.client }}</span>
                  <span class="text-[12px] text-gray-400 font-medium">{{ row.original.location }}</span>
                </div>
              </template>

              <template #lawyer-cell="{ row }">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">{{ row.original.lawyer }}</span>
                  <span class="text-[12px] text-gray-400 font-medium">{{ row.original.lawyerLoc }}</span>
                </div>
              </template>

              <template #status-cell="{ row }">
                <UBadge
                  v-if="row.original.status"
                  :color="getStatusColor(row.original.status) as any"
                  variant="subtle"
                  class="rounded-full px-2.5 h-[28px] text-[12px] font-medium capitalize"
                >
                  {{ row.original.status == 'accepted' ? 'Active' : row.original.status == 'open' ? 'Pending' : row.original.status }}
                </UBadge>
              </template>

              <!-- <template #duration-cell="{ row }">
                <span class="text-sm font-medium text-gray-900">{{ row.original.duration }}</span>
              </template> -->

              <template #actions-cell="{ row }">
                <UButton
                  label="View"
                  variant="outline"
                  color="neutral"
                  size="xs"
                  class="font-semibold text-[#013355] border-[#E2E8F0] hover:bg-[#F8F9FB] py-[9px] px-[12px] rounded-[4px] text-[13px] border-[0.5px] ring-0"
                  @click="viewCase(row.original)"
                />
              </template>
            </UTable>
          </div>

          <!-- Mobile/Tablet Card View (below xl) -->
          <div class="xl:hidden space-y-3 mt-4">
            <div
              v-for="row in cases"
              :key="row.id"
              class="bg-white border border-gray-100 rounded-[12px] p-4 space-y-3"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-[14px] font-semibold text-gray-900">
                    {{ row.matter }}
                  </p>
                  <p class="text-[12px] text-gray-400">
                    ID: {{ row.id }} &middot; {{ row.date }}
                  </p>
                </div>
                <UBadge
                  :color="getStatusColor(row.status) as any"
                  variant="subtle"
                  class="rounded-full px-2.5 h-[24px] text-[11px] font-medium shrink-0"
                >
                  {{ row.status == 'accepted' ? 'Active' : row.status == 'open' ? 'Pending' : row.status }}
                </UBadge>
              </div>

              <div class="grid grid-cols-2 gap-2 text-[13px]">
                <div class="flex flex-col">
                  <span class="text-gray-400 text-[12px]">Client</span>
                  <span class="text-gray-700 font-medium">{{ row.client }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-gray-400 text-[12px]">Lawyer</span>
                  <span class="text-gray-700 font-medium">{{ row.lawyer }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-gray-400 text-[12px]">Category</span>
                  <span class="text-gray-700 font-medium truncate">{{ row.category }}</span>
                </div>
                <!-- <div class="flex flex-col">
                  <span class="text-gray-400 text-[12px]">Duration</span>
                  <span class="text-gray-700 font-medium">{{ row.duration }}</span>
                </div> -->
              </div>

              <div class="pt-1">
                <UButton
                  label="View Details"
                  variant="outline"
                  color="neutral"
                  size="xs"
                  class="w-full justify-center font-semibold text-[#003357] border-[#E2E8F0] hover:bg-[#F8F9FB] py-[9px] rounded-[6px] text-[13px]"
                  @click="viewCase(row)"
                />
              </div>
            </div>
          </div>
        </template>
      </UCard>
      <!-- Pagination Footer -->
      <div class="px-6 py-5 pt-0 border-t border-gray-100 flex items-center justify-between bg-gray-50/20 mt-2">
        <div class="text-xs text-gray-500">
          Showing {{ totalItems ? (currentPage - 1) * perPage + 1 : 0 }}–{{ Math.min(currentPage * perPage, totalItems || cases.length) }} of {{ totalItems || cases.length }} cases
        </div>
        <div class="flex items-center gap-1.5">
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-heroicons-arrow-left"
            class="h-8 font-medium text-gray-500 bg-white ring-[#E8EAED] ring-[1px]"
            :disabled="currentPage === 1"
            @click="handlePrevPage"
          >
            Prev
          </UButton>

          <UButton
            v-for="page in visiblePages"
            :key="page"
            variant="ghost"
            color="neutral"
            size="sm"
            class="w-8 h-8 flex items-center justify-center rounded-md font-medium bg-white ring-[#E8EAED] ring-[1px]"
            :class="page === currentPage ? 'bg-[#003357] text-white' : 'text-gray-500'"
            @click="goToPage(page)"
          >
            {{ page }}
          </UButton>

          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            trailing-icon="i-heroicons-arrow-right"
            class="h-8 font-medium text-gray-500 bg-white ring-[#E8EAED] ring-[1px]"
            :disabled="currentPage === totalPages"
            @click="handleNextPage"
          >
            Next
          </UButton>
        </div>
      </div>
    </template>

    <CaseDetailsModal
      v-model="isModalOpen"
      :case-data="selectedCase"
      @status-changed="handleCaseStatusChanged"
    />
  </div>
</template>
