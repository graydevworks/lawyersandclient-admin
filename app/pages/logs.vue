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

const currentPage = ref(1)
const perPage = ref(20)
const totalItems = ref(0)
const totalPages = ref(1)

const fetchLogs = async (page: number = 1) => {
  const params: Record<string, any> = {
    page,
    per_page: perPage.value
  }

  const result = await getLogs(params)
  if (result && result.data && (result.data as any).data && (result.data as any).data.success) {
    const data = (result.data as any).data.data
    const meta = (result.data as any).data.meta

    // Handle pagination meta if available
    if (meta) {
      currentPage.value = meta.current_page || page
      totalItems.value = meta.total || 0
      totalPages.value = meta.last_page || 1
    }

    const logList = Array.isArray(data) ? data : (data.logs || data.activity || [])
    logs.value = logList.map((item: any) => ({
      name: item.actor || item.name,
      action: item.label || item.action,
      time: (item.time_ago || item.created_at) ? formatRelativeDate(item.time_ago || item.created_at) : '',
      avatar: item.avatar || item.profile_photo_url || ''
    }))

    // If no meta, use array length
    if (!meta) {
      totalItems.value = logs.value.length
      totalPages.value = 1
    }
  }
}

const filteredLogs = computed(() => {
  if (!searchQuery.value.trim()) return logs.value
  const q = searchQuery.value.toLowerCase()
  return logs.value.filter(log =>
    log.name.toLowerCase().includes(q) ||
    log.action.toLowerCase().includes(q)
  )
})

const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchLogs(currentPage.value)
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchLogs(currentPage.value)
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchLogs(page)
}

const visiblePages = computed(() => {
  const total = totalPages.value
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []
  const current = currentPage.value

  pages.push(1)
  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
})

onMounted(async () => {
  await fetchLogs()
  skeleton.value = false
})

// Silent background refresh every 30 seconds
const { start } = useIntervalFetch(() => fetchLogs(currentPage.value), 30000)
onMounted(() => start())
</script>

<template>
  <div class="space-y-[24px]">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-[20px] font-semibold text-gray-900 leading-tight">
          Activity Logs
        </h1>
        <p class="text-sm text-gray-400 mt-1">
          Track all admin and user actions
        </p>
      </div>
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
        v-if="filteredLogs.length === 0"
        class="rounded-[18px] border-0 ring-0"
      >
        <SharedEmptyState
          icon="i-lucide-scroll-text"
          :title="searchQuery ? 'No matching logs' : 'No activity logs'"
          :description="searchQuery ? 'No logs match &quot;' + searchQuery + '&quot;.' : 'There are no activity logs to display right now.'"
        />
      </UCard>

      <UCard
        v-else
        class="rounded-[18px] border-0 ring-0"
      >
        <div class="space-y-6">
          <div
            v-for="(activity, index) in filteredLogs"
            :key="index"
            class="flex items-start gap-4 p-2 -m-2 hover:bg-gray-50 transition-colors pb-[18px]"
            :class="{ 'border-b border-[#f7f7f7] mb-[10px]': index !== filteredLogs.length - 1 }"
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

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between text-sm text-gray-500 pt-2"
      >
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
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
          <template v-for="(page, idx) in visiblePages" :key="idx">
            <span
              v-if="page === '...'"
              class="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
            >…</span>
            <UButton
              v-else
              :variant="page === currentPage ? 'solid' : 'ghost'"
              :color="page === currentPage ? 'primary' : 'neutral'"
              size="sm"
              class="w-8 h-8 flex items-center justify-center rounded-md font-medium"
              :class="page === currentPage ? 'bg-[#003357] hover:bg-[#004474] text-white' : 'text-gray-500'"
              @click="goToPage(page as number)"
            >
              {{ page }}
            </UButton>
          </template>
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
