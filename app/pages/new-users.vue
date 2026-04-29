<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'

interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const filterDate = ref('This week')

const stats: StatItem[] = [
  { title: 'Total New Users', value: '258', trend: '+14%', trendType: 'positive', trendSuffix: 'vs last week' },
  { title: 'New Clients', value: '212', trend: '+14%', trendType: 'positive', trendSuffix: 'vs last week' },
  { title: 'New Lawyers', value: '47', trend: '+14%', trendType: 'positive', trendSuffix: 'vs last week' },
  { title: 'Pending verification', value: '4', trend: 'New lawyers awaiting review', trendType: 'neutral', trendSuffix: '' }
]

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

const signUpsSeries = [
  {
    name: 'Clients',
    data: [18, 14, 23, 11, 21, 8, 10]
  },
  {
    name: 'Lawyers',
    data: [11, 19, 18, 15, 17, 21, 18]
  }
]

const signUpsOptions = {
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
  grid: {
    strokeDashArray: 4,
    borderColor: '#f1f1f1'
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  }
}

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

const rows = [
  { id: 'PRET-02', name: 'Miles, Esther', contact: 'gravyface@mac.com', joined: '24 May, 2020', location: 'Kaduna', avatar: 'https://i.pravatar.cc/150?u=13' },
  { id: 'BSAD-21', name: 'Cooper, Kristin', contact: 'grolschie@mac.com', joined: '1 Feb, 2020', location: 'Anambra', avatar: 'https://i.pravatar.cc/150?u=14' },
  { id: 'WSCT-02', name: 'Nguyen, Shane', contact: 'bockelboy@att.net', joined: '8 Sep, 2020', location: 'Imo', avatar: 'https://i.pravatar.cc/150?u=15' },
  { id: 'BGHO-91', name: 'Henry, Arthur', contact: 'chinthaka@hotmail.com', joined: '22 Oct, 2020', location: 'Borno', avatar: 'https://i.pravatar.cc/150?u=16' },
  { id: 'VCST-09', name: 'Flores, Juanita', contact: 'giafly@hotmail.com', joined: '8 Sep, 2020', location: 'Kwara', avatar: 'https://i.pravatar.cc/150?u=17' }
]
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-semibold text-gray-900 leading-tight">
        Admin Dashboard
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

      <SharedDataTable
        :columns="columns"
        :data="rows"
      />
    </UCard>
  </div>
</template>
