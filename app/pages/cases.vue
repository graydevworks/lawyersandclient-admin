<script setup lang="ts">
import CaseDetailsModal from '~/components/cases/CaseDetailsModal.vue'

interface CaseRow {
  id: string
  date: string
  matter: string
  category: string
  client: string
  location: string
  lawyer: string
  lawyerLoc: string
  status: string
  duration: string
}

interface CaseDetails {
  id: string
  matter: string
  category: string
  client: {
    name: string
    location: string
  }
  lawyer: {
    name: string
    location: string
  }
  practiceArea: string
  status: 'Active' | 'Stalled' | 'Pending' | 'Completed'
  openedDate: string
  timeElapsed: string
  lastActivity: string
}

interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const stats: StatItem[] = [
  { title: 'Total active cases', value: '318', trend: '+24', trendType: 'positive', trendSuffix: 'this month' },
  { title: 'Completed this month', value: '91', trendType: 'neutral', trendSuffix: 'Avg. 14 days to close' },
  { title: 'Stalled cases', value: '16', trend: 'No activity 7+ days', trendType: 'negative' },
  { title: 'Avg. case duration', value: '14d', trend: '-2d', trendType: 'positive', trendSuffix: 'this month' }
]

interface CaseRow {
  id: string
  date: string
  matter: string
  category: string
  client: string
  location: string
  lawyer: string
  lawyerLoc: string
  status: string
  duration: string
}

const cases: CaseRow[] = [
  { id: '39635', date: 'Today', matter: 'Wrongful termination claim', category: 'Media Law', client: 'Adese Samson', location: 'Oyo', lawyer: 'Ebubechukwu Agnes', lawyerLoc: 'Cross River', status: 'Active', duration: '9 Days' },
  { id: '43178', date: 'Today', matter: 'Child custody dispute', category: 'Entertainment', client: 'Folasayo Ogunnaike', location: 'Lagos', lawyer: 'Folasayo Ogunnaike', lawyerLoc: 'Imo', status: 'Active', duration: '3 Days' },
  { id: '22739', date: 'Today', matter: 'Land title fraud recovery', category: 'Municipality/ panchayat etc', client: 'Ogunmodede Smart', location: 'Ogun', lawyer: 'Hameed Yusuf', lawyerLoc: 'Yobe', status: 'Stalled', duration: '7 Days' },
  { id: '22739', date: 'Today', matter: 'Business contract breach', category: 'Medical Malpractice /negligence', client: '-', location: 'Kebbi', lawyer: 'Boluwatife Olusola', lawyerLoc: 'Bauchi', status: 'Active', duration: '5 Days' },
  { id: '97174', date: 'Today', matter: 'Wrongful termination claim', category: 'Public Procurement', client: 'Ebubechukwu Agnes', location: 'Anambra', lawyer: 'Toluwani Bakare', lawyerLoc: 'Adamawa', status: 'Active', duration: '10 Days' },
  { id: '43756', date: 'Today', matter: 'Child custody dispute', category: 'Data Protection and Privacy', client: 'Femi Babalola', location: 'Niger', lawyer: 'Hannah Pedro', lawyerLoc: 'Zamfara', status: 'Pending', duration: '8 Days' },
  { id: '22739', date: 'Today', matter: 'Women’s Rights', category: 'Technology Law', client: 'Hannah Pedro', location: 'Plateau', lawyer: 'Justina Ogbonnaya', lawyerLoc: 'Delta', status: 'Active', duration: '6 Days' },
  { id: '97174', date: 'Today', matter: 'Land title fraud recovery', category: 'Trusts and Estates', client: 'Hameed Yusuf', location: 'Zamfara', lawyer: 'Esther Joel', lawyerLoc: 'Ekiti', status: 'Stalled', duration: '2 Days' },
  { id: '70668', date: 'Today', matter: 'Business contract breach', category: 'Antitrust Law', client: 'Justina Ogbonnaya', location: 'Katsina', lawyer: 'Emmanuel Amuneke', lawyerLoc: 'Ondo', status: 'Pending', duration: '1 Day' },
  { id: '22739', date: 'Today', matter: 'New user registered', category: 'Non- Litigation practice', client: 'Toluwani Bakare', location: 'Gombe', lawyer: 'Daniel Samuel', lawyerLoc: 'Sokoto', status: 'Completed', duration: '4 Days' }
]

const columns = [
  { accessorKey: 'id', header: 'Case ID' },
  { accessorKey: 'matter', header: 'Matter' },
  { accessorKey: 'client', header: 'Client' },
  { accessorKey: 'lawyer', header: 'Lawyer' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'duration', header: 'Duration' },
  { accessorKey: 'actions', header: 'Action' }
]

const isModalOpen = ref(false)
const selectedCase = ref<CaseDetails | null>(null)

