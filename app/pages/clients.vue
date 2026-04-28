<script setup lang="ts">
const stats = [
  { title: 'Total Clients', value: '4,187', trend: '+12%', trendType: 'positive', trendSuffix: 'vs last month' },
  { title: 'Active', value: '634', trend: '91%', trendType: 'positive', trendSuffix: 'of total' },
  { title: 'Suspended', value: '47', trend: '+3', trendType: 'negative', trendSuffix: 'this week' },
  { title: 'New Users', value: '18', trend: 'This week', trendType: 'neutral' }
]

const columns = [
  { accessorKey: 'user', header: 'User' },
  { accessorKey: 'contact', header: 'Contact' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'joined', header: 'Joined' },
  { accessorKey: 'lastActive', header: 'Last active' },
  { accessorKey: 'actions', header: 'Actions' }
]

const clients = [
  { id: 'PRET-02', name: 'Miles, Esther', contact: 'gravyface@mac.com', status: 'New', joined: '24 May, 2020', lastActive: '3 months', avatar: 'https://i.pravatar.cc/150?u=13' },
  { id: 'BSAD-21', name: 'Cooper, Kristin', contact: 'grolschie@mac.com', status: 'Suspended', joined: '1 Feb, 2020', lastActive: '6 months', avatar: 'https://i.pravatar.cc/150?u=14' },
  { id: 'WSCT-02', name: 'Nguyen, Shane', contact: 'bockelboy@att.net', status: 'Active', joined: '8 Sep, 2020', lastActive: '1 month', avatar: 'https://i.pravatar.cc/150?u=15' },
  { id: 'BGHO-91', name: 'Henry, Arthur', contact: 'chinthaka@hotmail.com', status: 'Suspended', joined: '22 Oct, 2020', lastActive: '16 hours', avatar: 'https://i.pravatar.cc/150?u=16' },
  { id: 'VCST-09', name: 'Flores, Juanita', contact: 'giafly@hotmail.com', status: 'Active', joined: '8 Sep, 2020', lastActive: '8 hours', avatar: 'https://i.pravatar.cc/150?u=17' },
  { id: 'GSOC-02', name: 'Flores, Juanita', contact: 'sinclair@att.net', status: 'Active', joined: '17 Oct, 2020', lastActive: '7 months', avatar: 'https://i.pravatar.cc/150?u=18' },
  { id: 'PSDY-992', name: 'Miles, Esther', contact: 'miami@aol.com', status: 'Suspended', joined: '21 Sep, 2020', lastActive: '8 months', avatar: 'https://i.pravatar.cc/150?u=19' },
  { id: 'SDDT-02', name: 'Black, Marvin', contact: 'raines@optonline.net', status: 'Active', joined: '22 Oct, 2020', lastActive: '2 weeks', avatar: 'https://i.pravatar.cc/150?u=20' },
  { id: 'DUCD-02', name: 'Miles, Esther', contact: 'juliano@yahoo.ca', status: 'Active', joined: '8 Sep, 2020', lastActive: 'Permanent', avatar: 'https://i.pravatar.cc/150?u=21' },
  { id: 'DXCY-22', name: 'Cooper, Kristin', contact: 'kspiteri@live.com', status: 'Active', joined: '21 Sep, 2020', lastActive: '1 week', avatar: 'https://i.pravatar.cc/150?u=22' }
]

const searchQuery = ref('')
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 leading-tight">
        Admin Dashboard
      </h1>
      <UButton
        icon="i-lucide-calendar"
        color="neutral"
        variant="solid"
        class="shadow-sm"
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

    <!-- Clients List Card -->
    <UCard :ui="{ body: { padding: 'p-0' } }">
      <template #header>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 class="font-bold text-gray-900">
            Users list
          </h3>
          <div class="flex items-center gap-4">
            <UInput
              v-model="searchQuery"
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
                <UIcon
                  name="i-lucide-chevron-down"
                  class="ml-2 w-4 h-4"
                />
              </template>
            </UButton>
          </div>
        </div>
      </template>

      <SharedDataTable
        :columns="columns"
        :data="clients"
      />
    </UCard>
  </div>
</template>
