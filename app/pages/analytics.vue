<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatCompactNumber } from '~/util/helper'
import { displayApiError } from '~/util/apiHelper'

definePageMeta({ middleware: 'auth' })

// --- Fetch analytics data on mount ---
const { getAnalytics } = useAnalytics()

const skeleton = ref(true)
const listError = ref('')
const hasFetchError = ref(false)

const showDatePicker = ref(false)

interface StatItem {
  id: number
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
  sparklineData?: number[]
  color?: string
  secondColor?: string
  withChart: boolean
}

const stats = ref<StatItem[]>([
  { id: 1, title: 'Total users', value: '4,281', trend: '+12%', trendType: 'positive', trendSuffix: 'vs 4,302 last month', sparklineData: [30, 40, 35, 50, 49, 60, 70, 91], color: '#013355', secondColor: '#8BCFFE', withChart: true },
  { id: 2, title: 'Active users', value: '1,243', trend: '+7%', trendType: 'positive', trendSuffix: '25.8% of total base', sparklineData: [20, 30, 25, 40, 39, 50, 60, 80], color: '#008236', secondColor: '#00823633', withChart: true },
  { id: 3, title: 'Case acceptance rate', value: '38.4%', trend: '+3%', trendType: 'positive', trendSuffix: 'vs 35.2% last period', sparklineData: [10, 20, 15, 30, 29, 40, 50, 70], color: '#4A0155', secondColor: '#4A015533', withChart: true },
  { id: 4, title: 'Lawyer-client match rate', value: '61.7%', trend: '-2%', trendType: 'negative', trendSuffix: 'vs 63.1% last period', sparklineData: [80, 70, 75, 60, 61, 50, 40, 30], color: '#FD9A00', secondColor: '#FD9A004D', withChart: true }
])

const userGrowthSeries = ref([
  { name: 'Clients', data: [1200, 1500, 2800, 2400, 3200, 3500, 4200, 4800] },
  { name: 'Lawyers', data: [1100, 1400, 1800, 1700, 2100, 2400, 3100, 3800] }
])

const userGrowthOptions = ref({
  chart: { type: 'line', toolbar: { show: false } },
  colors: ['#003357', '#93E2FF'],
  stroke: { curve: 'smooth', width: 3 },
  xaxis: { categories: ['Mar 1', 'Mar 8', 'Mar 14', 'Mar 18', 'Mar 22', 'Mar 26', 'Mar 30', 'Apr 1', 'Apr 4'] },
  yaxis: {
    labels: {
      formatter: (val: number) => formatCompactNumber(val)
    }
  },
  grid: { strokeDashArray: 4 },
  legend: { position: 'top', horizontalAlign: 'left' }
})

const dateRange = ref({ start: null as Date | null, end: null as Date | null })

// Format dates for the date range
const selectedDateFrom = computed({
  get: () => dateRange.value.start ? dateRange.value.start.toISOString().split('T')[0] : '',
  set: (val: string) => { dateRange.value.start = val ? new Date(val) : null }
})

const selectedDateTo = computed({
  get: () => dateRange.value.end ? dateRange.value.end.toISOString().split('T')[0] : '',
  set: (val: string) => { dateRange.value.end = val ? new Date(val) : null }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatChartDataByPeriod = (data: any[]): { categories: string[], clientData: number[], lawyerData: number[] } => {
  if (!data || data.length === 0) {
    return { categories: [], clientData: [], lawyerData: [] }
  }

  const clientData: number[] = []
  const lawyerData: number[] = []
  const categories: string[] = []

  // Always show monthly data - aggregate by month
  const monthlyData = new Map<string, { clients: number, lawyers: number, display: string }>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.forEach((point: any) => {
    const date = new Date(point.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = new Date(date.getFullYear(), date.getMonth()).toLocaleString('default', { month: 'short' })

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { clients: 0, lawyers: 0, display: monthName })
    }
    const existing = monthlyData.get(monthKey)!
    existing.clients += point.clients
    existing.lawyers += point.lawyers
  })

  // Sort by date and push to arrays
  Array.from(monthlyData.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .forEach(([_key, value]) => {
      categories.push(value.display)
      clientData.push(value.clients)
      lawyerData.push(value.lawyers)
    })

  return { categories, clientData, lawyerData }
}

const practiceAreaSeries = ref([0, 0, 0, 0, 0])
const practiceAreaOptions = computed(() => {
  return {
    chart: { type: 'donut' },
    labels: [] as string[],
    colors: ['#60A5FA', '#34D399', '#FB923C', '#F87171', '#1c1c1c'],
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'lawyers',

              formatter: () => {
                const total = practiceAreaSeries.value.reduce((a, b) => a + b, 0)
                return String(total) || '0'
              }
            }
          }
        }
      }
    }
  }
})

