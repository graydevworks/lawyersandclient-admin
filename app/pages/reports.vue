<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { formatRelativeDate } from '~/util/helper'
import { displayApiError } from '~/util/apiHelper'
import ErrorModal from '~/components/shared/ErrorModal.vue'

definePageMeta({ middleware: 'auth' })

const { getReports, getReport, updateReport } = useReports()

type ReportStatus = 'pending' | 'reviewed' | 'resolved'

type ReportListItem = {
  id: number | string
  title: string
  reporter: string
  time: string
  status?: ReportStatus | string
}

const submissions = ref<ReportListItem[]>([])

const selectedReportId = ref<number | string | null>(null)
const selectedReport = ref<Record<string, any> | null>(null)

const activeTab = ref<'all' | ReportStatus>('all')

const tabs = [
  { label: 'All', value: 'all' as const },
  { label: 'Pending', value: 'pending' as const },
  { label: 'Reviewed', value: 'reviewed' as const },
  { label: 'Resolved', value: 'resolved' as const }
] as const

const searchQuery = ref('')
const isFetching = ref(false)
const listError = ref('')

const resolutionStatus = ref<ReportStatus>('pending')
const resolutionNote = ref('')

const meta = ref({
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1
})

const hasMore = computed(() => meta.value.current_page < meta.value.last_page)

const isSaving = ref(false)

// Error modal state
const showErrorModal = ref(false)
const errorModalTitle = ref('Error')
const errorModalDescription = ref('')

// Image preview state
const showImagePreview = ref(false)
const previewImage = ref<{ url: string, name: string } | null>(null)
const reportImages = ref<Array<{ url: string, name: string, type: string }>>([])

// Attachment preview state
const showAttachmentPreview = ref(false)
const previewAttachment = ref<{ url: string, name: string, type: string } | null>(null)

const loadDetail = async (id: number | string) => {
  const result = await getReport(id)

  const payload = (result as any)?.data?.data ?? (result as any)?.data
  if ((result as any)?.success && payload) {
    selectedReport.value = payload.data.report as Record<string, any>

    const s = selectedReport.value.status ?? selectedReport.value.resolution_status
    if (s === 'pending' || s === 'reviewed' || s === 'resolved') resolutionStatus.value = s

    resolutionNote.value = selectedReport.value.resolution_note ?? selectedReport.value.note ?? ''

    // Load images if available
    if (selectedReport.value.images && Array.isArray(selectedReport.value.images)) {
      reportImages.value = selectedReport.value.images.map((img: any) => ({
        url: img.url || img.image_url || img.path,
        name: img.name || img.filename || 'Image',
        type: img.type || img.mime_type || 'image'
      }))
    } else if (selectedReport.value.image_url) {
      reportImages.value = [{
        url: selectedReport.value.image_url,
        name: 'Report Image',
        type: 'image'
      }]
    } else {
      reportImages.value = []
    }

    console.log('Selected Report:', selectedReport.value)
  }
}

const resetListState = () => {
  meta.value = { current_page: 1, per_page: 15, total: 0, last_page: 1 }
  submissions.value = []
  isFetching.value = false
}

const fetchList = async ({ append }: { append: boolean }) => {
  if (isFetching.value) return
  if (!append) {
    isFetching.value = true
    listError.value = ''
  }

  try {
    const result = await getReports({
      ...(activeTab.value !== 'all' ? { status: activeTab.value } : {}),
      ...(searchQuery.value.trim() ? { q: searchQuery.value.trim() } : {}),
      page: meta.value.current_page
    })

    if (!result?.success) {
      const errorResult = result as { error?: unknown; validationMessages?: string[] } | null | undefined
      listError.value = result.validationMessages[0]
      if (!append) {
        submissions.value = []
      }
      return
    }

    const metaFromApi = result?.data?.data?.meta ?? result?.data?.meta
    const dataFromApi = result?.data?.data?.data ?? result?.data?.data?.reports ?? result?.data?.data

    if (metaFromApi) {
      meta.value = {
        current_page: metaFromApi.current_page ?? 1,
        per_page: metaFromApi.per_page ?? 15,
        total: metaFromApi.total ?? 0,
        last_page: metaFromApi.last_page ?? metaFromApi.current_page ?? 1
      }
    }

    const reports = Array.isArray(dataFromApi) ? dataFromApi : (dataFromApi?.reports ?? [])

    const mapped: ReportListItem[] = reports.map((report: Record<string, unknown>) => {
      const reporter = report.reporter as Record<string, unknown> | undefined
      const reporterName = typeof reporter?.name === 'string' ? reporter.name : undefined

      return {
        id: report.id as number | string,
        title: (report.subject as string) ?? (report.title as string) ?? 'Untitled report',
        reporter: reporterName ?? (typeof report.reporter_name === 'string' ? report.reporter_name : undefined) ?? 'Unknown',
        time: report.created_at ? formatRelativeDate(report.created_at as string) : '',
        status: report.status as string
      }
    })

    submissions.value = append ? [...submissions.value, ...mapped] : mapped

    if (!selectedReportId.value && submissions.value.length > 0) {
      selectedReportId.value = submissions.value[0].id
      await nextTick()
      await loadDetail(submissions.value[0].id)
    }
  } finally {
    isFetching.value = false
  }
}

