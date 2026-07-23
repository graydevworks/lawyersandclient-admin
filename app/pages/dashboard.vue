<script setup lang="ts">
import { formatRelativeDate, formatCompactNumber } from '~/util/helper'
import { displayApiError } from '~/util/apiHelper'

definePageMeta({ middleware: 'auth' })

type DashboardQuery = {
  date_from?: string
  date_to?: string
}

// --- Fetch dashboard data on mount ---
const { getDashboard } = useDashboard()

const { getVerificationQueue } = useVerification()

const skeleton = ref(true)

interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const swap = (x: number, y: number) => {
  const z: number = x
  x = y
  y = z

  return [x, y]
}

const stats = ref<StatItem[]>([])
const listError = ref('')
const hasFetchError = ref(false)

const headerFromDate = ref('')
const headerToDate = ref('')

const fromDate = ref<string>('')
const toDate = ref<string>('')

const signupsDateFrom = ref<string>('')
const signupsDateTo = ref<string>('')

const applyHeaderDateFilter = async () => {
  fromDate.value = headerFromDate.value
  toDate.value = headerToDate.value
  signupsDateFrom.value = headerFromDate.value
  signupsDateTo.value = headerToDate.value
  await fetchDashboardData()
}

const clearHeaderDateFilter = async () => {
  headerFromDate.value = ''
  headerToDate.value = ''
  fromDate.value = ''
  toDate.value = ''
  signupsDateFrom.value = ''
  signupsDateTo.value = ''
  await fetchDashboardData()
}

const applySignupsFilter = async () => {
  fromDate.value = signupsDateFrom.value
  toDate.value = signupsDateTo.value
  headerFromDate.value = signupsDateFrom.value
  headerToDate.value = signupsDateTo.value
  await fetchDashboardData()
}

const clearSignupsFilter = async () => {
  signupsDateFrom.value = ''
  signupsDateTo.value = ''
  headerFromDate.value = ''
  headerToDate.value = ''
  fromDate.value = ''
  toDate.value = ''
  await fetchDashboardData()
}

