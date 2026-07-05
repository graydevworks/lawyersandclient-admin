<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { formatCompactNumber, formatRelativeDate } from '~/util/helper'

definePageMeta({ middleware: 'auth' })

// --- Fetch user data on mount ---
const { getUsers } = useUsers()

const skeleton = ref(true)

interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const filterDate = ref('This week')

const stats = ref<StatItem[]>([
  { title: 'Total New Users', value: '258', trend: '+14%', trendType: 'positive', trendSuffix: 'vs last week' },
  { title: 'New Clients', value: '212', trend: '+14%', trendType: 'positive', trendSuffix: 'vs last week' },
  { title: 'New Lawyers', value: '47', trend: '+14%', trendType: 'positive', trendSuffix: 'vs last week' },
  { title: 'Pending verification', value: '4', trend: 'New lawyers awaiting review', trendType: 'neutral', trendSuffix: '' }
])

const sortBy = ref<SelectItem[]>([
  {
    type: 'label',
    label: 'Sort by',
    icon: 'i-lucide-sort'
  },
  'Location',
  'Date Joined'
])

const value = ref('Location')

const signUpsSeries = ref([
  {
    name: 'Clients',
    data: [0, 0, 0, 0, 0, 0, 0]
  },
  {
    name: 'Lawyers',
    data: [0, 0, 0, 0, 0, 0, 0]
  }
])

const signUpsOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false }
  },
  colors: ['#003357', '#93E2FF'],
  plotOptions: {
    bar: {
      columnWidth: '55%',
      borderRadius: 4
    }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    axisBorder: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => formatCompactNumber(val)
    }
  },
  grid: {
    strokeDashArray: 4,
    borderColor: '#f1f1f1'
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  }
})

const activeTab = ref<'clients' | 'lawyers'>('clients')

const items = [
  { label: 'Clients', value: 'clients', slot: 'clients' },
  { label: 'Lawyers', value: 'lawyers', slot: 'lawyers' }
]

const columns = [
  { accessorKey: 'user', header: 'User' },
  { accessorKey: 'contact', header: 'Contact' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'joined', header: 'Joined' },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'actions', header: 'Actions' }
]

const cardFields = [
  { key: 'contact', label: 'Contact' },
  { key: 'role', label: 'Role' },
  { key: 'joined', label: 'Joined' },
  { key: 'location', label: 'Location' }
]

// Pagination state
const clientsCurrentPage = ref(1)
const lawyersCurrentPage = ref(1)
const perPage = ref(10)
const clientsTotalPages = ref(1)
const lawyersTotalPages = ref(1)
const clientsTotalItems = ref(0)
const lawyersTotalItems = ref(0)

// Filter rows by active tab
const filteredRows = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.value.filter((row: any) => {
    const role = (row.role || '').toLowerCase()
    if (activeTab.value === 'lawyers') return role === 'lawyer'
    return role === 'client'
  })
})

// Get current page and total pages for active tab
const currentPage = computed(() => activeTab.value === 'lawyers' ? lawyersCurrentPage.value : clientsCurrentPage.value)
const totalPages = computed(() => activeTab.value === 'lawyers' ? lawyersTotalPages.value : clientsTotalPages.value)
const totalItems = computed(() => activeTab.value === 'lawyers' ? lawyersTotalItems.value : clientsTotalItems.value)