// const viewCase = (row: any) => {
//   selectedCase.value = {
//     id: row.id,
//     matter: row.matter,
//     category: row.category.toUpperCase(),
//     client: {
//       name: row.client,
//       location: row.location
//     },
//     lawyer: {
//       name: row.lawyer,
//       location: row.lawyerLoc
//     },
//     practiceArea: row.category,
//     status: row.status as 'Active' | 'Stalled' | 'Pending' | 'Completed',
//     openedDate: '22 Mar 2026', // Mock fixed date
//     timeElapsed: row.duration,
//     lastActivity: 'Yesterday' // Mock fixed activity
//   }
//   isModalOpen.value = true
// }

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success'
    case 'stalled': return 'warning'
    case 'pending': return 'warning'
    case 'completed': return 'success'
    default: return 'secondary'
  }
}

const activeFilter = ref('All')
const filters = ['All', 'Stalled', 'Completed']
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 leading-tight">
          Cases
        </h1>
        <p class="text-sm text-gray-500">
          All active lawyer-client engagements •
        </p>
      </div>
      <UButton
        icon="i-lucide-calendar"
        color="neutral"
        variant="outline"
        class="bg-white text-gray-700 border-gray-200 font-semibold shadow-sm"
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

    <!-- Table Section -->
    <UCard class="overflow-hidden rounded-[18px] border-0 ring-0">
      <!-- Filter Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="flex-1 max-w-lg">
          <UInput
            icon="i-lucide-search"
            placeholder="Search by name or email..."
            class="w-full md:w-[367px]"
            :ui="{ base: 'rounded-[36px] text-[14px] py-[10px]' }"
          />
        </div>

        <div class="flex items-center gap-4">
          <USelect
            placeholder="All statuses"
            color="neutral"
            variant="outline"
            icon="i-lucide-list-filter"
            class="whitespace-nowrap rounded-[36px] text-[14px] py-[10px]"
            :items="['All categories']"
          />
          <USelect
            placeholder="All categories"
            color="neutral"
            variant="outline"
            icon="i-lucide-list-filter"
            class="whitespace-nowrap rounded-[36px] text-[14px] py-[10px]"
            :items="['All categories']"
          />

          <div class="flex bg-gray-100 p-0.5 rounded-lg ml-2">
            <button
              v-for="filter in filters"
              :key="filter"
              class="px-5 py-1.5 text-sm font-medium rounded-md transition-all"
              :class="activeFilter === filter ? 'bg-white text-[#003357] shadow-sm' : 'text-gray-500 hover:text-gray-900'"
              @click="activeFilter = filter"
            >
              {{ filter }}
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Table -->
      <UTable
        :data="cases"
        :columns="columns"
        :ui="{
          base: 'divider-none border-none mt-4',
          th: 'divider-none border-none! font-light!',
          tr: 'divider-none border-none!',
          thead: 'divider-none border-none bg-[#F9F9FB]',
          separator: 'hidden'
        }"
      >
        <template #id-cell="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-900">ID: {{ row.original.id }}</span>
            <span class="text-[12px] text-gray-400 font-medium">{{ row.original.date }}</span>
          </div>
        </template>

        <template #matter-cell="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-900">{{ row.original.matter }}</span>
            <span class="text-[12px] text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
              {{ row.original.category }}
            </span>
          </div>
        </template>

        <template #client-cell="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-900">{{ row.original.client }}</span>
            <span class="text-[12px] text-gray-400 font-medium">{{ row.original.location }}</span>
          </div>
        </template>

        <template #lawyer-cell="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-900">{{ row.original.lawyer }}</span>
            <span class="text-[12px] text-gray-400 font-medium">{{ row.original.lawyerLoc }}</span>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            v-if="row.original.status"
            :color="getStatusColor(row.original.status) as any"
            variant="subtle"
            class="rounded-full px-2.5 h-[28px] text-[12px] font-medium"
          >
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #duration-cell="{ row }">
          <span class="text-sm font-medium text-gray-900">{{ row.original.duration }}</span>
        </template>

        <!-- Custom Actions Cell -->
        <template #actions-cell="{ row }">
          <UButton
            label="View"
            variant="outline"
            color="neutral"
            size="xs"
            class="font-semibold text-[#003357] border-[#E2E8F0] hover:bg-[#F8F9FB] py-[9px] px-[12px] rounded-[4px] text-[13px]"
            :to="`/user/${row.original.id}`"
          />
        </template>
      </UTable>

      <!-- Pagination Footer -->
      <div class="px-6 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/20">
        <div class="text-xs text-gray-500">
          Showing 1–10 of {{ cases.length }} cases
        </div>
        <UPagination
          :model-value="1"
          :total="10"
          :items-per-page="10"
          :first-icon="false"
          class="gap-1"
        >
          <template #first>
            <UButton class="bg-white! hidden text-neutral-700 border border-[#E8EAED]" />
          </template>
          <template #next>
            <UButton class="bg-white! text-neutral-700 border border-[#E8EAED]">
              Next <UIcon name="iconoir:arrow-right" />
            </UButton>
          </template>
          <template #prev>
            <UButton class="bg-white! text-neutral-700 border border-[#E8EAED]">
              <UIcon name="iconoir:arrow-left" />
              Prev
            </UButton>
          </template>
          <template #last>
            <UButton class="bg-white! hidden text-neutral-700 border border-[#E8EAED]" />
          </template>
        </UPagination>
      </div>
    </UCard>

    <CaseDetailsModal
      v-model="isModalOpen"
      :case-data="selectedCase"
    />
  </div>
</template>
