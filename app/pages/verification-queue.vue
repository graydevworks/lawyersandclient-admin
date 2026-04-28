<script setup lang="ts">
interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const stats: StatItem[] = [
  { title: 'Pending Review', value: '7', trend: '2 urgent', trendType: 'neutral' },
  { title: 'Avg. Review Time', value: '14h', trend: '-2h', trendType: 'positive', trendSuffix: 'vs last week' },
  { title: 'Approved Today', value: '12', trend: '+4', trendType: 'positive', trendSuffix: 'since morning' },
  { title: 'Rejection Rate', value: '5%', trendType: 'neutral' }
]

const columns = [
  { accessorKey: 'user', header: 'Lawyer' },
  { accessorKey: 'specialty', header: 'Specialty' },
  { accessorKey: 'submitted', header: 'Submitted' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'actions', header: 'Actions' }
]

const queue = [
  { id: 'VQ-01', name: 'Ngozi Amadi', specialty: 'Estate Planning & Administration', status: 'New', submitted: '1s ago', avatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 'VQ-02', name: 'Seun Olatunji', specialty: 'Immigration', status: 'New', submitted: '30m ago', avatar: 'https://i.pravatar.cc/150?u=10' },
  { id: 'VQ-03', name: 'Justina Ogbonnaya', specialty: 'Commercial Law', status: 'New', submitted: '3h ago', avatar: 'https://i.pravatar.cc/150?u=11' },
  { id: 'VQ-04', name: 'Emmanuel Amuneke', specialty: 'Insolvency', status: 'New', submitted: '5h ago', avatar: 'https://i.pravatar.cc/150?u=12' },
  { id: 'VQ-05', name: 'Folasayo Ogunnaike', specialty: 'Agency', status: 'New', submitted: '5h ago', avatar: 'https://i.pravatar.cc/150?u=9' }
]
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 leading-tight">
          Verification Queue
        </h1>
        <p class="text-sm text-gray-400">
          Manage lawyer identity and professional verification
        </p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SharedStatCard
        v-for="stat in stats"
        :key="stat.title"
        v-bind="stat"
      />
    </div>

    <!-- Queue List Card -->
    <UCard>
      <template #header>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 class="font-bold text-gray-900">
            Queue Items
          </h3>
          <div class="flex items-center gap-4">
            <USelect
              :options="['Show all', 'Pending only', 'Rejected']"
              size="sm"
              variant="outline"
              class="w-40"
            />
          </div>
        </div>
      </template>

      <SharedDataTable
        :columns="columns"
        :data="queue"
      >
        <template #submitted-cell="{ row }">
          <span class="text-gray-500">{{ (row.original as any).submitted }}</span>
        </template>
        <template #specialty-cell="{ row }">
          <span class="text-gray-600 font-medium">{{ (row.original as any).specialty }}</span>
        </template>
      </SharedDataTable>
    </UCard>
  </div>
</template>