// Always render exactly 5 page numbers (no ellipsis).
const visiblePages = computed((): number[] => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

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

// Profile modal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedUser = ref<any>(null)
const showProfile = ref(false)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleViewProfile = (user: any) => {
  selectedUser.value = user
  showProfile.value = true
}

const rows = ref([
  { id: 'PRET-02', name: 'Miles, Esther', contact: 'gravyface@mac.com', role: 'client', status: 'new', joined: '24 May, 2020', location: 'Kaduna', avatar: 'https://i.pravatar.cc/150?u=13' },
  { id: 'BSAD-21', name: 'Cooper, Kristin', contact: 'grolschie@mac.com', role: 'lawyer', status: 'new', joined: '1 Feb, 2020', location: 'Anambra', avatar: 'https://i.pravatar.cc/150?u=14' },
  { id: 'WSCT-02', name: 'Nguyen, Shane', contact: 'bockelboy@att.net', role: 'client', status: 'new', joined: '8 Sep, 2020', location: 'Imo', avatar: 'https://i.pravatar.cc/150?u=15' },
  { id: 'BGHO-91', name: 'Henry, Arthur', contact: 'chinthaka@hotmail.com', role: 'lawyer', status: 'pending', joined: '22 Oct, 2020', location: 'Borno', avatar: 'https://i.pravatar.cc/150?u=16' },
  { id: 'VCST-09', name: 'Flores, Juanita', contact: 'giafly@hotmail.com', role: 'client', status: 'new', joined: '8 Sep, 2020', location: 'Kwara', avatar: 'https://i.pravatar.cc/150?u=17' }
])

const searchQuery = ref('')
const fromDate = ref('')
const toDate = ref('')

const { debounceSearch } = useSearch()

const fetchUsers = async (page: number = 1) => {
  const params: Record<string, string | number | undefined> = {
    page,
    per_page: perPage.value,
    role: activeTab.value,
    from: fromDate.value || undefined,
    to: toDate.value || undefined
  }

  if (searchQuery.value.trim()) {
    params.q = searchQuery.value.trim()
  }

  const result = await getUsers(params)
  // Map real API data when available

  if (result && result.data && result.data.user && result.data.user.data && result.data.user.data.success) {
    const userList = result.data.user.data.data
    const statistics = result.data.user.data.data.stats
    const meta = result.data.user.data.data.users.meta

    // Update pagination for current tab
    if (activeTab.value === 'clients') {
      clientsCurrentPage.value = meta.current_page || 1
      clientsTotalItems.value = meta.total || 0
      clientsTotalPages.value = meta.last_page || 1
    } else {
      lawyersCurrentPage.value = meta.current_page || 1
      lawyersTotalItems.value = meta.total || 0
      lawyersTotalPages.value = meta.last_page || 1
    }

    stats.value = [
      { title: 'Total New Users', value: statistics.total_new_users.count, trend: statistics.total_new_users.change_pct, trendType: statistics.total_new_users.change_pct > -1 ? 'positive' : 'negative', trendSuffix: statistics.total_new_users.period },
      { title: 'New Clients', value: statistics.new_clients.count, trend: statistics.new_clients.change_pct, trendType: statistics.new_clients.change_pct > -1 ? 'positive' : 'negative', trendSuffix: statistics.new_clients.period },
      { title: 'New Lawyers', value: statistics.new_lawyers.count, trend: statistics.new_lawyers.change_pct, trendType: statistics.new_lawyers.change_pct > -1 ? 'positive' : 'negative', trendSuffix: statistics.new_lawyers.period },
      { title: 'Pending verification', value: statistics.pending_verification.count, trend: 'New lawyers awaiting review', trendType: 'neutral', trendSuffix: '' }
    ]

    // Sign Ups
    const lawyersSignups: any[] = []
    const clientsSignups: any[] = []

    // userList.signups_chart.forEach((item: any) => {
    //   lawyersSignups.push(item.lawyers)
    //   clientsSignups.push(item.clients)
    // })

    // // sunday is the first day of the week but the api brings it as 7th
    // lawyersSignups.unshift(lawyersSignups[lawyersSignups.length - 1])
    // lawyersSignups.pop()
    // clientsSignups.unshift(clientsSignups[clientsSignups.length - 1])
    // clientsSignups.pop()

    const getDaysOfWeek = (day: string) => {
      const chartData = userList.signups_chart.find((item: { day: string }) => item.day === day)

      return chartData
    }

    // making it orderly

    // lawyers
    lawyersSignups[0] = getDaysOfWeek('Sun')?.lawyers || 0
    lawyersSignups[1] = getDaysOfWeek('Mon')?.lawyers || 0
    lawyersSignups[2] = getDaysOfWeek('Tue')?.lawyers || 0
    lawyersSignups[3] = getDaysOfWeek('Wed')?.lawyers || 0
    lawyersSignups[4] = getDaysOfWeek('Thu')?.lawyers || 0
    lawyersSignups[5] = getDaysOfWeek('Fri')?.lawyers || 0
    lawyersSignups[6] = getDaysOfWeek('Sat')?.lawyers || 0

    // clients
    clientsSignups[0] = getDaysOfWeek('Sun')?.clients || 0
    clientsSignups[1] = getDaysOfWeek('Mon')?.clients || 0
    clientsSignups[2] = getDaysOfWeek('Tue')?.clients || 0
    clientsSignups[3] = getDaysOfWeek('Wed')?.clients || 0
    clientsSignups[4] = getDaysOfWeek('Thu')?.clients || 0
    clientsSignups[5] = getDaysOfWeek('Fri')?.clients || 0
    clientsSignups[6] = getDaysOfWeek('Sat')?.clients || 0

    signUpsSeries.value = [
      {
        name: 'Clients',
        data: clientsSignups
      },
      {
        name: 'Lawyers',
        data: lawyersSignups
      }
    ]

    // clients
    rows.value = userList.users.data.map((item: any) => ({
      id: item.id,
      name: item.full_name,
      contact: item.email,
      role: item.role || 'client',
      status: item.status || 'new',
      joined: item.joined_at ? formatRelativeDate(item.joined_at) : '',
      location: item.location,
      avatar: item.profile_photo_url
    }))
  }
}

const handleTabChange = (tab: 'clients' | 'lawyers') => {
  activeTab.value = tab
  const page = tab === 'lawyers' ? lawyersCurrentPage.value : clientsCurrentPage.value
  fetchUsers(page)
}

const handlePrevPage = () => {
  if (currentPage.value > 1) {
    const newPage = currentPage.value - 1
    if (activeTab.value === 'clients') {
      clientsCurrentPage.value = newPage
    } else {
      lawyersCurrentPage.value = newPage
    }
    fetchUsers(newPage)
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    const newPage = currentPage.value + 1
    if (activeTab.value === 'clients') {
      clientsCurrentPage.value = newPage
    } else {
      lawyersCurrentPage.value = newPage
    }
    fetchUsers(newPage)
  }
}

const goToPage = (page: number) => {
  if (activeTab.value === 'clients') {
    clientsCurrentPage.value = page
  } else {
    lawyersCurrentPage.value = page
  }
  fetchUsers(page)
}

onMounted(async () => {
  await fetchUsers()
  skeleton.value = false
})

watch(searchQuery, () => {
  const page = 1
  if (activeTab.value === 'clients') clientsCurrentPage.value = page
  else lawyersCurrentPage.value = page
  debounceSearch(() => fetchUsers(page))
})

const applyDateFilter = () => {
  const page = 1
  if (activeTab.value === 'clients') clientsCurrentPage.value = page
  else lawyersCurrentPage.value = page
  fetchUsers(page)
}

const clearDateFilter = () => {
  fromDate.value = ''
  toDate.value = ''
  applyDateFilter()
}

// Silent background refresh every 60 seconds
const { start } = useIntervalFetch(() => fetchUsers(currentPage.value), 60000)
onMounted(() => start())
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-semibold text-gray-900 leading-tight">
        New Users
      </h1>
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
        <USkeleton class="h-5 w-24 mb-4" />
        <USkeleton class="h-[373px] w-full rounded-xl" />
      </UCard>
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

      <!-- Sign ups Chart -->
      <UCard class="lg:col-span-8 rounded-[18px] border-0 ring-0">
        <div class="flex items-center justify-between">
          <h3 class="text-[16px] font-semibold text-gray-900">
            Sign ups
          </h3>
        </div>
        <div class="h-[250px] w-full overflow-hidden border-0 mt-auto">
          <ClientOnly>
            <apexchart
              type="bar"
              :height="250"
              :options="signUpsOptions"
              :series="signUpsSeries"
            />
          </ClientOnly>
        </div>
      </UCard>

      <!-- Tabs & Table -->
      <UCard
        class="rounded-[24px] border-0 ring-0"
        :ui="{ header: 'border-0 mb-0', body: 'p-0! px-[8px]!' }"
      >
        <template #header>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <UTabs
              :model-value="activeTab"
              :items="items"
              variant="link"
              :ui="{ content: 'hidden' }"
              @update:model-value="handleTabChange"
            />
            <div class="flex items-center gap-4">
              <UInput
                v-model="searchQuery"
                icon="i-lucide-search"
                placeholder="Search by name or email..."
                class="w-full md:w-[367px]"
                :ui="{ base: 'rounded-[36px] text-[14px] py-[10px]' }"
              />
              <!-- <USelect
                v-model="value"
                color="neutral"
                variant="outline"
                icon="i-lucide-list-filter"
                class="whitespace-nowrap rounded-[36px] text-[14px] py-[10px]"
                :items="sortBy"
                placeholder="Sort By"
              /> -->
            </div>
          </div>
        </template>

        <template v-if="filteredRows.length > 0">
          <SharedDataTable
            :columns="columns"
            :data="filteredRows"
            :card-fields="cardFields"
            @view-profile="handleViewProfile"
          />
        </template>
        <SharedEmptyState
          v-else
          icon="i-lucide-user-plus"
          :title="activeTab === 'lawyers' ? 'No new lawyers' : 'No new clients'"
          :description="activeTab === 'lawyers' ? 'There are no new lawyers to display right now.' : 'There are no new clients to display right now.'"
        />
      </UCard>

      <!-- Pagination -->
      <div
        v-if="filteredRows.length > 0"
        class="flex items-center justify-between text-sm text-gray-500 pt-2"
      >
        <span>Showing {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} users</span>
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
            v-for="page in visiblePages"
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
    </template>

    <!-- Profile Modal -->
    <NewUsersProfileModal
      v-model="showProfile"
      :user="selectedUser"
      @action-complete="() => fetchUsers(currentPage)"
    />
  </div>
</template>
