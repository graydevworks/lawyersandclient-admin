<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { formatRelativeDate } from '~/util/helper'

definePageMeta({ middleware: 'auth' })

// --- Fetch lawyers data on mount ---
const { getLawyers } = useLawyers()

const skeleton = ref(true)

interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const stats = ref<StatItem[]>([])

const value = ref('Location')

const columns = [
  { accessorKey: 'user', header: 'User' },
  { accessorKey: 'email', header: 'Contact' },
  { accessorKey: 'status', header: 'Verification' },
  { accessorKey: 'joined', header: 'Joined' },
  { accessorKey: 'userCode', header: 'User Code' },
  { accessorKey: 'actions', header: 'Actions' }
]

const cardFields = [
  { key: 'email', label: 'Email' },
  { key: 'joined', label: 'Joined' },
  { key: 'userCode', label: 'User Code' }
]

const lawyers = ref([])

const sortBy = ref<SelectItem[]>([
  {
    type: 'label',
    label: 'Sort by',
    icon: 'i-lucide-sort'
  },
  'Location',
  'Date Joined'
])

const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)

const fetchLawyers = async (page: number = 1) => {
  const result = await getLawyers({ page, per_page: perPage.value })
  // Map real API data when available

  console.log(result)
  if (result && result.data && result.data.lawyers && result.data.lawyers.data && result.data.lawyers.data.success) {
    const lawyerList = result.data.lawyers.data.data
    const statistics = result.data.lawyers.data.data.stats
    const meta = result.data.lawyers.data.meta

    currentPage.value = meta.current_page || 1
    totalItems.value = meta.total || 0
    totalPages.value = meta.last_page || 1

    console.log(lawyerList, statistics)

    stats.value = [
      { title: 'Total Lawyers', value: statistics.total, trend: '', trendType: 'positive', trendSuffix: '' },
      { title: 'Pending Lawyers', value: statistics.pending, trend: '', trendType: 'positive', trendSuffix: '' },
      { title: 'Suspended Lawyers', value: statistics.suspended, trend: '', trendType: 'positive', trendSuffix: '' },
      { title: 'Rejected Lawyers', value: statistics.rejected, trend: '', trendType: 'positive', trendSuffix: '' }
    ]

    // lawyer list

    lawyers.value = lawyerList.lawyers.map((lawyer: any) => ({
      id: lawyer.id,
      name: lawyer.full_name,
      email: lawyer.email,
      status: lawyer.verification_status,
      joined: lawyer.joined_at ? formatRelativeDate(lawyer.joined_at) : '',
      userCode: lawyer.user_code,
      avatar: lawyer.profile_photo_url,
      responseRate: lawyer.average_rating
    }))
  }
}

const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchLawyers(currentPage.value)
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchLawyers(currentPage.value)
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchLawyers(page)
}

onMounted(async () => {
  await fetchLawyers()
  skeleton.value = false
})

// Silent background refresh every 60 seconds
const { start } = useIntervalFetch(() => fetchLawyers(currentPage.value), 60000)
onMounted(() => start())
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-semibold text-gray-900 leading-tight">
        Lawyers
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
            <USkeleton class="h-6 w-16 rounded-full" />
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

      <!-- Lawyers List Card -->
      <UCard
        class="lg:col-span-8 rounded-[18px] border-0 ring-0"
        :ui="{ header: 'border-0 mb-0', body: 'p-0! px-[8px]!' }"
      >
        <template #header>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 class="text-[16px] font-semibold text-gray-900">
              Lawyers list
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

        <template v-if="lawyers.length > 0">
          <SharedDataTable
            :columns="columns"
            :data="lawyers"
            :card-fields="cardFields"
            link-prefix="/lawyers"
            @view-profile="(e) => { $router.push(`/lawyers/${e.id}`) }"
          >
            <template #email-cell="{ row }">
              <span class="text-gray-600 font-medium">{{ (row.original as any).email }}</span>
            </template>
          </SharedDataTable>
        </template>
        <SharedEmptyState
          v-else
          icon="i-lucide-briefcase"
          title="No lawyers found"
          description="There are no lawyers to display right now."
        />
      </UCard>

      <!-- Pagination -->
      <div
        v-if="lawyers.length > 0"
        class="flex items-center justify-between text-sm text-gray-500 pt-2"
      >
        <span>Showing {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} lawyers</span>
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
            v-for="page in Math.min(5, totalPages)"
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
  </div>
</template>
