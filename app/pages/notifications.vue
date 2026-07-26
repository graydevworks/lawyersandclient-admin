<script setup lang="ts">
import * as v from 'valibot'
import { computed, onMounted, ref, watch } from 'vue'
import { displayApiError } from '~/util/apiHelper'

definePageMeta({ middleware: 'auth' })

const { getNotifications } = useNotification()
const { getClients } = useClients()
const { getLawyers } = useLawyers()

const notifications = ref<any[]>([])
const recentNotifications = ref<any[]>([])
const isSubmitting = ref(false)
const clientCount = ref(0)
const lawyerCount = ref(0)
const allCount = ref(0)
const listError = ref('')
const hasFetchError = ref(false)
const stats = ref({
  announcement: 0,
  platform_update: 0,
  promotion: 0,
  security_alert: 0,
  open_rate: 0,
  opened: 0,
  delivered: 0,
  recipient_count: 0
})

// ---- Schema + form state (matching your requested enums) ----
const notificationSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1, 'Title is required')),
  message: v.pipe(v.string(), v.minLength(1, 'Message is required')),
  type: v.picklist(['announcement', 'platform_update', 'promotion', 'security_alert'], 'Please select a notification type'),
  target: v.picklist(['all', 'clients', 'lawyers'], 'Please select a target audience')
})

type NotificationForm = v.InferOutput<typeof notificationSchema>

const notificationTitle = ref('')
const notificationMessage = ref('')
const notificationType = ref<NotificationForm['type']>('announcement')
const notificationTarget = ref<NotificationForm['target']>('all')

// Form error state
const formErrors = ref<Record<string, string>>({})

// Success modal state
const showSuccessModal = ref(false)
const successModalTitle = ref('Success')
const successModalDescription = ref('')

// Error modal state
const showErrorModal = ref(false)
const errorModalTitle = ref('Error')
const errorModalDescription = ref('')

// ---- Recent list filters (search q= + type=) ----
const searchQuery = ref('')
const selectedTypeTab = ref<NotificationForm['type'] | 'all'>('all')

const typeTabs = [
  { label: 'All', value: 'all' },
  { label: 'Announcement', value: 'announcement' },
  { label: 'Platform update', value: 'platform_update' },
  { label: 'Promotion', value: 'promotion' },
  { label: 'Security alert', value: 'security_alert' }
]

const activeQuery = computed(() => {
  const q: Record<string, string | number> = {}
  if (searchQuery.value.trim()) q.q = searchQuery.value.trim()
  if (selectedTypeTab.value !== 'all') q.type = selectedTypeTab.value
  return q
})

// ---- Skeleton + Infinite scroll state ----
const isLoadingList = ref(true)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const listContainerRef = ref<HTMLElement | null>(null)

const normalizeNotificationsList = (res: any): any[] => {
  const list = res?.data?.data?.data.notifications ?? res?.data?.data ?? res?.data
  return Array.isArray(list) ? list : []
}

const mapForTemplate = (list: any[]): any[] => list.map((n: any) => ({
  id: n?.id ?? n?._id,
  title: n?.title ?? n?.heading ?? '',
  sub: n?.message ?? n?.body ?? '',
  target: n?.target ?? 'all',
  type: n?.type ?? 'announcement',
  view: n?.views ?? n?.delivered ?? '-',
  time: n?.created_at ?? n?.time ?? ''
}))