type ProgressColor = 'success' | 'primary' | 'neutral' | 'error' | 'info' | 'warning' | 'secondary'

const categories = ref<{
  label: string
  value: number
  color: ProgressColor
  pct: number
  total: number
}[]>([])

const experience = ref<{
  label: string
  value: number
  color: ProgressColor
  total: number
}[]>([])

const locations = ref<{
  name: string
  clients: number
  lawyers: number
  clientsTotal: number
  lawyersTotal: number
  topLga: string
}[]>([])

const locationDateRange = ref({ start: null as Date | null, end: null as Date | null })
const locationDateFrom = computed({
  get: () => locationDateRange.value.start ? locationDateRange.value.start.toISOString().split('T')[0] : '',
  set: (val: string) => { locationDateRange.value.start = val ? new Date(val) : null }
})
const locationDateTo = computed({
  get: () => locationDateRange.value.end ? locationDateRange.value.end.toISOString().split('T')[0] : '',
  set: (val: string) => { locationDateRange.value.end = val ? new Date(val) : null }
})

const locationsLoading = ref(false)

const applyLocationsFilter = async () => {
  if (locationDateFrom.value && !locationDateTo.value) return
  if (locationDateTo.value && !locationDateFrom.value) return

  locationsLoading.value = true
  try {
    await fetchAnalytics()
  } finally {
    locationsLoading.value = false
  }
}

const fetchAnalytics = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: Record<string, any> = {}

  if (locationDateFrom.value && locationDateTo.value) {
    params.date_from = locationDateFrom.value
    params.date_to = locationDateTo.value
  } else if (selectedDateFrom.value && selectedDateTo.value) {
    params.date_from = selectedDateFrom.value
    params.date_to = selectedDateTo.value
  } else {
    params.period = '30_days'
  }

  listError.value = ''
  hasFetchError.value = false

  const result = await getAnalytics(params)

  if (!result?.success) {
    listError.value = result.validationMessages[0]
    hasFetchError.value = true
    return
  }

  if (result && result.data && (result.data as any).data && (result.data as any).data.success) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const data = (result.data as any).data.data // eslint-disable-line @typescript-eslint/no-explicit-any
    console.log(data, 'result')
    // Map real API data if available — for now the page uses static data
    // as the analytics API may not return all fields yet
    stats.value = [
      { id: 1, title: 'Total users', value: data.cards.total_users.count, trend: String(data.cards.total_users.change_pct), trendType: data.cards.total_users.change_pct > -1 ? 'positive' : 'negative', trendSuffix: `vs ${data.cards.total_users.count} last month`, sparklineData: [30, 40, 35, 50, 49, 60, 70, 91], color: '#013355', secondColor: '#8BCFFE', withChart: true },
      //
      { id: 2, title: 'Active users', value: data.cards.active_users.count, trend: String(data.cards.active_users.change_pct), trendType: data.cards.active_users.change_pct > -1 ? 'positive' : 'negative', trendSuffix: `${data.cards.active_users.count} of total base`, sparklineData: [20, 30, 25, 40, 39, 50, 60, 80], color: '#008236', secondColor: '#00823633', withChart: true },
      //
      { id: 3, title: 'Case acceptance rate', value: data.cards.case_acceptance_rate.value_pct + '%', trend: String(data.cards.case_acceptance_rate.change_pct), trendType: data.cards.case_acceptance_rate.change_pct > -1 ? 'positive' : 'negative', trendSuffix: `vs ${data.cards.case_acceptance_rate.value_pct} last period`, sparklineData: [10, 20, 15, 30, 29, 40, 50, 70], color: '#4A0155', secondColor: '#4A015533', withChart: true },
      //
      { id: 4, title: 'Lawyer-client match rate', value: data.cards.lawyer_client_match_rate.value_pct + '%', trend: String(data.cards.lawyer_client_match_rate.change_pct), trendType: data.cards.lawyer_client_match_rate.change_pct > -1 ? 'positive' : 'negative', trendSuffix: `vs ${data.cards.lawyer_client_match_rate.value_pct} last period`, sparklineData: [80, 70, 75, 60, 61, 50, 40, 30], color: '#FD9A00', secondColor: '#FD9A004D', withChart: true }
    ]

    // area chart
    const clientList = []
    const lawyerList = []
    const dateList = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.user_growth.points.forEach((point: any) => {
      clientList.push(point.clients)
      lawyerList.push(point.lawyers)
      dateList.push(point.date)
    })

    // Format chart data - always group by monthly
    const formatted = formatChartDataByPeriod(data.user_growth.points)

    userGrowthSeries.value = [
      { name: 'Clients', data: formatted.clientData },
      { name: 'Lawyers', data: formatted.lawyerData }
    ]

    userGrowthOptions.value = {
      ...userGrowthOptions.value,
      xaxis: { categories: formatted.categories }
    }

    // practice area chart

    practiceAreaSeries.value = []
    practiceAreaOptions.value.labels = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.practice_area_breakdown.items.forEach((area: any) => {
      practiceAreaSeries.value.push(area.pct)
      practiceAreaOptions.value.labels.push(area.name)
    })

    console.log(practiceAreaSeries.value, practiceAreaOptions.value.labels)

    // categories
    categories.value = data.case_categories_distribution.items.map((category: {
      name: string
      count: number
      pct: number
      total: number
    }) => ({
      label: category.name,
      value: category.count,
      color: 'success' as ProgressColor,
      pct: category.pct,
      total: category.total || 100
    }))

    // experience
    experience.value = data.lawyer_experience_distribution.items.map((exp: {
      label: string
      count: number
      pct: number
    }) => ({
      label: exp.label,
      value: exp.count,
      color: 'info' as ProgressColor,
      pct: exp.pct || 100
    }))

    // location

    locations.value = data.locations.items.map((exp: {
      name: string
      clients: number
      lawyers: number
      total: number
      top_lgas: {
        name: string
        total: number
      }[]
    }) => ({
      name: exp.name,
      clients: exp.clients,
      lawyers: exp.lawyers,
      clientsTotal: exp.clients,
      lawyersTotal: exp.lawyers,
      total: exp.total,
      topLga: exp.top_lgas
    }))
  }
}

