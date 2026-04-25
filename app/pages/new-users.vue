<script setup lang="ts">
const stats = [
  { title: 'Total New Users', value: '258', trend: '+14%', trendType: 'positive', trendSuffix: 'vs last week' },
  { title: 'New Clients', value: '212', trend: '+14%', trendType: 'positive', trendSuffix: 'vs last week' },
  { title: 'New Lawyers', value: '47', trend: '+14%', trendType: 'positive', trendSuffix: 'vs last week' },
  { title: 'Pending verification', value: '4', trend: 'New lawyers awaiting review', trendType: 'neutral', trendSuffix: '' }
]

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
    categories: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thur'],
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
      <h1 class="text-2xl font-bold text-gray-900 leading-tight">Admin Dashboard</h1>
      <UButton
        icon="i-lucide-calendar"
        color="neutral"
        variant="solid"
        class="shadow-sm"
      >
        April 10, 2026 - May 11, 2026
        <template #trailing>
          <UIcon name="i-lucide-chevron-down" class="ml-2 w-4 h-4" />
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
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-gray-900">Sign ups</h3>
          <USelect
            :options="['This week', 'Last week']"
            size="sm"
            variant="outline"
            class="w-32"
          />
        </div>
      </template>
      <div class="h-80 w-full overflow-hidden">
        <ClientOnly>
          <apexchart
            type="bar"
            height="320"
            :options="signUpsOptions"
            :series="signUpsSeries"
          />
        </ClientOnly>
      </div>
    </UCard>

    <!-- Tabs & Table -->
    <UCard :ui="{ body: { padding: 'p-0' } }">
      <template #header>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <UTabs :items="items" class="min-w-64" :ui="{ content: 'hidden' }" />
          
          <div class="flex items-center gap-4">
            <UInput
              icon="i-lucide-search"
              placeholder="Search by name or email..."
              size="sm"
              class="w-full md:w-64"
            />
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-list-filter"
              size="sm"
              class="whitespace-nowrap"
            >
              Sort by
              <template #trailing>
                <UIcon name="i-lucide-chevron-down" class="ml-2 w-4 h-4" />
              </template>
            </UButton>
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
