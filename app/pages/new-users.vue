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

const items = [
  { label: 'Clients (8)', slot: 'clients' },
  { label: 'Lawyers (5)', slot: 'lawyers' }
]

const columns = [
  { accessorKey: 'user', header: 'User' },
  { accessorKey: 'contact', header: 'Contact' },
  { accessorKey: 'joined', header: 'Joined' },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'actions', header: 'Actions' }
]

const cardFields = [
  { key: 'contact', label: 'Contact' },
  { key: 'joined', label: 'Joined' },
  { key: 'location', label: 'Location' }
]

const rows = ref([
  { id: 'PRET-02', name: 'Miles, Esther', contact: 'gravyface@mac.com', joined: '24 May, 2020', location: 'Kaduna', avatar: 'https://i.pravatar.cc/150?u=13' },
  { id: 'BSAD-21', name: 'Cooper, Kristin', contact: 'grolschie@mac.com', joined: '1 Feb, 2020', location: 'Anambra', avatar: 'https://i.pravatar.cc/150?u=14' },
  { id: 'WSCT-02', name: 'Nguyen, Shane', contact: 'bockelboy@att.net', joined: '8 Sep, 2020', location: 'Imo', avatar: 'https://i.pravatar.cc/150?u=15' },
  { id: 'BGHO-91', name: 'Henry, Arthur', contact: 'chinthaka@hotmail.com', joined: '22 Oct, 2020', location: 'Borno', avatar: 'https://i.pravatar.cc/150?u=16' },
  { id: 'VCST-09', name: 'Flores, Juanita', contact: 'giafly@hotmail.com', joined: '8 Sep, 2020', location: 'Kwara', avatar: 'https://i.pravatar.cc/150?u=17' }
])

const fetchUsers = async () => {
  const result = await getUsers()
  // Map real API data when available

  console.log(result, 'hh')
  if (result && result.data && result.data.user && result.data.user.data && result.data.user.data.success) {
    const userList = result.data.user.data.data
    const statistics = result.data.user.data.data.stats

    console.log(userList, 'hellow')

    stats.value = [
      { title: 'Total New Users', value: statistics.total_new_users.count, trend: statistics.total_new_users.change_pct, trendType: statistics.total_new_users.change_pct > -1 ? 'positive' : 'negative', trendSuffix: statistics.total_new_users.period },
      { title: 'New Clients', value: statistics.new_clients.count, trend: statistics.new_clients.change_pct, trendType: statistics.new_clients.change_pct > -1 ? 'positive' : 'negative', trendSuffix: statistics.new_clients.period },
      { title: 'New Lawyers', value: statistics.new_lawyers.count, trend: statistics.new_lawyers.change_pct, trendType: statistics.new_lawyers.change_pct > -1 ? 'positive' : 'negative', trendSuffix: statistics.new_lawyers.period },
      { title: 'Pending verification', value: statistics.pending_verification.count, trend: 'New lawyers awaiting review', trendType: 'neutral', trendSuffix: '' }
    ]

    // Sign Ups
    const lawyersSignups: any[] = []
    const clientsSignups: any[] = []

    userList.signups_chart.forEach((item: any) => {
      lawyersSignups.push(item.lawyers)
      clientsSignups.push(item.clients)
    })

    // sunday is the first day of the week but the api brings it as 7th
    lawyersSignups.unshift(lawyersSignups[lawyersSignups.length - 1])
    lawyersSignups.pop()
    clientsSignups.unshift(clientsSignups[clientsSignups.length - 1])
    clientsSignups.pop()

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
      joined: item.joined_at ? formatRelativeDate(item.joined_at) : '',
      location: item.location,
      avatar: item.profile_photo_url
    }))
  }
}

onMounted(async () => {
  await fetchUsers()
  skeleton.value = false
})

// Silent background refresh every 60 seconds
const { start } = useIntervalFetch(fetchUsers, 60000)
onMounted(() => start())
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-semibold text-gray-900 leading-tight">
        New Users
      </h1>
      <UButton
        icon="i-lucide-calendar"
        color="neutral"
        variant="solid"
        class="shadow-sm bg-white hover:bg-gray-100 focus:bg-gray-100 text-[#222222] p-[12.5px] rounded-full"
      >
        April 10, 2026 - May 11, 2026
        <template #trailing>
          <UIcon
            name="i-lucide-chevron-down"
            class="ml-2 w-4 h-4"
          />
        </template>
      </UButton>
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
          <div class="flex items-center gap-4">
            <USelect
              v-model="filterDate"
              :items="['This week', 'Last week', 'Last month']"
              variant="outline"
              class="w-28 rounded-[36px] text-[16px] py-[7px]"
            />
          </div>
        </div>
        <div class="h-[373px] w-full overflow-hidden border-0 mt-auto">
          <ClientOnly>
            <apexchart
              type="bar"
              :height="373"
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
              :items="items"
              variant="link"
              :ui="{ content: 'hidden' }"
            />
            <div class="flex items-center gap-4">
              <UInput
                icon="i-lucide-search"
                placeholder="Search by name or email..."
                class="w-full md:w-[367px]"
                :ui="{ base: 'rounded-[36px] text-[14px] py-[10px]' }"
              />
              <USelect
                v-model="value"
                color="neutral"
                variant="outline"
                icon="i-lucide-list-filter"
                class="whitespace-nowrap rounded-[36px] text-[14px] py-[10px]"
                :items="sortBy"
                placeholder="Sort By"
              />
            </div>
          </div>
        </template>

        <template v-if="rows.length > 0">
          <SharedDataTable
            :columns="columns"
            :data="rows"
            :card-fields="cardFields"
          />
        </template>
        <SharedEmptyState
          v-else
          icon="i-lucide-user-plus"
          title="No new users"
          description="There are no new users to display right now."
        />
      </UCard>
    </template>
  </div>
</template>
