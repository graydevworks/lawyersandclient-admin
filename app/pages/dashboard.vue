<script setup lang="ts">
interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const stats: StatItem[] = [
  { title: 'Total Users', value: '4,281', trend: '+12%', trendType: 'positive', trendSuffix: 'vs last month' },
  { title: 'Verified Lawyers', value: '634', trend: '+8%', trendType: 'positive', trendSuffix: 'this week' },
  { title: 'Pending Verification', value: '7', trendType: 'neutral' },
  { title: 'Available Online', value: '211', trend: '<span class="text-primary mr-1">43</span> lawyers <span class="text-primary mr-1 ml-[20px]">168</span> clients', trendType: 'positive', trendSuffix: '' }
]

const filterDate = ref('This week')

const signUpsSeries = [
  {
    name: 'Clients',
    data: [18, 14, 23, 11, 21, 8, 10, 22]
  },
  {
    name: 'Lawyers',
    data: [11, 19, 18, 15, 17, 21, 18, 26]
  }
]

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
      formatter: (val: number) => `${val}k`
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

const onlineNow = [
  { name: 'Adaeze O.', role: 'Lawyer', avatar: 'https://i.pravatar.cc/150?u=1', time: '12 m' },
  { name: 'Adejumobi O.', role: 'Lawyer', avatar: 'https://i.pravatar.cc/150?u=2', time: '2 hr' },
  { name: 'Heritage A.', role: 'Client', avatar: 'https://i.pravatar.cc/150?u=3', time: '1 m' },
  { name: 'James Smith', role: 'Lawyer', avatar: 'https://i.pravatar.cc/150?u=4', time: '18 m' },
  { name: 'Grace P.', role: 'Client', avatar: 'https://i.pravatar.cc/150?u=5', time: '37 m' }
]

const recentActivity = [
  { name: 'Adaeze Okonkwo', action: 'approved as verified lawyer', time: '2 min ago', avatar: 'https://i.pravatar.cc/150?u=1' },
  { name: 'Emeka Nwachukwu', action: 'suspended — fraudulent activity', time: '2 min ago', avatar: 'https://i.pravatar.cc/150?u=6' },
  { name: 'New user registered', action: '— Tunde Bakare (Client, Lagos)', time: '2 min ago', avatar: 'https://i.pravatar.cc/150?u=7' },
  { name: 'Verification submitted', action: '— Ngozi Amadi, Commercial Law', time: '2 min ago', avatar: 'https://i.pravatar.cc/150?u=8' },
  { name: 'Folasayo Ogunnaike', action: 'approved as verified lawyer', time: '2 min ago', avatar: 'https://i.pravatar.cc/150?u=9' }
]

const verificationQueue = [
  { name: 'Ngozi Amadi', specialty: 'Estate Planning & Administration', time: '1s ago', avatar: 'https://i.pravatar.cc/150?u=8' },
  { name: 'Seun Olatunji', specialty: 'Immigration', time: '30m ago', avatar: 'https://i.pravatar.cc/150?u=10' },
  { name: 'Justina Ogbonnaya', specialty: 'Commercial Law', time: '3h ago', avatar: 'https://i.pravatar.cc/150?u=11' },
  { name: 'Emmanuel Amuneke', specialty: 'Insolvency', time: '5h ago', avatar: 'https://i.pravatar.cc/150?u=12' },
  { name: 'Folasayo Ogunnaike', specialty: 'Agency', time: '5h ago', avatar: 'https://i.pravatar.cc/150?u=9' }
]
</script>

<template>
  <div class="space-y-[24px]">
    <!-- Header -->
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

    <!-- Charts & Online Now -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-[16px]">
      <UCard class="lg:col-span-8 rounded-[18px] border-0 ring-0">
        <div class="flex items-center justify-between">
          <h3 class="text-[16px] font-semibold text-gray-900">
            Sign ups
          </h3>
          <div class="flex items-center gap-4">
            <USelect
              v-model="filterDate"
              :items="['This week', 'Last week', 'Last month']"
              variant="outline"
              class="w-28 rounded-[36px] text-[16px] py-[7px]"
            />
          </div>
        </div>
        <div class="h-[373px] w-full overflow-hidden border-0 mt-auto">
          <ClientOnly>
            <apexchart
              type="bar"
              :height="373"
              :options="signUpsOptions"
              :series="signUpsSeries"
            />
          </ClientOnly>
        </div>
      </UCard>

      <UCard class="lg:col-span-4 rounded-[18px] p-0!" :ui="{ header: 'border-[#f7f7f7]' }">
        <div class="flex items-center justify-between border-b border-[#ECECEC] pb-[10px] mb-[20px]">
          <h3 class="text-[16px] font-semibold text-gray-900">
            Online now
          </h3>
          <ULink
            to="/online"
            class="text-[14px] text-gray-400 hover:text-gray-600 transition-colors"
          >See all</ULink>
        </div>
        <div class="space-y-6">
          <div
            v-for="(user, index) in onlineNow"
            :key="user.name"
            class="flex items-start justify-between group cursor-pointer"
            :class="{ 'border-b border-[#f7f7f7]': index !== onlineNow.length - 1 }"
          >
            <div class="flex items-center gap-3 pb-[16px]">
              <UAvatar
                :src="user.avatar"
                class="size-[36px] group-hover:scale-110 transition-transform"
              />
              <div>
                <p class="text-[14px] font-semibold text-gray-900 leading-tight">
                  {{ user.name }}
                </p>
                <p class="text-[13px] text-[#013355] font-medium">
                  {{ user.role }}
                </p>
              </div>
            </div>
            <span class="text-[14px] font-medium">{{ user.time }}</span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Activity & Verification Queue -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard class="rounded-[18px] border-[#f3f3f3]" :ui="{ header: 'border-[#f7f7f7]' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-[16px] font-semibold text-gray-900">
              Recent activity
            </h3>
            <ULink
              to="/logs"
              class="text-[14px] text-[#013355] font-medium flex items-center gap-1 hover:underline underline-offset-4"
            >
              View all logs <UIcon name="i-lucide-arrow-up-right" />
            </ULink>
          </div>
        </template>
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
                <span class="font-semibold text-gray-900">{{ activity.name }}</span> {{ activity.action }}
              </p>
              <p class="text-[13px] text-gray-400">
                {{ activity.time }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <UCard
        class="rounded-[18px] p-0!"
        :ui="{ header: 'border-[#f7f7f7]' }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-[16px] font-semibold text-gray-900">
              Verification queue
            </h3>
            <ULink
              to="/verification-queue"
              class="text-[14px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Open full queue <UIcon name="i-lucide-arrow-up-right" />
            </ULink>
          </div>
        </template>
        <div class="space-y-6">
          <div
            v-for="(item, index) in verificationQueue"
            :key="item.name"
            class="flex items-start justify-between group cursor-pointer"
            :class="{ 'border-b border-[#f7f7f7]': index !== onlineNow.length - 1 }"
          >
            <div class="flex items-center gap-3 pb-[16px]">
              <UAvatar
                :src="item.avatar"
                size="sm"
                class="size-[36px]"
              />
              <div class="flex-1 min-w-0">
                <p class="text-[14px] text-gray-600 leading-relaxed">
                  <span class="font-semibold text-gray-900">{{ item.name }}</span> {{ item.specialty }}
                </p>
                <p class="text-[13px] text-gray-400">
                  {{ item.time }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-[13px] text-gray-400 font-medium">{{ item.time }}</span>
              <UButton
                label="View"
                variant="outline"
                color="neutral"
                class="py-[9px] px-[12px] text-[12px]"
              />
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