let observer: IntersectionObserver | null = null
const sentinelEl = ref<HTMLElement | null>(null)

const setupInfiniteScroll = () => {
  if (!sentinelEl.value) return
  observer?.disconnect()

  observer = new IntersectionObserver(async (entries) => {
    const [entry] = entries
    if (entry?.isIntersecting && hasMore.value && !isFetching.value) {
      meta.value.current_page += 1
      await fetchList({ append: true })
    }
  }, { root: null, threshold: 0.1 })

  observer.observe(sentinelEl.value)
}

const onSelectReport = async (id: number | string) => {
  selectedReportId.value = id
  await loadDetail(id)
}

const onSaveResolution = async () => {
  if (!selectedReportId.value) return
  if (isSaving.value) return

  isSaving.value = true
  try {
    const result = await updateReport(selectedReportId.value, {
      status: resolutionStatus.value,
      resolution_note: resolutionNote.value
    })

    if (!result?.success) {
      const errorMessage = (result as any).validationMessages?.[0] || (result as any).error || 'Failed to save resolution note'
      errorModalTitle.value = 'Error'
      errorModalDescription.value = String(errorMessage)
      showErrorModal.value = true
      return
    }

    await loadDetail(selectedReportId.value)
  } finally {
    isSaving.value = false
  }
}

// Image actions
const openImagePreview = (image: { url: string, name: string }) => {
  previewImage.value = image
  showImagePreview.value = true
}

const downloadImage = (image: { url: string, name: string }) => {
  if (!image.url) return
  const link = window.document.createElement('a')
  link.href = image.url
  link.download = image.name
  link.target = '_blank'
  window.document.body.appendChild(link)
  link.click()
  window.document.body.removeChild(link)
}

// Attachment actions
const openAttachmentPreview = (url: string) => {
  const fileName = url.split('/').pop() || 'Attachment'
  const fileType = url.includes('.pdf') ? 'pdf' : url.includes('.doc') || url.includes('.docx') ? 'document' : 'file'
  previewAttachment.value = { url, name: fileName, type: fileType }
  showAttachmentPreview.value = true
}

const downloadAttachment = () => {
  if (!previewAttachment.value?.url) return
  const link = window.document.createElement('a')
  link.href = previewAttachment.value.url
  link.download = previewAttachment.value.name
  link.target = '_blank'
  window.document.body.appendChild(link)
  link.click()
  window.document.body.removeChild(link)
}

const isImageAttachment = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  return imageExtensions.some(ext => url.toLowerCase().includes(ext))
}

const getAttachmentIcon = (type: string) => {
  if (type === 'pdf') return 'pepicons-pencil:file'
  if (type === 'document') return 'pepicons-pencil:file'
  return 'i-lucide-file'
}

watch([activeTab, searchQuery], async () => {
  resetListState()
  await fetchList({ append: false })
  await nextTick()
  setupInfiniteScroll()
})

