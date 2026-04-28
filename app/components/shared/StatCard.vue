<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
  trendSuffix?: string
  sparklineData?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  trendType: 'neutral'
})

const trendColorClass = computed(() => {
  if (props.trendType === 'positive') return 'text-green-500'
  if (props.trendType === 'negative') return 'text-red-500'
  return 'text-amber-500'
})

// Optional Sparkline options using ApexCharts
const chartOptions = {
  chart: {
    sparkline: {
      enabled: true
    }
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  colors: ['#00DC82'],
  tooltip: {
    enabled: false
  }
}

const series = computed(() => [
  {
    name: props.title,
    data: props.sparklineData || []
  }
])
</script>

<template>
  <UCard
    class="h-full border-0 ring-0 rounded-[10px]"
    :ui="{ body: 'p-[16px]!' }"
  >
    <div class="space-y-[10px]">
      <div class="flex justify-between items-start">
        <h4 class="text-[15px] font-normal captitalize">
          {{ title }}
        </h4>
        <div
          v-if="sparklineData && sparklineData.length"
          class="w-16 h-8"
        >
          <ClientOnly>
            <apexchart
              type="line"
              height="32"
              width="64"
              :options="chartOptions"
              :series="series"
            />
          </ClientOnly>
        </div>
      </div>

      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-semibold text-gray-900 tracking-tight">{{ value }}</span>
      </div>

      <div
        v-if="trend"
        class="flex items-center gap-1.5 text-[14px] font-medium"
      >
        <span
          :class="trendColorClass"
          class="flex items-center space-x-[10px] gap-0.5"
          v-html="trend"
        />
        <span class="text-gray-400 font-normal">{{ trendSuffix }}</span>
      </div>
      <div
        v-else-if="trendType === 'neutral'"
        class="text-amber-500 text-[14px] font-medium"
      >
        Needs attention
      </div>
    </div>
  </UCard>
</template>
