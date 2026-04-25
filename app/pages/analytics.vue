<script setup lang="ts">
const stats = [
  { title: 'Total users', value: '4,281', trend: '+12%', trendType: 'positive', trendSuffix: 'vs 4,302 last month', sparklineData: [30, 40, 35, 50, 49, 60, 70, 91] },
  { title: 'Active users', value: '1,243', trend: '+7%', trendType: 'positive', trendSuffix: '25.8% of total base', sparklineData: [20, 30, 25, 40, 39, 50, 60, 80] },
  { title: 'Case acceptance rate', value: '38.4%', trend: '+3%', trendType: 'positive', trendSuffix: 'vs 35.2% last period', sparklineData: [10, 20, 15, 30, 29, 40, 50, 70] },
  { title: 'Lawyer-client match rate', value: '61.7%', trend: '-2%', trendType: 'negative', trendSuffix: 'vs 63.1% last period', sparklineData: [80, 70, 75, 60, 61, 50, 40, 30] }
]

const userGrowthSeries = [
  { name: 'Clients', data: [1200, 1500, 2800, 2400, 3200, 3500, 4200, 4800] },
  { name: 'Lawyers', data: [1100, 1400, 1800, 1700, 2100, 2400, 3100, 3800] }
]

const userGrowthOptions = {
  chart: { type: 'line', toolbar: { show: false } },
  colors: ['#003357', '#93E2FF'],
  stroke: { curve: 'smooth', width: 3 },
  xaxis: { categories: ['Mar 1', 'Mar 8', 'Mar 14', 'Mar 18', 'Mar 22', 'Mar 26', 'Mar 30', 'Apr 1', 'Apr 4'] },
  grid: { strokeDashArray: 4 },
  legend: { position: 'top', horizontalAlign: 'left' }
}

const practiceAreaSeries = [54, 25, 12, 9]
const practiceAreaOptions = {
  chart: { type: 'donut' },
  labels: ['Criminal', 'Family', 'Commercial', 'Other'],
  colors: ['#60A5FA', '#34D399', '#FB923C', '#F87171'],
  legend: { show: false },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: { show: true, label: 'lawyers', formatter: () => '581' }
        }
      }
    }
  }
}

const categories = [
  { label: 'Criminal law', value: 3812, color: 'success', total: 5000 },
  { label: 'Family Law', value: 2640, color: 'primary', total: 5000 },
  { label: 'Property Law', value: 1920, color: 'neutral', total: 5000 },
  { label: 'Commercial Law', value: 1104, color: 'neutral', total: 5000 },
  { label: 'Labor Law', value: 734, color: 'neutral', total: 5000 }
]

const experience = [
  { label: '40+ Years', value: 3812, color: 'primary', total: 5000 },
  { label: '35-39', value: 2640, color: 'primary', total: 5000 },
  { label: '25-34', value: 1920, color: 'primary', total: 5000 },
  { label: '15-24', value: 1104, color: 'neutral', total: 5000 },
  { label: '10-14', value: 734, color: 'neutral', total: 5000 }
]

const locations = [
  { name: 'Lagos', clients: 2104, lawyers: 1104 },
  { name: 'Abuja', clients: 2104, lawyers: 1104 },
  { name: 'Port Harcourt', clients: 2104, lawyers: 1104 },
  { name: 'Kano', clients: 2104, lawyers: 1104 },
  { name: 'Ibadan', clients: 2104, lawyers: 1104 }
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
          7 pending • 2 need urgent attention
        </p>
      </div>
      <UButton
        icon="i-lucide-calendar"
        color="neutral"
        variant="solid"
        class="shadow-sm"
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

    <!-- Main Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-gray-900">
              User growth
            </h3>
            <USelect
              :options="['Last 30 days']"
              size="sm"
              variant="outline"
              class="w-32"
            />
          </div>
        </template>
        <div class="h-80 w-full overflow-hidden">
          <ClientOnly>
            <apexchart
              type="line"
              height="320"
              :options="userGrowthOptions"
              :series="userGrowthSeries"
            />
          </ClientOnly>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-bold text-gray-900">
            Practice area breakdown
          </h3>
          <p class="text-xs text-gray-400">
            Share of verified lawyers
          </p>
        </template>
        <div class="flex flex-col items-center">
          <div class="h-48 w-full">
            <ClientOnly>
              <apexchart
                type="donut"
                height="240"
                :options="practiceAreaOptions"
                :series="practiceAreaSeries"
              />
            </ClientOnly>
          </div>
          <div class="mt-4 w-full space-y-2">
            <div
              v-for="(label, i) in practiceAreaOptions.labels"
              :key="label"
              class="flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-2 font-medium text-gray-600">
                <span
                  :style="{ backgroundColor: practiceAreaOptions.colors[i] }"
                  class="w-2 h-2 rounded-full"
                />
                <span>{{ label }}</span>
                <span class="text-green-500 font-bold ml-1">(+12)</span>
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
      <UCard>
        <template #header>
          <h3 class="font-bold text-gray-900">
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
              <span class="text-gray-400">{{ cat.value.toLocaleString() }}</span>
            </div>
            <UProgress
              :value="cat.value"
              :max="cat.total"
              :color="cat.color as any"
              size="sm"
            />
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-bold text-gray-900">
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
              <span class="text-gray-400">{{ exp.value.toLocaleString() }}</span>
            </div>
            <UProgress
              :value="exp.value"
              :max="exp.total"
              :color="exp.color as any"
              size="sm"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Locations -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-gray-900">
            Most active locations
          </h3>
          <USelect
            :options="['All']"
            size="sm"
            variant="outline"
            class="w-20"
          />
        </div>
      </template>
      <div class="space-y-8">
        <div
          v-for="loc in locations"
          :key="loc.name"
          class="space-y-3"
        >
          <div class="flex justify-between items-center text-xs font-bold">
            <span class="text-gray-900">{{ loc.name }}</span>
            <div class="flex gap-4">
              <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 bg-[#003357] rounded-full" /> 2,104 <span class="text-gray-400 font-medium">clients</span></span>
              <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 bg-[#93E2FF] rounded-full" /> 1,104 <span class="text-gray-400 font-medium">lawyers</span></span>
            </div>
          </div>
          <div class="space-y-1">
            <UProgress
              :value="100"
              color="primary"
              size="sm"
            />
            <UProgress
              :value="60"
              color="sky"
              size="sm"
            />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
