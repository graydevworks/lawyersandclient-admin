<script setup lang="ts">
import { formatRelativeDate } from '~/util/helper'

definePageMeta({ middleware: 'auth' })

// --- Fetch lawyers data on mount ---
const { getLawyers, searchLawyers } = useLawyers()
const router = useRouter()

const skeleton = ref(true)

interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const stats = ref<StatItem[]>([])

// --- Status filter ---
const statusFilter = ref('')
const statusOptions = [
  {
    label: 'Approved',
    value: 'approved'
  },
  {
    label: 'Pending',
    value: 'pending'
  },
  {
    label: 'Rejected',
    value: 'rejected'
  },
  {
    label: 'Suspended',
    value: 'suspended'
  }
]

const columns = [
  { accessorKey: 'user', header: 'User' },
  { accessorKey: 'email', header: 'Contact' },
  { accessorKey: 'status', header: 'Verification' },
  { accessorKey: 'joined', header: 'Joined' },
  { accessorKey: 'userCode', header: 'User Code' },
  { accessorKey: 'actions', header: 'Actions' }
]

const cardFields = [
  { key: 'email', label: 'Email' },
  { key: 'joined', label: 'Joined' },
  { key: 'userCode', label: 'User Code' }
]

const lawyers = ref([])

const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)

const fromDate = ref('')
const toDate = ref('')

// --- Search ---
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const showSearchDropdown = ref(false)
let searchDebounce: ReturnType<typeof setTimeout> | null = null

const handleSearchInput = () => {
  if (searchDebounce) clearTimeout(searchDebounce)

  if (!searchQuery.value || searchQuery.value.trim().length < 2) {
    searchResults.value = []
    showSearchDropdown.value = false
    return
  }

  searchDebounce = setTimeout(async () => {
    isSearching.value = true
    showSearchDropdown.value = true
    try {
      const result = await searchLawyers({ q: searchQuery.value.trim() })
      if (result?.success && result?.data?.lawyers) {
        const data = (result.data.lawyers as any)?.data
        if (data?.success) {
          const list = Array.isArray(data.data) ? data.data : (data.data?.lawyers || [])
          searchResults.value = list.map((lawyer: any) => ({
            id: lawyer.id,
            name: lawyer.full_name || lawyer.name,
            email: lawyer.email,
            avatar: lawyer.profile_photo_url || lawyer.avatar,
            status: lawyer.verification_status || lawyer.status
          }))
        } else {
          searchResults.value = []
        }
      } else {
        searchResults.value = []
      }
    } catch {
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 400)
}

const goToLawyer = (id: number | string) => {
  showSearchDropdown.value = false
  searchQuery.value = ''
  searchResults.value = []
  router.push(`/lawyers/${id}`)
}

const closeDropdown = () => {
  // Small delay so click on item registers first
  setTimeout(() => {
    showSearchDropdown.value = false
  }, 200)
}

// --- Fetch lawyers ---
const fetchLawyers = async (page: number = 1) => {
  const params: Record<string, any> = {
    page,
    per_page: perPage.value,
    from: fromDate.value || undefined,
    to: toDate.value || undefined
  }

  if (statusFilter.value) {
    params.status = statusFilter.value.toLowerCase()
  }

  const result = await getLawyers(params)

  if (result && result.data && result.data.lawyers && result.data.lawyers.data && result.data.lawyers.data.success) {
    const lawyerList = result.data.lawyers.data.data
    const statistics = result.data.lawyers.data.data.stats
    const meta = result.data.lawyers.data.meta

    currentPage.value = meta.current_page || 1
    totalItems.value = meta.total || 0
    totalPages.value = meta.last_page || 1

    stats.value = [
      { title: 'Total Lawyers', value: statistics.total, trend: '', trendType: 'positive', trendSuffix: '' },
      { title: 'Pending Lawyers', value: statistics.pending, trend: '', trendType: 'positive', trendSuffix: '' },
      { title: 'Suspended Lawyers', value: statistics.suspended, trend: '', trendType: 'positive', trendSuffix: '' },
      { title: 'Rejected Lawyers', value: statistics.rejected, trend: '', trendType: 'positive', trendSuffix: '' }
    ]

    lawyers.value = lawyerList.lawyers.map((lawyer: any) => ({
      id: lawyer.id,
      name: lawyer.full_name,
      email: lawyer.email,
      status: lawyer.verification_status,
      joined: lawyer.joined_at ? formatRelativeDate(lawyer.joined_at) : '',
      userCode: lawyer.user_code,
      avatar: lawyer.profile_photo_url,
      responseRate: lawyer.average_rating
    }))
  }
}

// --- Pagination ---
const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchLawyers(currentPage.value)
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchLawyers(currentPage.value)
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchLawyers(page)
}

/**
 * Build a smart array of page numbers around current page.
 * Shows first, last, current ± 1, with ellipsis gaps.
 */
const visiblePages = computed(() => {
  const total = totalPages.value
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []
  const current = currentPage.value

  // Always show page 1
  pages.push(1)

  if (current > 3) pages.push('...')

  // Pages around current
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) pages.push('...')

  // Always show last page
  pages.push(total)

  return pages
})

// --- Status filter watcher ---
watch(statusFilter, () => {
  currentPage.value = 1
  fetchLawyers(1)
})

onMounted(async () => {
  await fetchLawyers()
  skeleton.value = false
})

const applyDateFilter = () => {
  currentPage.value = 1
  fetchLawyers(1)
}