onMounted(async () => {
  await fetchList({ append: false })
  await nextTick()
  setupInfiniteScroll()
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-[16px] font-bold text-gray-900 leading-tight">
        Reports & Disputes
      </h1>
      <p class="text-[14px] text-gray-500">
        Reports
      </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 items-start">
      <UCard class="lg:w-[400px] flex-shrink-0" :ui="{body: 'p-0!'}">
        <div class="p-4 sm:p-4">
          <h2 class="font-medium text-gray-900 text-lg mb-4">
            Submissions
          </h2>

          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Search reports..."
            class="mb-6 w-full"
            :ui="{ base: 'rounded-[36px] text-[14px] py-[3px] h-[38px] text-[14px] bg-[#F8F8F8] ring-0 border-0', leadingIcon: 'size-[16px] translate-x-[5px]' }"
          />

          <div
            v-if="listError"
            class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ listError }}
          </div>

          <div class="flex gap-2 mb-4 border-b border-gray-100 pb-2">
            <button
              v-for="t in tabs"
              :key="t.value"
              class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              :class="activeTab === t.value ? 'bg-[#EFF6FF] text-[#003357] border-b-0 border-[#013355]!' : 'text-gray-500 hover:text-gray-900'"
              @click="activeTab = t.value"
            >
              {{ t.label }}
            </button>
          </div>

          <div class="space-y-1 -mx-4">
            <SharedEmptyState
              v-if="submissions.length === 0 && !isFetching"
              icon="i-lucide-file-text"
              title="No reports"
              description="There are no reports to show for the current filter."
              action-label="Refresh"
              @action="fetchList({ append: false })"
            />
            <template v-else-if="submissions.length === 0 && isFetching">
              <div
                v-for="i in 5"
                :key="i"
                class="w-full text-left p-4 border-l-2 border-transparent bg-white rounded-md"
              >
                <div class="space-y-3">
                  <USkeleton class="h-4 w-4/5" />
                  <USkeleton class="h-3 w-2/3" />
                  <USkeleton class="h-3 w-1/2" />
                </div>
              </div>
            </template>

            <button
              v-for="sub in submissions"
              v-else
              :key="sub.id"
              class="w-full text-left p-4 hover:bg-gray-50 transition-colors border-l-2"
              :class="sub.id === selectedReportId ? 'bg-[#F8FAFC] border-[#003357]' : 'border-transparent'"
              @click="onSelectReport(sub.id)"
            >
              <h3 class="font-bold text-sm text-gray-900 line-clamp-1">
                {{ sub.title }}
              </h3>
              <p class="text-xs text-gray-500 mt-1 line-clamp-1">
                Reported by {{ sub.reporter }}
              </p>
              <p class="text-xs text-gray-400 mt-2">
                {{ sub.time }}
              </p>
            </button>
          </div>

          <div ref="sentinelEl" class="h-1" />
          <div v-if="isFetching && submissions.length > 0" class="py-3 flex justify-center">
            <div class="flex flex-col items-center gap-2 text-xs text-gray-500">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-loader" class="animate-spin" />
                <span>Loading…</span>
              </div>
            </div>
          </div>
          <div v-else-if="hasMore" class="py-3 h-6" />
        </div>
      </UCard>

      <div class="flex-1 w-full space-y-6">
        <UCard class="w-full lg:sticky lg:top-6 self-start">
          <div class="pb-6 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-900">
              {{ selectedReport?.subject || 'Select a report' }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              {{ selectedReport?.id ? `RPT-${selectedReport.id}` : '' }}
            </p>
          </div>

          <div v-if="selectedReport" class="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gray-100">
            <div class="space-y-4">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Reporter
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500">Name</span>
                  <span class="font-medium text-gray-900">{{ selectedReport.reporter?.name || '—' }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Applicant
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500">Name</span>
                  <span class="font-medium text-gray-900">{{ selectedReport.reported?.name || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedReport" class="py-6 space-y-4 border-b border-gray-100">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Description
            </h3>
            <p class="text-sm font-medium text-gray-900 leading-relaxed">
              {{ selectedReport.description || selectedReport.details || '—' }}
            </p>
          </div>

          <!-- Attachment Section -->
          <div v-if="selectedReport?.attachment_url" class="py-6 space-y-4 border-b border-gray-100">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Attachment
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div
                class="relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors"
                @click="openAttachmentPreview(selectedReport.attachment_url)"
              >
                <img
                  v-if="isImageAttachment(selectedReport.attachment_url)"
                  :src="selectedReport.attachment_url"
                  alt="Attachment"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-gray-50"
                >
                  <UIcon
                    :name="getAttachmentIcon(previewAttachment?.type || 'file')"
                    class="w-12 h-12 text-gray-400"
                  />
                </div>
                <div class="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <UIcon
                    name="i-lucide-zoom-in"
                    class="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Images Section -->
          <div v-if="reportImages.length > 0" class="py-6 space-y-4 border-b border-gray-100">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Uploaded Images
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="(image, index) in reportImages"
                :key="index"
                class="relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors"
                @click="openImagePreview(image)"
              >
                <img
                  :src="image.url"
                  :alt="image.name"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <UIcon
                    name="i-lucide-zoom-in"
                    class="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="pt-6 space-y-4">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Resolution notes
            </h3>

            <div class="flex flex-col gap-2" v-if="resolutionNote">
              <div class="rounded-sm border-l-2 border-primary bg-neutral-100 text-xs p-2">
                <h2>{{ resolutionNote }}</h2>
              </div>
            </div>

            <div v-if="selectedReport" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label>
                <USelect
                  v-model="resolutionStatus"
                  :items="[
                    { label: 'Pending', value: 'pending' },
                    { label: 'Reviewed', value: 'reviewed' },
                    { label: 'Resolved', value: 'resolved' }
                  ]"
                  class="mt-2 w-full"
                />
              </div>

              <div class="md:col-span-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Resolution note</label>
                <UTextarea
                  v-model="resolutionNote"
                  class="w-full mt-2"
                  placeholder="Enter resolution note..."
                  :rows="3"
                />
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <UButton
                :loading="isSaving"
                :disabled="isSaving || !selectedReportId"
                color="neutral"
                variant="solid"
                class="shadow-sm border border-[#003357] text-[#003357] hover:bg-[#EEF6FF] bg-white disabled:bg-gray-50!"
                @click="onSaveResolution"
              >
                Save note
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <SharedBaseModal
      v-model="showImagePreview"
      :title="previewImage?.name || 'Image Preview'"
      max-width="max-w-[800px]"
    >
      <div
        v-if="previewImage"
        class="mt-4"
      >
        <!-- Image Preview Area -->
        <div class="rounded-xl border border-gray-200 overflow-hidden mb-6 bg-gray-50 flex items-center justify-center">
          <img
            :src="previewImage.url"
            :alt="previewImage.name"
            class="max-w-full max-h-[500px] object-contain"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <UButton
            block
            variant="outline"
            color="neutral"
            icon="i-lucide-external-link"
            class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 rounded-[8px]"
            @click="() => window.open(previewImage?.url, '_blank')"
          >
            Open in new tab
          </UButton>
          <UButton
            block
            icon="i-heroicons-arrow-down-tray"
            class="bg-[#003357] hover:bg-[#004474] text-white font-semibold py-3 rounded-[8px]"
            @click="downloadImage(previewImage)"
          >
            Download
          </UButton>
        </div>
      </div>
    </SharedBaseModal>

    <!-- Attachment Preview Modal -->
    <SharedBaseModal
      v-model="showAttachmentPreview"
      :title="previewAttachment?.name || 'Attachment Preview'"
      max-width="max-w-[800px]"
    >
      <div
        v-if="previewAttachment"
        class="mt-4"
      >
        <!-- Attachment Preview Area -->
        <div class="rounded-xl border border-gray-200 overflow-hidden mb-6 bg-gray-50 flex items-center justify-center">
          <img
            v-if="isImageAttachment(previewAttachment.url)"
            :src="previewAttachment.url"
            :alt="previewAttachment.name"
            class="max-w-full max-h-[500px] object-contain"
          />
          <div
            v-else
            class="flex flex-col items-center justify-center py-16 px-4"
          >
            <UIcon
              :name="getAttachmentIcon(previewAttachment.type)"
              class="w-20 h-20 mb-4 text-gray-400"
            />
            <p class="text-sm font-medium text-gray-900">
              {{ previewAttachment.name }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ previewAttachment.type }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <UButton
            block
            variant="outline"
            color="neutral"
            icon="i-lucide-external-link"
            class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 rounded-[8px]"
            @click="() => window.open(previewAttachment?.url, '_blank')"
          >
            Open in new tab
          </UButton>
          <UButton
            block
            icon="i-heroicons-arrow-down-tray"
            class="bg-[#003357] hover:bg-[#004474] text-white font-semibold py-3 rounded-[8px]"
            @click="downloadAttachment"
          >
            Download
          </UButton>
        </div>
      </div>
    </SharedBaseModal>

    <!-- Error Modal -->
    <SharedErrorModal
      v-model="showErrorModal"
      :title="errorModalTitle"
      :description="errorModalDescription"
      button-text="Dismiss"
    />
  </div>
</template>
