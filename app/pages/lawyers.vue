<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'

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

const value = ref('Location')

const columns = [
  { accessorKey: 'user', header: 'User' },
  { accessorKey: 'email', header: 'Contact' },
  { accessorKey: 'status', header: 'Verification' },
  { accessorKey: 'joined', header: 'Joined' },
  { accessorKey: 'lastActive', header: 'Last active' },
  { accessorKey: 'actions', header: 'Actions' }
]

const lawyers = [
  { id: 'LAW-01', name: 'Adaeze Okonkwo', email: 'adeze@example.com', status: 'Pending', joined: '24 May, 2020', lastActive: '2 min ago', avatar: 'https://i.pravatar.cc/150?u=1', responseRate: 80 },
  { id: 'LAW-02', name: 'Emeka Nwachukwu', email: 'emeka@example.com', status: 'Rejected', joined: '1 Feb, 2020', lastActive: '1 hr ago', avatar: 'https://i.pravatar.cc/150?u=6', responseRate: 90 },
  { id: 'LAW-03', name: 'Ngozi Amadi', email: 'ngozi@example.com', status: 'Verified', joined: '8 Sep, 2020', lastActive: '1s ago', avatar: 'https://i.pravatar.cc/150?u=8', responseRate: 70 },
  { id: 'LAW-04', name: 'Seun Olatunji', email: 'seun@example.com', status: 'Pending', joined: '22 Oct, 2020', lastActive: '30m ago', avatar: 'https://i.pravatar.cc/150?u=10', responseRate: 85 },
  { id: 'LAW-05', name: 'Justina Ogbonnaya', email: 'justina@example.com', status: 'Pending', joined: '8 Sep, 2020', lastActive: '3h ago', avatar: 'https://i.pravatar.cc/150?u=11', responseRate: 95 }
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

    <!-- Lawyers List Card -->
    <UCard
      class="lg:col-span-8 rounded-[18px] border-0 ring-0"
      :ui="{ header: 'border-0 mb-0', body: 'p-0! px-[8px]!' }"
    >
      <template #header>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 class="text-[16px] font-semibold text-gray-900">
            Recent activity
          </h3>
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
        :data="lawyers"
        link-prefix="/lawyers"
      >
        <template #email-cell="{ row }">
          <span class="text-gray-600 font-medium">{{ (row.original as any).email }}</span>
        </template>
      </SharedDataTable>
    </UCard>
  </div>
</template>
