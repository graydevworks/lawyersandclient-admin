<script setup lang="ts">
import { formatRelativeDate } from '~/util/helper'
import { displayApiError } from '~/util/apiHelper'

definePageMeta({ middleware: 'auth' })

// --- Fetch clients data on mount ---
const { getClients } = useClients()

const skeleton = ref(true)

interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const stats = ref<StatItem[]>([])

const columns = [
  { accessorKey: 'user', header: 'User' },
  { accessorKey: 'contact', header: 'Contact' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'joined', header: 'Joined' },
  { accessorKey: 'actions', header: 'Actions' }
]

const cardFields = [
  { key: 'contact', label: 'Contact' },
  { key: 'joined', label: 'Joined' },
  { key: 'location', label: 'Location' }
]

const clients = ref<{
  id: string
  name: string
  contact: string
  email?: string
  location?: string
  status: string
  joined: string
  avatar: string
}[]>([])

const searchQuery = ref('')
const listError = ref('')
const hasFetchError = ref(false)
const statusFilter = ref<string | undefined>(undefined)
const statusOptions = [
  { label: 'All statuses', value: undefined },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'New', value: 'new' }
]

const fromDate = ref('')
const toDate = ref('')

const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)

const { searchClients, debounceSearch } = useSearch()

interface ClientRow {
  id: string
  name: string
  contact: string
  email?: string
  location?: string
  status: string
  joined: string
  lastActive: string
  avatar: string
  totalChats?: number
  reportsFiled?: number
  [key: string]: unknown
}

const selectedClient = ref<ClientRow | null>(null)
const isProfileModalOpen = ref(false)

const handleViewProfile = (client: ClientRow) => {
  selectedClient.value = {
    ...client,
    totalChats: 0,
    reportsFiled: 1
  }
  isProfileModalOpen.value = true
}

const fetchClients = async (page: number = 1) => {
  const params: Record<string, string | number | undefined> = {
    page,
    per_page: perPage.value,
    date_from: fromDate.value || undefined,
    date_to: toDate.value || undefined
  }

  if (statusFilter.value) {
    params.status = statusFilter.value
  }

  listError.value = ''
  hasFetchError.value = false

  let result

  if (searchQuery.value.trim()) {
    result = await searchClients({ q: searchQuery.value.trim(), ...params })
  } else {
    result = await getClients(params)
  }

  if (!result?.success) {
    listError.value = result.validationMessages[0]
    hasFetchError.value = true
    return
  }

  const raw = (result as { data?: unknown }).data as Record<string, unknown> | undefined
  const nested = (raw?.data ?? raw) as { success?: boolean, data?: { clients?: unknown[], stats?: Record<string, string> }, meta?: Record<string, number> } | undefined
  const inner = nested?.success ? nested : (raw as { success?: boolean, data?: { clients?: unknown[], stats?: Record<string, string> }, meta?: Record<string, number> })

  if (inner?.success) {
    const clientList = (inner.data?.clients || []) as Array<Record<string, unknown>>
    const statistics = inner.data?.stats || {}
    const meta = inner.meta || {}

    currentPage.value = meta.current_page || 1
    totalItems.value = meta.total || 0
    totalPages.value = meta.last_page || 1

    clients.value = clientList.map((client: any) => ({
      id: client.id,
      name: client.full_name,
      contact: client.phone,
      email: client.email,
      location: client.location,
      status: client.status,
      joined: client.joined_at ? formatRelativeDate(client.joined_at) : '',
      lastActive: client.last_active ? formatRelativeDate(client.last_active) : 'N/A',
      avatar: client.profile_photo_url || ''
    }))

    if (!searchQuery.value.trim()) {
      stats.value = [
        { title: 'Total Clients', value: statistics.total, trend: '', trendType: 'positive', trendSuffix: '' },
        { title: 'Active', value: statistics.active, trend: '', trendType: 'positive', trendSuffix: '' },
        { title: 'Suspended', value: statistics.suspended, trend: '', trendType: 'negative', trendSuffix: '' },
        { title: 'New Users', value: statistics.new_this_week, trend: '', trendType: 'positive' }
      ]
    }
  }
}

const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchClients(currentPage.value)
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchClients(currentPage.value)
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchClients(page)
}

