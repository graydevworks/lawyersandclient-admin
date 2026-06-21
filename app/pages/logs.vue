<script setup lang="ts">
import { formatRelativeDate } from '~/util/helper'

definePageMeta({ middleware: 'auth' })

const { getLogs } = useLogs()

const skeleton = ref(true)
const searchQuery = ref('')

const logs = ref<{
  name: string
  action: string
  time: string
  avatar: string
}[]>([])

const fetchLogs = async () => {
  const result = await getLogs()
  if (result && result.data && (result.data as any).data && (result.data as any).data.success) {
    logs.value = ((result.data as any).data.data as any[]).map((item: any) => ({
      name: item.actor || item.name,
      action: item.label || item.action,
      time: (item.time_ago || item.created_at) ? formatRelativeDate(item.time_ago || item.created_at) : '',
      avatar: item.avatar || item.profile_photo_url || ''
    }))
  }
}

onMounted(async () => {
  await fetchLogs()
  skeleton.value = false
})

// Silent background refresh every 30 seconds
const { start } = useIntervalFetch(fetchLogs, 30000)
onMounted(() => start())
</script>

<template>
  <div class="space-y-[24px]">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-semibold text-gray-900 leading-tight">
        Activity Logs
      </h1>
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Search logs..."
        class="w-full md:w-[300px]"
        :ui="{ base: 'rounded-[36px] text-[14px] py-[10px]' }"
      />
    </div>

    <!-- Skeleton Loading -->
    <template v-if="skeleton">
      <UCard class="rounded-[18px] border-0 ring-0">
        <div class="space-y-6">
          <div
            v-for="i in 8"
            :key="i"
            class="flex items-start gap-4"
          >
            <USkeleton class="w-9 h-9 rounded-full shrink-0" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-3/4" />
              <USkeleton class="h-3 w-1/4" />
            </div>
          </div>
        </div>
      </UCard>
    </template>

    <!-- Logs List -->
    <template v-else>
      <UCard
        v-if="logs.length === 0"
        class="rounded-[18px] border-0 ring-0"
      >
        <SharedEmptyState
          icon="i-lucide-scroll-text"
          title="No activity logs"
          description="There are no activity logs to display right now."
        />
      </UCard>

      <UCard
        v-else
        class="rounded-[18px] border-0 ring-0"
      >
        <div class="space-y-6">
          <div
            v-for="(activity, index) in logs"
            :key="index"
            class="flex items-start gap-4 p-2 -m-2 hover:bg-gray-50 transition-colors pb-[18px]"
            :class="{ 'border-b border-[#f7f7f7] mb-[10px]': index !== logs.length - 1 }"
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
    </template>
  </div>
</template>