onMounted(async () => {
  await fetchAnalytics()
  skeleton.value = false
})

// Real-time: poll every 30 seconds
const { start } = useIntervalFetch(fetchAnalytics, 30000)
onMounted(() => start())
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-[16px] font-bold text-gray-900 leading-tight">
          Analytics
        </h1>
        <p class="text-[14px] text-gray-400">
          Platform insights and trends
        </p>
      </div>
      <div class="flex items-center gap-2 relative">
        <SharedDateRangePicker
          v-model:from="selectedDateFrom"
          v-model:to="selectedDateTo"
          variant="header"
          @apply="fetchAnalytics"
          @clear="() => { selectedDateFrom = ''; selectedDateTo = ''; fetchAnalytics() }"
        />
      </div>
    </div>

    <!-- Error Banner -->
    <SharedErrorBanner
      v-if="hasFetchError"
      :message="listError"
    />

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
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UCard class="lg:col-span-2">
          <USkeleton class="h-5 w-32 mb-4" />
          <USkeleton class="h-95 w-full rounded-xl" />
        </UCard>
        <UCard>
          <USkeleton class="h-5 w-32 mb-4" />
          <USkeleton class="h-48 w-full rounded-full" />
        </UCard>
      </div>
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

      <!-- Main Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UCard class="lg:col-span-2 border-0 ring-0" :ui="{ header: 'border-0', body: 'pt-0!' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900">
                User growth
              </h3>
            </div>
          </template>
          <div class="w-full h-[430px] overflow-hidden rounded-md">
            <ClientOnly>
              <apexchart
                type="line"
                width="100%"
                height="430"
                :options="userGrowthOptions"
                :series="userGrowthSeries"
              />
            </ClientOnly>
          </div>
        </UCard>

        <UCard class="border-0 ring-0">
          <template #header>
            <h3 class="font-medium text-[14px] text-gray-900">
              Practice area breakdown
            </h3>
            <p class="text-[14px] text-[#787878]">
              Share of verified lawyers
            </p>
          </template>
          <div class="flex flex-col items-center">
            <div class="h-64 w-full">
              <ClientOnly>
                <apexchart
                  type="donut"
                  width="100%"
                  height="240"
                  :options="practiceAreaOptions"
                  :series="practiceAreaSeries"
                />
              </ClientOnly>
            </div>
            <div class="w-full space-y-2">
              <div
                v-for="(label, i) in practiceAreaOptions.labels"
                :key="label"
                class="flex items-center justify-between text-xs"
              >
                <div class="flex h-5 items-center gap-2 font-medium text-gray-600">
                  <span
                    :style="{ backgroundColor: practiceAreaOptions.colors[i] }"
                    class="w-2 h-2 rounded-full"
                  />
                  <span>{{ label }}</span>
                  <!-- <span class="text-green-500 font-bold ml-1">(+12)</span> -->
                </div>
                <div class="flex-1 border-b border-dotted mx-2 border-gray-200" />
                <span class="text-gray-900 font-bold">{{ practiceAreaSeries[i] }}%</span>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Horizontal Bars Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UCard class="border-0 ring-0">
          <template #header>
            <h3 class="font-medium text-[14px] text-gray-900">
              Most searched categories
            </h3>
          </template>
          <div class="space-y-6">
            <div
              v-for="cat in categories"
              :key="cat.label"
              class="space-y-1.5"
            >
              <div class="flex justify-between text-xs font-bold text-gray-700">
                <span>{{ cat.label }}</span>
                <span class="text-gray-400">{{ formatCompactNumber(cat.value) }}</span>
              </div>
              <UProgress
                v-model="cat.value"
                :max="cat.total"
              />
            </div>
          </div>
        </UCard>

        <UCard class="border-0 ring-0">
          <template #header>
            <h3 class="font-medium text-[14px] text-gray-900">
              Lawyers Years of Experience
            </h3>
          </template>
          <div class="space-y-6">
            <div
              v-for="exp in experience"
              :key="exp.label"
              class="space-y-1.5"
            >
              <div class="flex justify-between text-xs font-bold text-gray-700">
                <span>{{ exp.label }}</span>
                <span class="text-gray-400">{{ formatCompactNumber(exp.value) }}</span>
              </div>
              <UProgress
                v-model="exp.value"
                :max="exp.total"
                :color="exp.color"
              />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Locations -->
      <UCard class="border-0 ring-0">
        <template #header>
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h3 class="font-medium text-[14px] text-gray-900">
              Most active locations
            </h3>
          </div>
        </template>
        <div class="space-y-8">
          <div
            v-for="loc in locations"
            :key="loc.name"
            class="space-y-3"
          >
            <div class="flex justify-between items-center text-xs font-bold">
              <div>
                <p class="text-gray-900">
                  {{ loc.name }} <span class="text-gray-400 font-light">({{ loc.total }})</span>
                </p>
                <div class="flex flex-wrap gap-3 mt-1">
                  <div
                    v-for="(value, index) in loc.topLga"
                    :key="index"
                  >
                    <span class="text-gray-900 font-normal">
                      {{ value?.name }}
                    </span>
                    <span class="text-gray-400 font-light ml-[3px]">({{ value?.total }})</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-4">
                <span class="flex items-center gap-1.5"><span class="w-[12px] h-[12px] bg-[#003357] rounded-[4px]" /> {{ formatCompactNumber(loc.clientsTotal) }} <span class="text-gray-400 font-medium">clients</span></span>
                <span class="flex items-center gap-1.5"><span class="w-[12px] h-[12px] bg-[#93E2FF] rounded-[4px]" /> {{ formatCompactNumber(loc.lawyersTotal) }} <span class="text-gray-400 font-medium">lawyers</span></span>
              </div>
            </div>
            <div class="space-y-1">
              <UProgress
                :model-value="loc.clients"
                :max="100"
                :ui="{ indicator: 'bg-[#0370BA]! h-1.5', base: 'h-1.5' }"
              />
              <UProgress
                :model-value="loc.lawyers"
                :max="100"
                color="primary"
                :ui="{ indicator: 'bg-[#7DC9FD]! h-1.5', base: 'h-1.5' }"
              />
            </div>
          </div>
        </div>
      </UCard>
    </template>
  </div>
</template>