const signUpsSeries = ref([

  {
    name: 'Clients',
    data: [0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    name: 'Lawyers',
    data: [0, 0, 0, 0, 0, 0, 0, 0]
  }
])

const signUpsOptions = {
  chart: {
    type: 'bar',
    toolbar: { show: false },
    stacked: false
  },
  colors: ['#013355', '#8BCFFE'],
  plotOptions: {
    bar: {
      columnWidth: '90%',
      borderRadius: 8
    }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    axisBorder: { show: false },
    axisIcons: { show: false },
    labels: {
      style: {
        fontSize: '13px'
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '16px'
      },
      formatter: (val: number) => formatCompactNumber(val)
    }
  },
  grid: {
    strokeDashArray: 4,
    borderColor: '#f1f1f1'
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  },
  stroke: {
    show: true,
    width: 3,
    colors: ['#fff']
  }
}

const onlineNow = ref<{
  name: string
  role: string
  avatar: string
  time: string
}[]>([])

const recentActivity = ref<{
  name: string
  action: string
  time: string
  avatar: string
}[]>([])

const verificationQueue = ref<{
  id: string
  name: string
  specialty: string
  time: string
  avatar: string
}[]>([])

const router = useRouter()

const viewQueueItem = (id: string) => {
  router.push({ path: '/verification-queue', query: { id } })
}

const now = new Date()
const currentDayOfWeek = now.getDay()

const sunday = new Date(now)
sunday.setDate(now.getDate() - currentDayOfWeek)
const sundayString = sunday.toLocaleDateString('en-CA')

const saturday = new Date(now)
saturday.setDate(now.getDate() - currentDayOfWeek + 6)
const saturdayString = saturday.toLocaleDateString('en-CA')

const fetchDashboardData = async () => {
  const query: DashboardQuery = {
    date_from: fromDate.value || sundayString || undefined,
    date_to: toDate.value || saturdayString || undefined
  }

  listError.value = ''
  hasFetchError.value = false

  // Backend accepts query params; keep typing loose to avoid casting errors in UI.
  const [result, queue] = await Promise.all([getDashboard(query), getVerificationQueue()])

  if (!result?.success) {
    listError.value = displayApiError(result, 'Failed to load dashboard data.')
    hasFetchError.value = true
    return
  }

  if (result && result.data && result.data.data && result.data.data.success) {
    // stats
    stats.value = [
      { title: 'Total Users', value: result.data.data.data.stats.total_users.count, trend: result.data.data.data.stats.total_users.change_pct, trendType: result.data.data.data.stats.total_users.change_pct > -1 ? 'positive' : 'negative', trendSuffix: result.data.data.data.stats.total_users.period },
      { title: 'Verified Lawyers', value: result.data.data.data.stats.verified_lawyers.count, trend: result.data.data.data.stats.verified_lawyers.change_pct, trendType: result.data.data.data.stats.verified_lawyers.change_pct > -1 ? 'positive' : 'negative', trendSuffix: result.data.data.data.stats.verified_lawyers.period },
      { title: 'Pending Verification', value: result.data.data.data.stats.pending_verification.count, trendType: 'neutral', trendSuffix: result.data.data.data.stats.pending_verification.urgent ? result.data.data.data.stats.pending_verification.urgent_label : '456x' },
      { title: 'Available Online', value: result.data.data.data.stats.available_online.count, trend: `<span class="text-primary mr-1">${result.data.data.data.stats.available_online.lawyers}</span> lawyers <span class="text-primary mr-1 ml-[20px]">${result.data.data.data.stats.available_online.clients}</span> clients`, trendType: 'positive', trendSuffix: '' }
    ]

    // Recent Activity
    recentActivity.value = result.data.data.data.activity.map((item: { actor: string, label: string, timestamp?: string, avatar?: string }) => ({
      name: item.actor,
      action: item.label,
      time: item.timestamp ? formatRelativeDate(item.timestamp) : '',
      avatar: item.avatar
    })).splice(0, 6)

    // Sign Ups
    const lawyersSignups: number[] = []
    const clientsSignups: number[] = []

    // result.data.data.data.signups.forEach((item: { lawyers: number, clients: number }) => {
    //   lawyersSignups.push(item.lawyers)
    //   clientsSignups.push(item.clients)
    // })

    // days of the week
    const getDaysOfWeek = (day: string) => {
      const chartData = result.data.data.data.signups.find((item: { day: string }) => item.day === day)

      return chartData
    }

    // making it orderly

    // lawyers
    lawyersSignups[0] = getDaysOfWeek('Sun')?.lawyers || 0
    lawyersSignups[1] = getDaysOfWeek('Mon')?.lawyers || 0
    lawyersSignups[2] = getDaysOfWeek('Tue')?.lawyers || 0
    lawyersSignups[3] = getDaysOfWeek('Wed')?.lawyers || 0
    lawyersSignups[4] = getDaysOfWeek('Thu')?.lawyers || 0
    lawyersSignups[5] = getDaysOfWeek('Fri')?.lawyers || 0
    lawyersSignups[6] = getDaysOfWeek('Sat')?.lawyers || 0

    // clients
    clientsSignups[0] = getDaysOfWeek('Sun')?.clients || 0
    clientsSignups[1] = getDaysOfWeek('Mon')?.clients || 0
    clientsSignups[2] = getDaysOfWeek('Tue')?.clients || 0
    clientsSignups[3] = getDaysOfWeek('Wed')?.clients || 0
    clientsSignups[4] = getDaysOfWeek('Thu')?.clients || 0
    clientsSignups[5] = getDaysOfWeek('Fri')?.clients || 0
    clientsSignups[6] = getDaysOfWeek('Sat')?.clients || 0

    // sunday is the first day of the week but the api brings it as 7th
    // lawyersSignups.unshift(lawyersSignups[lawyersSignups.length - 1])
    // lawyersSignups.pop()
    // clientsSignups.unshift(clientsSignups[clientsSignups.length - 1])
    // clientsSignups.pop()

    signUpsSeries.value = [
      {
        name: 'Clients',
        data: clientsSignups
      },
      {
        name: 'Lawyers',
        data: lawyersSignups
      }
    ]

    // online users
    onlineNow.value = result.data.data.data.online_users.map((item: { name: string, role: string, profile_photo_url: string }) => ({
      name: item.name,

      role: item.role,
      avatar: item.profile_photo_url,
      time: 'online'
    })).splice(0, 5)
  }

  if (queue && queue.data && queue.data.data && queue.data.data.success) {
    verificationQueue.value = queue.data.data.data.submissions.map((item: { id: number, full_name: string, email: string, submitted_at?: string, profile_photo_url: string }) => ({

      id: String(item.id),
      name: item.full_name,
      specialty: item.email,
      time: item.submitted_at ? formatRelativeDate(item.submitted_at) : '',
      avatar: item.profile_photo_url
    })).splice(0, 5)
  }
}

onMounted(async () => {
  await fetchDashboardData()
  skeleton.value = false
})

// Real-time: poll every 30 seconds
const { start } = useIntervalFetch(fetchDashboardData, 30000)
onMounted(() => start())
</script>

<template>
  <div class="space-y-[24px]">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-[16px] font-semibold text-gray-900 leading-tight">
        Admin Dashboard
      </h1>
      <SharedDateRangePicker
        v-model:from="headerFromDate"
        v-model:to="headerToDate"
        variant="header"
        @apply="applyHeaderDateFilter"
        @clear="clearHeaderDateFilter"
      />
    </div>

    <!-- Error Banner -->
    <SharedErrorBanner
      v-if="hasFetchError"
      :message="listError"
    />

    <!-- Skeleton Loading -->
    <template v-if="skeleton">
      <!-- Stats Skeleton -->
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
      <!-- Chart + Online Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[16px]">
        <UCard class="lg:col-span-8 rounded-[18px] border-0 ring-0">
          <USkeleton class="h-5 w-24 mb-4" />
          <USkeleton class="h-[373px] w-full rounded-xl" />
        </UCard>
        <UCard class="lg:col-span-4 rounded-[18px] border-0 ring-0">
          <USkeleton class="h-5 w-24 mb-4" />
          <div class="space-y-4">
            <div
              v-for="i in 5"
              :key="i"
              class="flex items-center gap-3"
            >
              <USkeleton class="w-9 h-9 rounded-full" />
              <div class="flex-1 space-y-1">
                <USkeleton class="h-4 w-3/4" />
                <USkeleton class="h-3 w-1/2" />
              </div>
            </div>
          </div>
        </UCard>
      </div>
      <!-- Activity + Queue Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UCard
          v-for="i in 2"
          :key="i"
          class="rounded-[18px] border-0 ring-0"
        >
          <USkeleton class="h-5 w-32 mb-4" />
          <div class="space-y-4">
            <div
              v-for="j in 4"
              :key="j"
              class="flex items-center gap-3"
            >
              <USkeleton class="w-9 h-9 rounded-full" />
              <div class="flex-1 space-y-1">
                <USkeleton class="h-4 w-3/4" />
                <USkeleton class="h-3 w-1/2" />
              </div>
            </div>
          </div>
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

      <!-- Charts & Online Now -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[16px]">
        <UCard class="lg:col-span-8 rounded-[18px] border-0 ring-0">
          <div class="flex items-center justify-between">
            <h3 class="text-[16px] font-semibold text-gray-900">
              Sign ups
            </h3>
          </div>
          <div class="h-[340px] w-full overflow-hidden border-0 mt-auto">
            <ClientOnly>
              <apexchart
                type="bar"
                :height="340"
                :options="signUpsOptions"
                :series="signUpsSeries"
              />
            </ClientOnly>
          </div>
        </UCard>

        <UCard
          class="lg:col-span-4 rounded-[18px] p-0! border-0! ring-0"
          :ui="{ body: 'p-[16px]! border-0!' }"
        >
          <div class="flex items-center justify-between border-b border-[#ECECEC] pb-[10px] mb-[20px]">
            <h3 class="text-[16px] font-medium text-[#222222]">
              Online now
            </h3>
            <ULink
              to="/online"
              class="text-[14px] text-[#444444] font-light! hover:text-gray-600 transition-colors"
            >See all</ULink>
          </div>
          <template v-if="onlineNow.length > 0">
            <div class="space-y-[10px]">
              <div
                v-for="(user, index) in onlineNow"
                :key="user.name"
                class="flex items-start justify-between group cursor-pointer"
                :class="{ 'border-b border-[#ECECECB2]': index !== onlineNow.length - 1 }"
              >
                <div class="flex items-center gap-3 pb-[16px]">
                  <UAvatar
                    :src="user.avatar"
                    class="size-[36px] group-hover:scale-110 transition-transform"
                  />
                  <div>
                    <p class="text-[14px] font-medium text-[#222222] leading-tight">
                      {{ user.name }}
                    </p>
                    <p class="text-[13px] font-light! text-[#013355]">
                      {{ user.role }}
                    </p>
                  </div>
                </div>
                <span class="text-[12px] font-medium text-success">{{ user.time }}</span>
              </div>
            </div>
          </template>
          <SharedEmptyState
            v-else
            icon="i-lucide-wifi-off"
            title="No users online"
            description="No users are currently online."
          />
        </UCard>
      </div>

      <!-- Activity & Verification Queue -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UCard
          class="rounded-[18px] border-[#f3f3f3] border-0 ring-0"
          :ui="{ header: 'border-[#ECECEC] px-[16px]!', body: 'px-[16px]!' }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-[16px] font-medium text-[#222222]">
                Recent activity
              </h3>
              <ULink
                to="/logs"
                class="text-[14px] text-[#013355] font-light flex items-center gap-1 hover:underline underline-offset-4"
              >
                View all logs <UIcon name="i-lucide-arrow-up-right" />
              </ULink>
            </div>
          </template>
          <template v-if="recentActivity.length > 0">
            <div class="space-y-6">
              <div
                v-for="(activity, index) in recentActivity"
                :key="activity.name"
                class="flex items-start gap-4 p-2 -m-2 hover:bg-gray-50 transition-colors pb-[18px]"
                :class="{ 'border-b border-[#f7f7f7] mb-[10px]': index !== recentActivity.length - 1 }"
              >
                <UAvatar
                  :src="activity.avatar"
                  size="sm"
                  class="size-[36px]"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-[14px] text-gray-600 leading-relaxed">
                    <span class="font-medium text-gray-900">{{ activity.name }}</span> {{ activity.action }}
                  </p>
                  <p class="text-[13px] text-gray-400 font-light">
                    {{ activity.time }}
                  </p>
                </div>
              </div>
            </div>
          </template>
          <SharedEmptyState
            v-else
            icon="i-lucide-activity"
            title="No recent activity"
            description="There are no activity logs to display right now."
          />
        </UCard>

        <UCard
          class="rounded-[18px] p-0! border-0 ring-0"
          :ui="{ header: 'border-[#ECECEC] px-[16px]!', body: 'px-[16px]!' }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-[16px] font-medium text-[#222222]">
                Verification queue
              </h3>
              <ULink
                to="/verification-queue"
                class="text-[14px] text-[#013355] hover:text-gray-600 transition-colors"
              >
                Open full queue <UIcon name="i-lucide-arrow-up-right" />
              </ULink>
            </div>
          </template>
          <template v-if="verificationQueue.length > 0">
            <div class="space-y-6">
              <div
                v-for="(item, index) in verificationQueue"
                :key="item.name"
                class="flex items-start justify-between group cursor-pointer"
                :class="{ 'border-b border-[#f7f7f7]': index !== verificationQueue.length - 1 }"
              >
                <div class="flex items-center gap-3 pb-[16px]">
                  <UAvatar
                    :src="item.avatar"
                    size="sm"
                    class="size-[36px]"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-[14px] text-gray-600 leading-relaxed">
                      <span class="font-medium text-gray-900">{{ item.name }}</span>
                    </p>
                    <p class="text-[13px] font-light text-gray-400 truncate">
                      {{ item.specialty }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-[13px] text-gray-400 font-light">{{ item.time }}</span>
                  <UButton
                    label="View"
                    variant="outline"
                    color="neutral"
                    class="py-[9px] px-[12px] text-[12px]"
                    @click="viewQueueItem(item.id)"
                  />
                </div>
              </div>
            </div>
          </template>
          <SharedEmptyState
            v-else
            icon="i-lucide-clipboard-check"
            title="Queue is empty"
            description="There are no pending verifications right now."
          />
        </UCard>
      </div>
    </template>
  </div>
</template>