const fetchList = async (opts: { reset: boolean }) => {
  if (opts.reset) {
    page.value = 1
    hasMore.value = true
    recentNotifications.value = []
    isLoadingList.value = true
    listError.value = ''
    hasFetchError.value = false
  }

  if (!hasMore.value && !opts.reset) return

  const nextPage = page.value
  const query = { ...activeQuery.value, page: nextPage }

  if (!opts.reset) {
    isLoadingMore.value = true
  }

  try {
    const res = await getNotifications(query)

    if (!res?.success) {
      listError.value = displayApiError(res, 'Failed to fetch notifications')
      hasFetchError.value = true
      if (opts.reset) {
        recentNotifications.value = []
      }
      return
    }

    if (res && res.data && res.data.data && res.data.data.success) {
      const list = normalizeNotificationsList(res)
      const meta = res?.data?.meta ?? res?.data?.data?.meta
      stats.value = {
        announcement: res.data.data.data.analytics.sent_by_type.announcement,
        platform_update: res.data.data.data.analytics.sent_by_type.platform_update,
        promotion: res.data.data.data.analytics.sent_by_type.promotion,
        security_alert: res.data.data.data.analytics.sent_by_type.security_alert,
        open_rate: res.data.data.data.analytics.last_broadcast_performance.open_rate,
        opened: res.data.data.data.analytics.last_broadcast_performance.opened,
        delivered: res.data.data.data.analytics.last_broadcast_performance.delivered,
        recipient_count: res.data.data.data.analytics.last_broadcast_performance.recipient_count
      }

      const mapped = mapForTemplate(list)

      if (opts.reset) {
        recentNotifications.value = mapped
      } else {
        recentNotifications.value = [...recentNotifications.value, ...mapped]
      }

      // Use meta to determine if there are more pages
      if (meta) {
        hasMore.value = meta.current_page < meta.last_page
        if (hasMore.value) {
          page.value = meta.current_page + 1
        }
      } else {
        // Fallback: Stop when API returns an empty list
        if (list.length === 0) hasMore.value = false
        else page.value += 1
      }
    }
  } finally {
    isLoadingList.value = false
    isLoadingMore.value = false
  }
}

const applySearch = async () => {
  await fetchList({ reset: true })
}

const onTypeTabChange = async (val: string | number) => {
  const v = String(val)
  selectedTypeTab.value = v === 'all' ? 'all' : (v as NotificationForm['type'])
  await fetchList({ reset: true })
}

const onScroll = async () => {
  if (isLoadingMore.value || isLoadingList.value) return
  if (!hasMore.value) return

  const el = listContainerRef.value
  if (!el) return

  // When near bottom, load next page
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
    await fetchList({ reset: false })
  }
}

// ---- Mount: Promise.all for clients + lawyers + notifications ----
onMounted(async () => {
  const [clientsRes, lawyersRes] = await Promise.all([
    getClients(),
    getLawyers()
  ])

  clientCount.value = clientsRes.data.data.meta.total || 0
  lawyerCount.value = lawyersRes.data.lawyers.data.meta.total || 0
  allCount.value = clientCount.value + lawyerCount.value

  // Use fetchList for initial load to properly set up pagination
  await fetchList({ reset: true })
})

watch([searchQuery, selectedTypeTab], async () => {
  // Only auto-reset when search query changes via explicit enter/click.
  // Keeping it minimal: user calls applySearch/onTypeTabChange.
})

// Clear errors when user starts typing/changing form fields
watch(notificationTitle, () => {
  if (formErrors.value.title) {
    const newErrors = { ...formErrors.value }
    delete newErrors.title
    formErrors.value = newErrors
  }
})

watch(notificationMessage, () => {
  if (formErrors.value.message) {
    const newErrors = { ...formErrors.value }
    delete newErrors.message
    formErrors.value = newErrors
  }
})

watch(notificationType, () => {
  if (formErrors.value.type) {
    const newErrors = { ...formErrors.value }
    delete newErrors.type
    formErrors.value = newErrors
  }
})

watch(notificationTarget, () => {
  if (formErrors.value.target) {
    const newErrors = { ...formErrors.value }
    delete newErrors.target
    formErrors.value = newErrors
  }
})

