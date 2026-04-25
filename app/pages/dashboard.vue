<script setup lang="ts">
const stats = [
  { title: 'Total Users', value: '4,281', trend: '+12%', trendType: 'positive', trendSuffix: 'vs last month' },
  { title: 'Verified Lawyers', value: '634', trend: '+8%', trendType: 'positive', trendSuffix: 'this week' },
  { title: 'Pending Verification', value: '7', trendType: 'neutral' },
  { title: 'Available Online', value: '211', trend: '43 lawyers 168 clients', trendType: 'neutral', trendSuffix: '' }
]

const signUpsSeries = [
  {
    name: 'Clients',
    data: [18, 14, 23, 11, 21, 8, 10]
  },
  {
    name: 'Lawyers',
    data: [11, 19, 18, 15, 17, 21, 18]
  }
]

const signUpsOptions = {
  chart: {
    type: 'bar',
    toolbar: { show: false },
    stacked: false
  },
  colors: ['#003357', '#93E2FF'],
  plotOptions: {
    bar: {
      columnWidth: '55%',
      borderRadius: 4
    }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thur'],
    axisBorder: { show: false },
    axisIcons: { show: false }
  },
  yaxis: {
    labels: {
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
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 leading-tight">Admin Dashboard</h1>
      <UButton
        icon="i-lucide-calendar"
        color="neutral"
        variant="solid"
        class="shadow-sm"
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

    <!-- Charts & Online Now -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-gray-900">Sign ups</h3>
            <div class="flex items-center gap-4">
              <USelect
                :options="['This week', 'Last week', 'Last month']"
                size="sm"
                variant="outline"
                class="w-32"
              />
            </div>
          </div>
        </template>
        <div class="h-80 w-full overflow-hidden">
          <ClientOnly>
            <apexchart
              type="bar"
              height="320"
              :options="signUpsOptions"
              :series="signUpsSeries"
            />
          </ClientOnly>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-gray-900">Online now</h3>
            <ULink to="/online" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">See all</ULink>
          </div>
        </template>
        <div class="space-y-6">
          <div v-for="user in onlineNow" :key="user.name" class="flex items-center justify-between group cursor-pointer">
            <div class="flex items-center gap-3">
              <UAvatar :src="user.avatar" size="sm" class="group-hover:scale-110 transition-transform" />
              <div>
                <p class="text-sm font-semibold text-gray-900 leading-tight">{{ user.name }}</p>
                <p class="text-xs text-blue-500 font-medium">{{ user.role }}</p>
              </div>
            </div>
            <span class="text-xs text-gray-400 font-medium">{{ user.time }}</span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Activity & Verification Queue -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-gray-900">Recent activity</h3>
            <ULink to="/logs" class="text-xs text-blue-500 font-medium flex items-center gap-1 hover:underline underline-offset-4">
              View all logs <UIcon name="i-lucide-arrow-up-right" />
            </ULink>
          </div>
        </template>
        <div class="space-y-6">
          <div v-for="activity in recentActivity" :key="activity.name" class="flex items-start gap-4 p-2 -m-2 rounded-lg hover:bg-gray-50 transition-colors">
            <UAvatar :src="activity.avatar" size="sm" />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-600 leading-relaxed">
                <span class="font-bold text-gray-900">{{ activity.name }}</span> {{ activity.action }}
              </p>
              <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-gray-900">Verification queue</h3>
            <ULink to="/verification-queue" class="text-xs text-blue-500 font-medium flex items-center gap-1 hover:underline underline-offset-4">
              Open full queue <UIcon name="i-lucide-arrow-up-right" />
            </ULink>
          </div>
        </template>
        <div class="space-y-6">
          <div v-for="item in verificationQueue" :key="item.name" class="flex items-center justify-between group">
            <div class="flex items-center gap-3">
              <UAvatar :src="item.avatar" size="sm" />
              <div>
                <p class="text-sm font-bold text-gray-900 leading-tight">{{ item.name }}</p>
                <p class="text-xs text-gray-400 font-medium">{{ item.specialty }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs text-gray-400 font-medium">{{ item.time }}</span>
              <UButton label="View" size="xs" variant="outline" color="neutral" />
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