const clearDateFilter = () => {
  fromDate.value = ''
  toDate.value = ''
  currentPage.value = 1
  fetchLawyers(1)
}

// Silent background refresh every 60 seconds
const { start } = useIntervalFetch(() => fetchLawyers(currentPage.value), 60000)
onMounted(() => start())
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-semibold text-gray-900 leading-tight">
        Lawyers
      </h1>
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
            v-for="i in 5"
            :key="i"
            class="flex items-center gap-3"
          >
            <USkeleton class="w-10 h-10 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-3/4" />
              <USkeleton class="h-3 w-1/2" />
            </div>
            <USkeleton class="h-6 w-16 rounded-full" />
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

      <!-- Lawyers List Card -->
      <UCard
        class="lg:col-span-8 rounded-[18px] border-0 ring-0"
        :ui="{ header: 'border-0 mb-0', body: 'p-0! px-[8px]!' }"
      >
        <template #header>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 class="text-[16px] font-semibold text-gray-900">
              Lawyers list
            </h3>
            <div class="flex items-center gap-4">
              <!-- Search with Dropdown -->
              <div class="relative">
                <UInput
                  v-model="searchQuery"
                  icon="i-lucide-search"
                  placeholder="Search by name or email..."
                  class="w-full md:w-[367px]"
                  :ui="{ base: 'rounded-[36px] text-[14px] py-[10px]' }"
                  @input="handleSearchInput"
                  @blur="closeDropdown"
                  @focus="searchQuery.trim().length >= 2 && searchResults.length > 0 ? showSearchDropdown = true : null"
                />

                <!-- Search Results Dropdown -->
                <Transition
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0 translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition ease-in duration-150"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 translate-y-1"
                >
                  <div
                    v-if="showSearchDropdown"
                    class="absolute top-full left-0 right-0 mt-2 bg-white rounded-[12px] shadow-xl border border-gray-100 z-[100] max-h-[320px] overflow-y-auto"
                  >
                    <!-- Loading state -->
                    <div
                      v-if="isSearching"
                      class="p-4 flex items-center gap-3 text-gray-400"
                    >
                      <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
                      <span class="text-[13px]">Searching...</span>
                    </div>

                    <!-- Results -->
                    <template v-else-if="searchResults.length > 0">
                      <button
                        v-for="result in searchResults"
                        :key="result.id"
                        class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer text-left border-b border-gray-50 last:border-0"
                        @mousedown.prevent="goToLawyer(result.id)"
                      >
                        <UAvatar
                          :src="result.avatar"
                          :alt="result.name"
                          class="size-[32px] shrink-0"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="text-[13px] font-semibold text-gray-900 truncate">
                            {{ result.name }}
                          </p>
                          <p class="text-[12px] text-gray-400 truncate">
                            {{ result.email }}
                          </p>
                        </div>
                        <UBadge
                          v-if="result.status"
                          :color="result.status?.toLowerCase() === 'approved' || result.status?.toLowerCase() === 'verified' ? 'success'
                            : result.status?.toLowerCase() === 'pending' ? 'warning'
                              : result.status?.toLowerCase() === 'rejected' || result.status?.toLowerCase() === 'suspended' ? 'error'
                                : 'neutral'"
                          variant="subtle"
                          class="rounded-full px-2 text-[11px] shrink-0"
                        >
                          {{ result.status }}
                        </UBadge>
                        <UIcon name="i-lucide-arrow-right" class="size-4 text-gray-300 shrink-0" />
                      </button>
                    </template>

                    <!-- No results -->
                    <div
                      v-else
                      class="p-4 text-center text-[13px] text-gray-400"
                    >
                      No lawyers found for "{{ searchQuery }}"
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Status Filter -->
              <USelect
                v-model="statusFilter"
                color="neutral"
                variant="outline"
                icon="i-lucide-list-filter"
                class="whitespace-nowrap rounded-[36px] text-[14px] py-[10px]"
                :items="statusOptions"
                placeholder="Status"
              />
            </div>
          </div>
        </template>

        <template v-if="lawyers.length > 0">
          <SharedDataTable
            :columns="columns"
            :data="lawyers"
            :card-fields="cardFields"
            link-prefix="/lawyers"
            @view-profile="(e) => { $router.push(`/lawyers/${e.id}`) }"
          >
            <template #email-cell="{ row }">
              <span class="text-gray-600 font-medium">{{ (row.original as any).email }}</span>
            </template>
          </SharedDataTable>
        </template>
        <SharedEmptyState
          v-else
          icon="i-lucide-briefcase"
          title="No lawyers found"
          description="There are no lawyers to display right now."
        />
      </UCard>

      <!-- Pagination -->
      <div
        v-if="lawyers.length > 0"
        class="flex items-center justify-between text-sm text-gray-500 pt-2"
      >
        <span>Showing {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} lawyers</span>
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
          <template v-for="(page, idx) in visiblePages" :key="idx">
            <span
              v-if="page === '...'"
              class="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
            >…</span>
            <UButton
              v-else
              :variant="page === currentPage ? 'solid' : 'ghost'"
              :color="page === currentPage ? 'primary' : 'neutral'"
              size="sm"
              class="w-8 h-8 flex items-center justify-center rounded-md font-medium"
              :class="page === currentPage ? 'bg-[#003357] hover:bg-[#004474] text-white' : 'text-gray-500'"
              @click="goToPage(page as number)"
            >
              {{ page }}
            </UButton>
          </template>
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
    </template>
  </div>
</template>