/**
 * Smart pagination numbering:
 * - If total pages <= 5: show all numbers.
 * - Otherwise: always show 1 and total.
 * - Around current: show current ± 1.
 * - Add an ellipsis when there is a gap.
 */
const visiblePages = computed((): number[] => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  // Always render exactly 5 page numbers.
  // Slide the window as the user moves, and clamp to [1..total].
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

onMounted(async () => {
  await fetchClients()
  skeleton.value = false
})

watch(statusFilter, () => {
  currentPage.value = 1
  listError.value = ''
  fetchClients(1)
})

watch(searchQuery, () => {
  currentPage.value = 1
  listError.value = ''
  debounceSearch(() => fetchClients(1))
})

const applyDateFilter = () => {
  currentPage.value = 1
  listError.value = ''
  fetchClients(1)
}

const clearDateFilter = () => {
  fromDate.value = ''
  toDate.value = ''
  currentPage.value = 1
  listError.value = ''
  fetchClients(1)
}

// Silent background refresh every 60 seconds
const { start } = useIntervalFetch(() => fetchClients(currentPage.value), 60000)
onMounted(() => {
  start()
})
</script>

<template>
  <div class="space-y-8">
    <ClientsProfileModal
      v-model="isProfileModalOpen"
      :client="selectedClient"
      @action-complete="fetchClients"
    />

    <div class="flex items-center justify-between">
      <h1 class="text-[16px] font-semibold text-gray-900 leading-tight">
        Clients
      </h1>
      <SharedDateRangePicker
        v-model:from="fromDate"
        v-model:to="toDate"
        variant="header"
        @apply="applyDateFilter"
        @clear="clearDateFilter"
      />
    </div>

    <!-- Error Banner -->
    <SharedErrorBanner
      v-if="hasFetchError"
      :message="listError"
    />

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
      <UCard class="rounded-[24px] border-0 ring-0">
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

      <!-- Clients List Card -->
      <UCard
        class="rounded-[24px] border-0 ring-0"
        :ui="{ header: 'border-0 mb-0', body: 'p-0! px-[8px]!' }"
      >
        <template #header>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 class="font-medium text-gray-900">
              Users list
            </h3>
            <div class="flex items-center gap-4">
              <UInput
                v-model="searchQuery"
                icon="i-lucide-search"
                placeholder="Search by name or email..."
                class="w-full md:w-[367px]"
                :ui="{ base: 'rounded-[36px] text-[14px] py-[10px] ring-[0.5px]' }"
              />
              <USelect
                v-model="statusFilter"
                :items="statusOptions"
                value-key="value"
                label-key="label"
                placeholder="Filter status"
                class="rounded-[36px] h-full text-[14px] py-[10px] ring-[0.5px]"
                :content="{ class: 'z-[999999]! important', strategy: 'fixed' }"
              />
            </div>
          </div>
        </template>

        <template v-if="clients.length > 0">
          <SharedDataTable
            :columns="columns"
            :data="clients"
            :card-fields="cardFields"
            @view-profile="handleViewProfile"
          />
        </template>
        <SharedEmptyState
          v-else
          icon="i-lucide-users"
          title="No clients found"
          description="There are no clients to display right now."
        />
      </UCard>

      <!-- Pagination -->
      <div
        v-if="clients.length > 0"
        class="flex items-center justify-between text-sm text-gray-500 pt-2 pb-10"
      >
        <span>Showing {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} clients</span>
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
          <template v-for="page in visiblePages" :key="page">
            <span
              v-if="page === '...'"
              class="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]"
            >
              …
            </span>
            <UButton
              v-else
              :variant="page === currentPage ? 'solid' : 'ghost'"
              :color="page === currentPage ? 'primary' : 'neutral'"
              size="sm"
              class="w-8 h-8 flex items-center justify-center rounded-md font-medium bg-white hover:bg-[#003357]/30 ring-[#E8EAED] ring-[1px]"
              :class="page === currentPage ? 'bg-[#003357] hover:bg-[#004474] text-white' : 'text-gray-500'"
              @click="goToPage(Number(page))"
            >
              {{ page }}
            </UButton>
          </template>
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
  </div>
</template>
