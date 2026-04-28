<script setup lang="ts">
interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const stats: StatItem[] = [
  { title: 'Total Lawyers', value: '634', trend: '+8%', trendType: 'positive', trendSuffix: 'this week' },
  { title: 'Active Cases', value: '1,248', trend: '+12%', trendType: 'positive', trendSuffix: 'vs last month' },
  { title: 'Pending Review', value: '7', trendType: 'neutral' },
  { title: 'Case Acceptance', value: '84%', trend: '+3%', trendType: 'positive', trendSuffix: 'vs last month' }
]

const columns = [
  { accessorKey: 'user', header: 'Lawyer' },
  { accessorKey: 'specialty', header: 'Specialty' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'joined', header: 'Joined' },
  { accessorKey: 'lastActive', header: 'Last active' },
  { accessorKey: 'actions', header: 'Actions' }
]

const lawyers = [
  { id: 'LAW-01', name: 'Adaeze Okonkwo', specialty: 'Criminal Law', status: 'Active', joined: '24 May, 2020', lastActive: '2 min ago', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 'LAW-02', name: 'Emeka Nwachukwu', specialty: 'Family Law', status: 'Active', joined: '1 Feb, 2020', lastActive: '1 hr ago', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: 'LAW-03', name: 'Ngozi Amadi', specialty: 'Commercial Law', status: 'New', joined: '8 Sep, 2020', lastActive: '1s ago', avatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 'LAW-04', name: 'Seun Olatunji', specialty: 'Immigration', status: 'Active', joined: '22 Oct, 2020', lastActive: '30m ago', avatar: 'https://i.pravatar.cc/150?u=10' },
  { id: 'LAW-05', name: 'Justina Ogbonnaya', specialty: 'Labor Law', status: 'Active', joined: '8 Sep, 2020', lastActive: '3h ago', avatar: 'https://i.pravatar.cc/150?u=11' }
]

const searchQuery = ref('')
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 leading-tight">
        Lawyers Management
      </h1>
      <UButton
        icon="i-lucide-plus"
        color="primary"
        variant="solid"
        class="shadow-sm"
        label="Add New Lawyer"
      />
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SharedStatCard
        v-for="stat in stats"
        :key="stat.title"
        v-bind="stat"
      />
    </div>

    <!-- Lawyers List Card -->
    <UCard>
      <template #header>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 class="font-bold text-gray-900">
            Lawyers list
          </h3>
          <div class="flex items-center gap-4">
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              placeholder="Search by name or specialty..."
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
              Filter
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
        :data="lawyers"
      >
        <!-- Custom Specialty Cell -->
        <template #specialty-cell="{ row }">
          <span class="text-gray-600 font-medium">{{ (row.original as any).specialty }}</span>
        </template>
      </SharedDataTable>
    </UCard>
  </div>
</template>
