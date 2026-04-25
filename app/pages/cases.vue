<script setup lang="ts">
import CaseDetailsModal from '~/components/cases/CaseDetailsModal.vue'

const stats = [
  { title: 'Total active cases', value: '318', trend: '+24', trendType: 'positive', trendSuffix: 'this month' },
  { title: 'Completed this month', value: '91', trendType: 'neutral', trendSuffix: 'Avg. 14 days to close' },
  { title: 'Stalled cases', value: '16', trend: 'No activity 7+ days', trendType: 'negative' },
  { title: 'Avg. case duration', value: '14d', trend: '-2d', trendType: 'positive', trendSuffix: 'this month' }
]

const cases = [
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
  { key: 'id', label: 'Case ID' },
  { key: 'matter', label: 'Matter' },
  { key: 'client', label: 'Client' },
  { key: 'lawyer', label: 'Lawyer' },
  { key: 'status', label: 'Status' },
  { key: 'duration', label: 'Duration' },
  { key: 'actions', label: '' }
]

const isModalOpen = ref(false)
const selectedCase = ref<any>(null)

const viewCase = (row: any) => {
  selectedCase.value = {
    id: row.id,
    matter: row.matter,
    category: row.category.toUpperCase(),
    client: {
      name: row.client,
      location: row.location
    },
    lawyer: {
      name: row.lawyer,
      location: row.lawyerLoc
    },
    practiceArea: row.category,
    status: row.status,
    openedDate: '22 Mar 2026', // Mock fixed date
    timeElapsed: row.duration,
    lastActivity: 'Yesterday' // Mock fixed activity
  }
  isModalOpen.value = true
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'emerald'
    case 'stalled': return 'red'
    case 'pending': return 'orange'
    case 'completed': return 'blue'
    default: return 'gray'
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
        <h1 class="text-2xl font-bold text-gray-900 leading-tight">Cases</h1>
        <p class="text-sm text-gray-500">All active lawyer-client engagements •</p>
      </div>
      <UButton
        icon="i-lucide-calendar"
        color="neutral"
        variant="outline"
        class="bg-white text-gray-700 border-gray-200 font-semibold shadow-sm"
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

    <!-- Table Section -->
    <UCard :ui="{ body: { padding: 'p-0 sm:p-0' } }" class="overflow-hidden">
      <!-- Filter Bar -->
      <div class="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100">
        <div class="flex-1 max-w-lg">
          <UInput
            icon="i-lucide-search"
            placeholder="Search by case ID, client, or lawyer"
            class="w-full"
            variant="ghost"
            :ui="{ icon: { trailing: { pointer: '' } }, base: 'bg-gray-50 border-0 focus:ring-1 focus:ring-gray-200' }"
          />
        </div>
        
        <div class="flex items-center gap-4">
          <USelect
            :options="['All statuses']"
            variant="ghost"
            class="bg-gray-50/50"
            size="sm"
          />
          <USelect
            :options="['All categories']"
            variant="ghost"
            class="bg-gray-50/50"
            size="sm"
          />
          
          <div class="flex bg-gray-100 p-0.5 rounded-lg ml-2">
            <button
              v-for="filter in filters"
              :key="filter"
              @click="activeFilter = filter"
              class="px-5 py-1.5 text-sm font-medium rounded-md transition-all"
              :class="activeFilter === filter ? 'bg-white text-[#003357] shadow-sm' : 'text-gray-500 hover:text-gray-900'"
            >
              {{ filter }}
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Table -->
      <UTable :rows="cases" :columns="columns" :ui="{ 
        thead: 'bg-gray-50/50',
        th: { base: 'text-[10px] font-bold text-gray-500 uppercase tracking-widest py-4' },
        td: { base: 'py-5 align-top' }
      }">
        <template #id-data="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-bold text-gray-900">ID: {{ row.id }}</span>
            <span class="text-[11px] text-gray-400 font-medium">{{ row.date }}</span>
          </div>
        </template>

        <template #matter-data="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-bold text-gray-900">{{ row.matter }}</span>
            <span class="text-[11px] text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
              {{ row.category }}
            </span>
          </div>
        </template>

        <template #client-data="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-bold text-gray-900">{{ row.client }}</span>
            <span class="text-[11px] text-gray-400 font-medium">{{ row.location }}</span>
          </div>
        </template>

        <template #lawyer-data="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-bold text-gray-900">{{ row.lawyer }}</span>
            <span class="text-[11px] text-gray-400 font-medium">{{ row.lawyerLoc }}</span>
          </div>
        </template>

        <template #status-data="{ row }">
          <UBadge
            :color="getStatusColor(row.status)"
            variant="subtle"
            class="rounded-full px-3 py-0.5 font-bold"
          >
            {{ row.status }}
          </UBadge>
        </template>

        <template #duration-data="{ row }">
          <span class="text-sm font-semibold text-gray-900">{{ row.duration }}</span>
        </template>

        <template #actions-data="{ row }">
          <UButton
            label="View"
            variant="ghost"
            class="text-[#003357] font-bold border border-gray-100 px-4 hover:bg-gray-50"
            size="xs"
            @click="viewCase(row)"
          />
        </template>
      </UTable>

      <!-- Pagination Footer -->
      <div class="px-6 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/20">
        <div class="text-xs text-gray-400 font-medium">
          Showing 1–10 of 89 activities
        </div>
        <UPagination
          :total="89"
          :model-value="1"
          :page-count="10"
          :ui="{
            wrapper: 'gap-1',
            base: 'min-w-[32px] h-8 flex items-center justify-center font-bold text-xs',
            active: 'bg-[#003357] text-white',
            inactive: 'text-gray-500 hover:bg-gray-100'
          }"
        />
      </div>
    </UCard>

    <CaseDetailsModal
      v-model="isModalOpen"
      :case-data="selectedCase"
    />
  </div>
</template>