// ---- Submit notification ----
const submitNotification = async () => {
  // Clear previous errors
  formErrors.value = {}

  const result = v.safeParse(notificationSchema, {
    title: notificationTitle.value,
    message: notificationMessage.value,
    type: notificationType.value,
    target: notificationTarget.value
  })

  if (!result.success) {
    // Map valibot errors to form fields
    const errors: Record<string, string> = {}
    for (const issue of result.issues) {
      const field = issue.path?.[0]?.key || 'general'
      errors[field] = issue.message
    }
    formErrors.value = errors
    console.error('Invalid notification payload:', result.issues)
    return
  }

  isSubmitting.value = true
  try {
    const payload = result.output
    const response = await $fetch('/api/notifications', {
      method: 'POST',
      body: payload
    })


    // success: refetch list with current filters
    await fetchList({ reset: true })

    // Show success modal
    successModalTitle.value = 'Notification Sent!'
    successModalDescription.value = `Your notification has been successfully sent to ${notificationTarget.value === 'all' ? 'all users' : notificationTarget.value}.`
    showSuccessModal.value = true

    // Reset form
    notificationTitle.value = ''
    notificationMessage.value = ''
    notificationType.value = 'announcement'
    notificationTarget.value = 'all'
    formErrors.value = {}
  } catch (err) {
    const errorMessage = (err as any)?.data?.message || (err as any)?.message || 'Failed to send notification'
    errorModalTitle.value = 'Error'
    errorModalDescription.value = String(errorMessage)
    showErrorModal.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-[16px] font-medium text-gray-900 leading-tight">
        Notification Management
      </h1>
      <p class="text-[14px] text-gray-500">
        Send and track push notifications & broadcasts
      </p>
    </div>

    <!-- Error Banner -->
    <SharedErrorBanner
      v-if="hasFetchError"
      :message="listError"
    />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column: Compose & Recent -->
      <div class="space-y-6">
        <!-- Compose Notification -->
        <UCard>
          <div class="space-y-6">
            <div>
              <h2 class="text-[14px] font-medium text-gray-900">
                Compose notification
              </h2>
              <p class="text-[12px] text-gray-500">
                Reported by Tunde Bakare • against Emeka Nwachukwu
              </p>
            </div>

            <div class="space-y-4">
              <div class="flex flex-col space-y-1.5">
                <label class="text-sm font-medium text-gray-700">Title</label>
                <UInput
                  v-model="notificationTitle"
                  placeholder="e.g Platform update - new search filters"
                  :class="{ 'ring-2 ring-red-500': formErrors.title }"
                />
                <p v-if="formErrors.title" class="text-xs text-red-600 mt-1">
                  {{ formErrors.title }}
                </p>
              </div>

              <div class="flex flex-col space-y-1.5">
                <label class="text-sm font-medium text-gray-700">Message</label>
                <UTextarea
                  v-model="notificationMessage"
                  placeholder="e.g Platform update - new search filters"
                  :rows="5"
                  :class="{ 'ring-2 ring-red-500': formErrors.message }"
                />
                <p v-if="formErrors.message" class="text-xs text-red-600 mt-1">
                  {{ formErrors.message }}
                </p>
              </div>

              <div class="flex flex-col space-y-1.5">
                <label class="text-sm font-medium text-gray-700">Type</label>
                <USelect
                  v-model="notificationType"
                  :items="['announcement', 'platform_update', 'promotion', 'security_alert']"
                  :class="{ 'ring-2 ring-red-500': formErrors.type }"
                />
                <p v-if="formErrors.type" class="text-xs text-red-600 mt-1">
                  {{ formErrors.type }}
                </p>
              </div>

              <div class="space-y-3 pt-2">
                <label class="text-sm font-medium text-gray-700">Target</label>
                <div class="flex flex-wrap gap-2 mt-2 pb-6">
                  <button
                    type="button"
                    class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
                    :class="[
                      notificationTarget === 'all' ? 'bg-[#EFF6FF] text-[#003357] border-[#003357]/20' : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50',
                      { 'ring-2 ring-red-500': formErrors.target }
                    ]"
                    @click="notificationTarget = 'all'"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-transparent hover:bg-gray-50 text-gray-600"
                    :class="[
                      notificationTarget === 'clients' ? 'bg-[#EFF6FF] text-[#003357] border-[#003357]/20' : '',
                      { 'ring-2 ring-red-500': formErrors.target }
                    ]"
                    @click="notificationTarget = 'clients'"
                  >
                    Clients
                  </button>
                  <button
                    type="button"
                    class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-transparent hover:bg-gray-50 text-gray-600"
                    :class="[
                      notificationTarget === 'lawyers' ? 'bg-[#EFF6FF] text-[#003357] border-[#003357]/20' : '',
                      { 'ring-2 ring-red-500': formErrors.target }
                    ]"
                    @click="notificationTarget = 'lawyers'"
                  >
                    Lawyers
                  </button>
                </div>
                <p v-if="formErrors.target" class="text-xs text-red-600 mt-1">
                  {{ formErrors.target }}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
              <span class="text-sm text-gray-500 font-medium">{{ notificationTarget === 'all' ? allCount : (notificationTarget === 'clients' ? clientCount : lawyerCount) }} recipients</span>
              <UButton
                color="primary"
                class="bg-[#003357] hover:bg-[#002244]"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                @click="submitNotification"
              >
                {{ isSubmitting ? 'Sending...' : 'Send notification' }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right Column: Performance Stats -->
      <div class="space-y-6">
        <UCard>
          <div class="space-y-8">
            <div>
              <h2 class="text-[14px] font-medium text-gray-900">
                Performance
              </h2>
              <p class="text-[12px] text-gray-500">
                Here's how your notifications have performed
              </p>
            </div>

            <div class="space-y-4">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Last Broadcast Performance
              </h3>

              <div class="space-y-[8px]">
                <div class="flex justify-between items-center space-y-2">
                  <div class="text-[14px]">
                    <span class="text-gray-600 font-medium">Delivered</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UProgress
                      v-model="stats.delivered"
                      :max="stats.recipient_count"
                      color="primary"
                      class="h-[6px] w-[106px]"
                    />
                    <span class="font-bold text-gray-900">{{ stats.delivered }}</span>
                  </div>
                </div>

                <div class="flex justify-between items-center space-y-2">
                  <div class="flex justify-between items-center space-y-2">
                    <span class="text-[14px] text-gray-600 font-medium">Opened</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UProgress
                      v-model="stats.opened"
                      :max="stats.recipient_count"
                      color="primary"
                      class="h-[6px] w-[106px]"
                    />
                    <span class="font-bold text-gray-900">{{ stats.opened }}</span>
                  </div>
                </div>

                <div class="flex justify-between items-center space-y-2">
                  <div class="flex justify-between items-center space-y-2">
                    <span class="text-[14px] text-gray-600 font-medium">Open Rate</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UProgress
                      v-model="stats.open_rate"
                      :max="100"
                      color="primary"
                      class="h-[6px] w-[106px]"
                    />
                    <span class="font-bold text-gray-900">{{ stats.open_rate }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-gray-100">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                Sent By Type — This Month
              </h3>

              <div class="space-y-4">
                <div class="flex justify-between items-center text-sm py-1 border-b border-gray-50 pb-3">
                  <span class="text-gray-900 font-medium">Announcements</span>
                  <span class="text-gray-500">{{ stats.announcement }} sent</span>
                </div>

                <div class="flex justify-between items-center text-sm py-1 border-b border-gray-50 pb-3">
                  <span class="text-gray-900 font-medium">Platform updates</span>
                  <span class="text-gray-500">{{ stats.platform_update }} sent</span>
                </div>

                <div class="flex justify-between items-center text-sm py-1 border-b border-gray-50 pb-3">
                  <span class="text-gray-900 font-medium">Promotions</span>
                  <span class="text-gray-500">{{ stats.promotion }} sent</span>
                </div>

                <div class="flex justify-between items-center text-sm py-1">
                  <span class="text-gray-900 font-medium">Security alerts</span>
                  <span class="text-gray-500">{{ stats.security_alert }} sent</span>
                </div>

                <!-- <div class="flex justify-between items-center text-sm py-1">
                  <span class="text-gray-900 font-medium">Others</span>
                  <span class="text-gray-500">10 sent</span>
                </div> -->
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
    <!-- Recent Notifications -->
    <UCard>
      <div class="p-4 sm:p-6 pb-2">
        <div class="flex items-center justify-between gap-4">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Recent Notifications
          </h3>

          <UInput
            v-model="searchQuery"
            placeholder="Search notifications"
            icon="i-heroicons-magnifying-glass"
            class="w-full md:w-[367px]"
            :ui="{ base: 'rounded-[36px] text-[14px] py-[10px] ring-[0.5px]' }"
            @keyup.enter="applySearch"
          />
        </div>

        <div class="mt-4">
          <UTabs
            :items="typeTabs"
            :model-value="selectedTypeTab"
            @update:model-value="onTypeTabChange"
          />
        </div>
      </div>

      <!-- Skeleton -->
      <template v-if="isLoadingList">
        <div class="space-y-0 pb-4">
          <UCard
            v-for="i in 6"
            :key="i"
            class="mx-4 sm:mx-6 my-2 rounded-xl"
          >
            <div class="space-y-3">
              <USkeleton class="h-4 w-2/3" />
              <USkeleton class="h-3 w-full" />
              <USkeleton class="h-3 w-5/6" />
            </div>
          </UCard>
        </div>
      </template>

      <template v-else>
        <div
          ref="listContainerRef"
          class="space-y-0 pb-4 max-h-[520px] overflow-y-auto"
          @scroll.passive="onScroll"
        >
          <div
            v-for="(notif, idx) in recentNotifications"
            :key="notif.id ?? idx"
            class="px-4 sm:px-6 py-4 border-t border-gray-100/60 first:border-t-0 hover:bg-gray-50 transition-colors"
          >
            <div class="flex justify-between items-start mb-1">
              <h4 class="font-bold text-sm text-gray-900">
                {{ notif.title }}
              </h4>
              <span class="text-xs text-gray-400 whitespace-nowrap ml-4">{{ notif.time }}</span>
            </div>
            <p class="text-xs text-gray-500 mb-3">
              {{ notif.sub }}
            </p>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UBadge
                  color="neutral"
                  variant="solid"
                  class="rounded-full bg-[#EFF6FF] text-[#003357] font-medium text-xs px-2.5 py-0.5"
                >
                  {{ notif.target }}
                </UBadge>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  class="rounded-full text-xs px-2.5 py-0.5 text-gray-500 bg-gray-100 border-none"
                >
                  {{ notif.type }}
                </UBadge>
              </div>

              <div class="flex items-center gap-1.5 text-gray-400">
                <UIcon
                  name="i-lucide-eye"
                  class="w-3.5 h-3.5"
                />
                <span class="text-xs font-medium">{{ notif.view }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="isLoadingMore"
            class="px-4 sm:px-6 py-4 text-sm text-gray-500 text-center"
          >
            Loading more...
          </div>

          <div
            v-if="!hasMore && recentNotifications.length > 0"
            class="px-4 sm:px-6 py-4 text-xs text-gray-400 text-center"
          >
            No more notifications.
          </div>

          <SharedEmptyState
            v-if="recentNotifications.length === 0 && !isLoadingList"
            icon="i-lucide-bell"
            title="No notifications"
            description="You have no recent notifications."
            action-label="Refresh"
            @action="fetchList({ reset: true })"
          />
        </div>
      </template>
    </UCard>

    <!-- Success Modal -->
    <SharedSuccessModal
      v-model="showSuccessModal"
      :title="successModalTitle"
      :description="successModalDescription"
      button-text="Continue"
      @complete="showSuccessModal = false"
    />

    <!-- Error Modal -->
    <SharedErrorModal
      v-model="showErrorModal"
      :title="errorModalTitle"
      :description="errorModalDescription"
      button-text="Dismiss"
      @complete="showErrorModal = false"
    />
  </div>
</template>
