<script setup lang="ts">
import CaseDetailsModal from '~/components/cases/CaseDetailsModal.vue'
import { formatRelativeDate } from '~/util/helper'

definePageMeta({ middleware: 'auth' })

// --- Fetch cases data on mount ---
const { getCases } = useCases()

const skeleton = ref(true)

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
  status: 'Active' | 'Stalled' | 'Pending' | 'Completed'
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
  { title: 'Stalled cases', value: '16', trend: 'No activity 7+ days', trendType: 'negative' },
  { title: 'Avg. case duration', value: '14d', trend: '-2d', trendType: 'positive', trendSuffix: 'this month' }
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
    status: row.status as 'Active' | 'Stalled' | 'Pending' | 'Completed',
    openedDate: '22 Mar 2026',
    timeElapsed: row.duration,
    lastActivity: 'Yesterday'
  }
  isModalOpen.value = true
}

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success'
    case 'open': return 'warning'
    case 'declined': return 'danger'
    case 'completed': return 'success'
    default: return 'secondary'
  }
}

const activeFilter = ref('All')
const filters = ['All', 'Stalled', 'Completed']

const fromDate = ref('')
const toDate = ref('')

// Pagination numbering (design parity with Clients/New Users)
const currentPage = ref(1)
const perPage = ref(10)
const totalPages = ref(8)

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

const fetchCases = async () => {
  const result = await getCases({
    from: fromDate.value || undefined,
    to: toDate.value || undefined
  })
  // Map real API data when available

  if (result && result.data && result.data.user && result.data.user.data && result.data.user.data.success) {
    console.log(result.data.user.data.meta, 'case')

    const meta = result.data.user.data.meta
    const statistics = result.data.user.data.data.stats
    const data = result.data.user.data.data.cases

    stats.value = [
      { title: 'Total active cases', value: statistics.total_active, trendType: 'positive', trendSuffix: '' },
      { title: 'Completed this month', value: statistics.completed_this_month, trendType: 'positive', trendSuffix: '' },
      { title: 'Stalled cases', value: statistics.stalled, trend: '', trendType: 'negative' },
      { title: 'Avg. case duration', value: statistics.avg_duration_days, trend: '', trendType: 'positive', trendSuffix: '' }
    ]

    cases.value = data.map((caseData: any) => ({
      id: caseData.id,
      date: caseData.opened_at ? formatRelativeDate(caseData.opened_at) : 'N/A',
      matter: caseData.title,
      category: caseData.practice_area,
      client: caseData.client,
      location: caseData.location,
      lawyer: caseData.lawyer,
      lawyerLoc: caseData.lawyer_loc,
      status: caseData.status,
      // duration: caseData.duration,
      timeElapsed: caseData.days_elapsed,
      lastActivity: caseData.updated_at
    }))
  }
}

onMounted(async () => {
  skeleton.value = true
  await fetchCases()
  skeleton.value = false
})

const applyDateFilter = () => fetchCases()
const clearDateFilter = () => {
  fromDate.value = ''
  toDate.value = ''
  fetchCases()
}

const handleCaseStatusChanged = async () => {
  await fetchCases()
}

// Silent background refresh every 60 seconds
const { start } = useIntervalFetch(fetchCases, 60000)
onMounted(() => start())
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 leading-tight">
          Cases
        </h1>
        <p class="text-sm text-gray-500">
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
          <div class="w-full xl:flex-1 xl:max-w-lg">
            <UInput
              icon="i-lucide-search"
              placeholder="Search by name or email..."
              class="w-full xl:w-[367px]"
              :ui="{ base: 'rounded-[36px] text-[14px] py-[10px] w-full' }"
            />
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <USelect
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
            />

            <div class="flex bg-gray-100 p-0.5 rounded-lg ml-2">
              <button
                v-for="filter in filters"
                :key="filter"
                class="px-5 py-1.5 text-sm font-medium rounded-md transition-all"
                :class="activeFilter === filter ? 'bg-white text-[#003357] shadow-sm' : 'text-gray-500 hover:text-gray-900'"
                @click="activeFilter = filter"
              >
                {{ filter }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <template v-if="cases.length === 0">
          <SharedEmptyState
            icon="i-lucide-file-text"
            title="No cases found"
            description="There are no cases to display right now."
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
                  class="rounded-full px-2.5 h-[28px] text-[12px] font-medium"
                >
                  {{ row.original.status == 'open' ? 'Pending' : row.original.status == 'stalled' ? 'Stalled' : row.original.status == 'declined' ? 'Declined' : 'Completed' }}
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
                  class="font-semibold text-[#003357] border-[#E2E8F0] hover:bg-[#F8F9FB] py-[9px] px-[12px] rounded-[4px] text-[13px]"
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
                  {{ row.status == 'open' ? 'Pending' : row.status == 'accepted' ? 'Accepted' : row.status == 'declined' ? 'Declined' : 'Completed' }}
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

          <!-- Pagination Footer -->
          <div class="px-6 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/20 mt-4">
            <div class="text-xs text-gray-500">
              Showing 1–{{ cases.length }} of {{ cases.length }} cases
            </div>
            <div class="flex items-center gap-1.5">
              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                icon="i-heroicons-arrow-left"
                class="h-8 font-medium text-gray-500 bg-white shadow-sm"
                :disabled="currentPage === 1"
                @click="currentPage = Math.max(1, currentPage - 1)"
              >
                Prev
              </UButton>

              <UButton
                v-for="page in visiblePages"
                :key="page"
                variant="ghost"
                color="neutral"
                size="sm"
                class="w-8 h-8 flex items-center justify-center rounded-md font-medium bg-white"
                :class="page === currentPage ? 'bg-[#003357] text-white' : 'text-gray-500'"
                @click="currentPage = page"
              >
                {{ page }}
              </UButton>

              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                trailing-icon="i-heroicons-arrow-right"
                class="h-8 font-medium text-gray-500 bg-white shadow-sm"
                :disabled="currentPage === totalPages"
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
              >
                Next
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </template>

    <CaseDetailsModal
      v-model="isModalOpen"
      :case-data="selectedCase"
      @status-changed="handleCaseStatusChanged"
    />
  </div>
</template>
