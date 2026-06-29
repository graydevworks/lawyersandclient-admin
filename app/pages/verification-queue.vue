<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { formatRelativeDate, formatTimestamp } from '~/util/helper'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()

// --- Composables ---
const { getVerificationQueue, getVerification, approveVerification, declineVerification, reviewVerification, updating } = useVerification()

const skeleton = ref(true)
const detailLoading = ref(false)
const pending = ref(0)
const urgent = ref(0)
const isLoadingMore = ref(false)
const hasMoreSubmissions = ref(true)
const currentPage = ref(1)
const perPage = ref(15)
const totalItems = ref(0)
const totalPages = ref(1)
const submissionsListRef = ref<HTMLElement | null>(null)

interface Submission {
  id: string
  initials: string
  name: string
  specialty: string
  location: string
  submittedAt: string
  fullDate: string
  docsUploaded: number
  docsTotal: number
  priority: string
  email: string
  missing: string
  statusBg: string
  avatar: string
  documents: { name: string, type: string, status: string, uploaded: boolean, url: string }[]
  history: { action: string, date: string }[]
  notes: { note: string, date: string, addedBy: string }[]
}

const submissions = ref<Submission[]>([])
const selectedSubmission = ref<Submission | null>(null)
const reviewNote = ref('')
const searchQuery = ref('')

// Modal state
const showApproveConfirm = ref(false)
const showRejectModal = ref(false)
const showSuccessModal = ref(false)
const successTitle = ref('')
const successDescription = ref('')
const rejectReason = ref('')

// Document preview state
const showDocPreview = ref(false)
const previewDoc = ref<{ name: string, type: string, url: string } | null>(null)

// Computed: has at least one uploaded doc
const hasUploadedDocs = computed(() => {
  if (!selectedSubmission.value?.documents) return false
  return selectedSubmission.value.documents.some(d => d.uploaded)
})

const filteredSubmissions = computed(() => {
  if (!searchQuery.value) return submissions.value
  return submissions.value.filter(s => s.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// Colors for initials
const colorPool = [
  'bg-emerald-100 text-emerald-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700'
]

const getColor = (index: number) => colorPool[index % colorPool.length]!

// --- Fetch Queue List ---
const fetchQueue = async (page: number = 1, append: boolean = false) => {
  const params: Record<string, any> = { page, per_page: perPage.value }
  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  const result = await getVerificationQueue(params)
  if (result && result.data && (result.data as any).data && (result.data as any).data.success) {
    const data = (result.data as any).data.data
    const submissionList = data.submissions || []
    const statistics = data.stats || {}
    const meta = data.meta

    // Update pagination metadata
    if (meta) {
      currentPage.value = meta.current_page || page
      totalItems.value = meta.total || 0
      totalPages.value = meta.last_page || 1
      hasMoreSubmissions.value = currentPage.value < totalPages.value
    }

    pending.value = statistics.pending || 0
    urgent.value = statistics.urgent || 0

    console.log('Submissions', submissionList)

    const mappedSubmissions = submissionList.map((item: any) => ({
      id: item.id,
      name: item.full_name,
      initials: (item.full_name[0] + ' ' + item.full_name[item.full_name.length - 1]).toUpperCase(),
      specialty: item.email,
      location: item.location,
      submittedAt: item.submitted_at ? formatRelativeDate(item.submitted_at) : '',
      docsUploaded: item.documents.uploaded || 0,
      docsTotal: item.documents.required || 0,
      priority: item.priority,
      avatar: item.profile_photo_url,
      notes: item.internal_notes.map((note: any) => ({
        note: note.note,
        date: note.added_at ? formatRelativeDate(note.added_at) : '-',
        addedBy: note.added_by
      }))
    }))

    console.log('Mapped Submissions', mappedSubmissions)

    // Append or replace submissions
    if (append) {
      submissions.value = [...submissions.value, ...mappedSubmissions]
    } else {
      submissions.value = mappedSubmissions
    }
  }
}

// --- Load more submissions (infinite scroll) ---
const loadMoreSubmissions = async () => {
  if (isLoadingMore.value || !hasMoreSubmissions.value) return
  isLoadingMore.value = true
  try {
    await fetchQueue(currentPage.value + 1, true)
  } finally {
    isLoadingMore.value = false
  }
}

// --- Fetch Detail by ID ---
const fetchDetail = async (id: string) => {
  detailLoading.value = true
  try {
    const result = await getVerification(id)
    if (result && result.data && (result.data as any).data && (result.data as any).data.success) {
      const item = result.data.data.data as any
      console.log('[Verification Detail]', result.data)

      selectedSubmission.value = {
        id: item.id as string,
        name: item.applicant.full_name as string,
        initials: (item.applicant.full_name[0] + ' ' + item.applicant.full_name[item.applicant.full_name.length - 1]).toUpperCase() as string,
        specialty: item.applicant.practice_areas.join(', ') as string,
        location: item.applicant.state as string,
        submittedAt: item.applicant.submitted_at ? formatRelativeDate(item.applicant.submitted_at) : '-',
        fullDate: item.applicant.submitted_at ? formatRelativeDate(item.applicant.submitted_at) : '-',
        docsUploaded: item.documents.uploaded || 0 as number,
        docsTotal: item.documents.required || 0 as number,
        priority: item.priority as string,
        avatar: item.profile_photo_url as string,
        email: item.applicant.email as string,
        missing: item.days_pending || '-' as string,
        statusBg: item.status_bg || '-' as string,
        documents: item.documents.checklist.map((doc: any) => ({
          name: doc.label as string,
          type: doc.type as string,
          status: doc.status as string,
          uploaded: doc.uploaded as boolean,
          url: doc.url || doc.file_url || '' as string
        })),
        history: item.activity_history.map((action: any) => ({
          action: action.label as string,
          date: action.timestamp ? formatTimestamp(action.timestamp) : '-' as string
        })),
        notes: item.internal_notes.map((note: any) => ({
          note: note.note as string,
          date: note.added_at ? formatRelativeDate(note.added_at) : '-' as string,
          addedBy: note.added_by as string
        }))
      } as any
    }
  } catch (err) {
    console.error('Failed to fetch verification detail:', err)
  } finally {
    detailLoading.value = false
  }
}

// --- Select submission and update URL ---
function selectSubmission(submission: Submission) {
  // selectedSubmission.value = submission
  // Update URL with id query param
  router.push({ path: '/verification-queue', query: { id: submission.id } })
  // Fetch detail
  fetchDetail(submission.id)
  if (isMobile.value) {
    showDetail.value = true
  }
}

// --- Handle query param changes ---
// watch(() => route.query.id, async (newId) => {
//   if (newId && submissions.value.length > 0) {
//     const found = submissions.value.find(s => s.id === String(newId))
//     if (found && selectedSubmission.value?.id !== found.id) {
//       selectedSubmission.value = found
//       fetchDetail(found.id)
//     }
//   }
// }, { immediate: false })

// --- Approve ---
const handleApprove = () => {
  showApproveConfirm.value = true
}

const confirmApprove = async () => {
  if (!selectedSubmission.value) return
  showApproveConfirm.value = false
  const result = await approveVerification(selectedSubmission.value.id)
  if (result.success) {
    successTitle.value = 'Verification approved'
    successDescription.value = `${selectedSubmission.value.name}'s account has been verified successfully.`
    showSuccessModal.value = true
    // Silent refetch
    fetchQueue()
  }
}

// --- Reject ---
const handleReject = () => {
  rejectReason.value = ''
  showRejectModal.value = true
}

const confirmReject = async () => {
  if (!selectedSubmission.value) return
  showRejectModal.value = false
  const result = await declineVerification(selectedSubmission.value.id, { reason: rejectReason.value })
  if (result.success) {
    successTitle.value = 'Verification rejected'
    successDescription.value = `${selectedSubmission.value.name}'s application has been rejected. They will be notified.`
    showSuccessModal.value = true
    // Silent refetch
    fetchQueue()
  }
}

// --- Save Note ---
const savingNote = ref(false)
const saveNote = async () => {
  if (!selectedSubmission.value || !reviewNote.value.trim()) return
  savingNote.value = true
  await reviewVerification(selectedSubmission.value.id, { id: selectedSubmission.value.id, note: reviewNote.value })
  savingNote.value = false
  reviewNote.value = ''
  // Silent refetch
  fetchQueue()
}

const handleSuccessComplete = () => {
  showSuccessModal.value = false
}

// --- Document actions ---
const isImageDoc = (type: string) => {
  const t = (type || '').toLowerCase()
  return t.includes('image') || t.includes('jpg') || t.includes('jpeg') || t.includes('png') || t.includes('gif') || t.includes('webp')
}

const getDocIcon = (type: string) => {
  const t = (type || '').toLowerCase()
  if (t.includes('pdf')) return 'i-lucide-file-text'
  if (t.includes('image') || t.includes('jpg') || t.includes('png')) return 'i-lucide-image'
  if (t.includes('word') || t.includes('doc')) return 'i-lucide-file-text'
  return 'i-lucide-file'
}

const getDocIconColor = (name: string, uploaded: boolean) => {
  if (!uploaded) return 'text-gray-300'
  if (name.toLowerCase().includes('government') || name.toLowerCase().includes('id')) return 'text-indigo-500'
  return 'text-[#185FA5]'
}

const downloadDocument = (doc: { name: string, url: string }) => {
  if (!doc.url) return
  const personName = selectedSubmission.value?.name?.replace(/\s+/g, '_') || 'user'
  const fileName = `${personName}_${doc.name.replace(/\s+/g, '_')}`
  const link = window.document.createElement('a')
  link.href = doc.url
  link.download = fileName
  link.target = '_blank'
  window.document.body.appendChild(link)
  link.click()
  window.document.body.removeChild(link)
}

const downloadAllDocs = () => {
  if (!selectedSubmission.value?.documents) return
  selectedSubmission.value.documents.filter(d => d.uploaded).forEach(doc => downloadDocument(doc))
}

const openDocPreview = (doc: { name: string, type: string, url: string, uploaded: boolean }) => {
  if (!doc.uploaded || !doc.url) return
  previewDoc.value = { name: doc.name, type: doc.type, url: doc.url }
  showDocPreview.value = true
}

const openInNewTab = () => {
  if (previewDoc.value?.url) {
    window.open(previewDoc.value.url, '_blank')
  }
}

// --- Mobile handling ---
const isMobile = ref(false)
const showDetail = ref(false)

const checkScreen = () => {
  isMobile.value = window.innerWidth < 1024
}

function backToList() {
  showDetail.value = false
}

// --- Init ---
onMounted(async () => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
  await fetchQueue()
  skeleton.value = false

  // Setup infinite scroll listener
  const setupInfiniteScroll = () => {
    const listElement = submissionsListRef.value
    if (listElement) {
      listElement.addEventListener('scroll', () => {
        const scrollPercentage = (listElement.scrollTop + listElement.clientHeight) / listElement.scrollHeight
        if (scrollPercentage > 0.8) {
          // User is near the bottom
          loadMoreSubmissions()
        }
      })
    }
  }

  setTimeout(setupInfiniteScroll, 100)

  // Select from query param or auto-select first
  const queryId = route.query.id as string
  if (queryId) {
    const found = submissions.value.find(s => s.id == queryId)
    if (found) {
      selectedSubmission.value = found
      fetchDetail(found.id)
    } else if (submissions.value.length > 0) {
      selectedSubmission.value = submissions.value[0]!
      router.replace({ path: '/verification-queue', query: { id: submissions.value[0]!.id } })
      fetchDetail(submissions.value[0]!.id)
    }
  } else if (submissions.value.length > 0) {
    selectedSubmission.value = submissions.value[0]!
    router.replace({ path: '/verification-queue', query: { id: submissions.value[0]!.id } })
    fetchDetail(submissions.value[0]!.id)
  }
})

// --- Watch search query to reset and refetch ---
watch(searchQuery, () => {
  currentPage.value = 1
  hasMoreSubmissions.value = true
  fetchQueue(1, false)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen)
})

// Silent background refresh every 60 seconds
const { start } = useIntervalFetch(fetchQueue, 60000)
onMounted(() => start())
</script>

<template>
  <div class="h-[calc(100vh-theme(spacing.24))] flex flex-col">
    <!-- Header -->
    <div class="mb-6 shrink-0">
      <h1 class="text-[20px] font-semibold text-gray-900 leading-tight">
        Verification Queue
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        {{ pending }} pending &middot; {{ urgent }} need urgent attention
      </p>
    </div>

    <!-- Main Content Split -->
    <div class="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
      <!-- Left Column: List -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0"
        :class="[
          showDetail && isMobile ? 'hidden' : 'block',
          isMobile ? 'w-full' : 'lg:w-1/3'
        ]"
      >
        <div class="p-5 border-b border-gray-100">
          <h2 class="font-bold text-gray-900 mb-4">
            Submissions
          </h2>
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search ..."
            class="w-full"
            :ui="{ base: 'rounded-[36px] text-[14px] py-[10px]' }"
          />
        </div>

        <!-- Skeleton Loading -->
        <div
          v-if="skeleton"
          class="flex-1 overflow-y-auto min-h-0 p-4 space-y-4"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="flex items-start gap-3"
          >
            <USkeleton class="w-10 h-10 rounded-full shrink-0" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-3/4" />
              <USkeleton class="h-3 w-1/2" />
              <USkeleton class="h-3 w-1/3" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredSubmissions.length === 0"
          class="flex-1 overflow-y-auto min-h-0"
        >
          <SharedEmptyState
            v-if="searchQuery"
            icon="i-lucide-search-x"
            title="No results found"
            :description="`No submissions match '${searchQuery}'.`"
          />
          <SharedEmptyState
            v-else
            icon="i-lucide-clipboard-check"
            title="No submissions"
            description="There are no pending verifications in the queue."
          />
        </div>

        <div
          v-else
          ref="submissionsListRef"
          class="flex-1 overflow-y-auto min-h-0"
        >
          <div
            v-for="sub in filteredSubmissions"
            :key="sub.id"
            class="p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3 border-l-4"
            :class="selectedSubmission?.id === sub.id ? 'bg-blue-50/30 border-l-blue-600' : 'border-l-transparent'"
            @click="selectSubmission(sub)"
          >
            <UAvatar
              v-if="sub.avatar"
              :src="sub.avatar"
              size="sm"
              class="size-[36px]"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
              :class="sub.statusBg"
            >
              {{ sub.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-900 text-sm truncate">
                {{ sub.name }}
              </h3>
              <p class="text-xs text-gray-500 mt-1 truncate">
                {{ sub.specialty }} &middot; {{ sub.location }}
              </p>
              <p class="text-xs text-gray-400 mt-2">
                {{ sub.submittedAt }}
              </p>
            </div>
            <div class="flex flex-col items-end justify-between self-stretch shrink-0">
              <div class="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <UIcon
                  name="i-heroicons-document-text"
                  class="w-3.5 h-3.5"
                />
                {{ sub.docsUploaded }}/{{ sub.docsTotal }}
              </div>
              <UBadge
                variant="soft"
                size="xs"
                class="rounded-full px-3 text-[12px] font-light bg-[#F1EFE8] text-[#5F5E5A]"
                :class="{ 'bg-[#FCEBEB] text-[#A32D2D]': sub.priority === 'Urgent' }"
              >
                {{ sub.priority }}
              </UBadge>
            </div>
          </div>

          <!-- Loading indicator for infinite scroll -->
          <div
            v-if="isLoadingMore"
            class="p-4 flex items-center justify-center"
          >
            <UProgress
              :model-value="50"
              :ui="{ progress: { rounded: 'rounded-full' } }"
              class="h-1 w-8"
            />
          </div>
        </div>
      </div>

      <!-- Right Column: Details -->
      <div
        v-if="selectedSubmission"
        class="flex flex-col gap-6 overflow-y-auto pb-6 min-h-0"
        :class="[
          isMobile
            ? (showDetail ? 'fixed inset-0 z-50 bg-white rounded-t-2xl shadow-2xl mt-16 pt-4 px-4' : 'hidden')
            : 'flex-1 pr-2'
        ]"
      >
        <!-- Back button (mobile only) -->
        <button
          v-if="isMobile"
          class="flex items-center gap-2 text-sm font-medium text-[#003357] mb-3 shrink-0 px-2"
          @click="backToList"
        >
          <UIcon
            name="i-heroicons-arrow-left"
            class="w-5 h-5"
          />
          Back to submissions
        </button>

        <!-- Detail Loading Skeleton -->
        <template v-if="detailLoading">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 animate-pulse">
            <USkeleton class="h-6 w-48 mb-2" />
            <USkeleton class="h-4 w-72" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <USkeleton class="h-3 w-20" />
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-3/4" />
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <USkeleton class="h-3 w-20" />
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-3/4" />
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <USkeleton class="h-3 w-24" />
            <div class="grid grid-cols-3 gap-4">
              <USkeleton class="h-36 w-full rounded-xl" />
              <USkeleton class="h-36 w-full rounded-xl" />
              <USkeleton class="h-36 w-full rounded-xl" />
            </div>
          </div>
        </template>

        <!-- Actual Content -->
        <template v-else>
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div>
              <h2 class="text-xl font-normal text-gray-900">
                {{ selectedSubmission.name }}
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                {{ selectedSubmission.specialty }} &middot; {{ selectedSubmission.location }} &middot; Submitted {{ selectedSubmission.fullDate }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button
                class="px-5 py-2 rounded-lg font-medium text-sm text-white bg-[#A32D2D] hover:bg-rose-800 transition-colors shadow-sm disabled:opacity-50"
                :disabled="updating"
                @click="handleReject"
              >
                Reject
              </button>
              <button
                class="px-5 py-2 rounded-lg font-medium text-sm text-white bg-[#0F6E56] hover:bg-teal-800 transition-colors shadow-sm disabled:opacity-50"
                :disabled="updating"
                @click="handleApprove"
              >
                Approve
              </button>
            </div>
          </div>

          <!-- Info Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-xs font-medium text-gray-400 tracking-wider uppercase mb-6">
                Submission
              </h3>
              <div>
                <div class="flex justify-between items-center text-sm border-b border-gray-100 py-[12px]">
                  <span class="text-gray-500">Submitted</span>
                  <span class="font-medium text-gray-900">{{ selectedSubmission.fullDate || '-' }}</span>
                </div>
                <div class="flex justify-between items-center text-sm border-b border-gray-100 py-[12px]">
                  <span class="text-gray-500">Documents</span>
                  <span class="font-medium text-gray-900">{{ selectedSubmission.docsUploaded }} of {{ selectedSubmission.docsTotal || '-'  }} uploaded</span>
                </div>
                <div class="flex justify-between items-center text-sm border-b border-gray-100 py-[12px]">
                  <span class="text-gray-500">Days Pending</span>
                  <span :class="selectedSubmission.missing !== 'None' ? 'text-[#A32D2D]' : 'text-gray-900'">{{ selectedSubmission.missing || '-'  }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-[12px]">
                  <span class="text-gray-500">Priority</span>
                  <UBadge
                    :color="selectedSubmission.priority === 'Urgent' ? 'error' : 'neutral'"
                    variant="soft"
                    class="rounded-full px-3 text-[13px] font-light bg-[#F1EFE8]"
                  >
                    {{ selectedSubmission.priority }}
                  </UBadge>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-xs font-medium text-gray-400 tracking-wider uppercase mb-6">
                Applicant
              </h3>
              <div class="text-sm">
                <div class="flex justify-between items-center border-b border-gray-100 py-[12px]">
                  <span class="text-gray-500">Lawyer ID</span>
                  <span class="font-medium text-gray-900 uppercase">{{ selectedSubmission.id || '-'  }}</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-100 py-[12px]">
                  <span class="text-gray-500">Email</span>
                  <span class="font-medium text-gray-900">{{ selectedSubmission.email || '-'  }} 45</span>
                </div>
                <div class="flex justify-between items-center border-b border-gray-100 py-[12px]">
                  <span class="text-gray-500">Location</span>
                  <span class="font-medium text-gray-900">{{ selectedSubmission.location || '-' }}</span>
                </div>
                <div class="flex justify-between items-center py-[12px]">
                  <span class="text-gray-500">Practice area</span>
                  <span class="font-medium text-gray-900">{{ selectedSubmission.specialty || '-' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents Section -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xs font-medium text-gray-400 tracking-wider uppercase">
                Documents
              </h3>
              <UButton
                variant="ghost"
                color="primary"
                size="sm"
                trailing-icon="i-heroicons-arrow-down-tray"
                :disabled="!hasUploadedDocs"
                class="disabled:opacity-40 disabled:cursor-not-allowed"
                @click="downloadAllDocs"
              >
                Download all
              </UButton>
            </div>
            <div
              v-if="selectedSubmission.documents && selectedSubmission.documents.length > 0"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <div
                v-for="doc in selectedSubmission.documents"
                :key="doc.name"
                class="border rounded-xl overflow-hidden flex flex-col transition-shadow"
                :class="[
                  doc.uploaded ? 'border-gray-200 cursor-pointer hover:shadow-md' : 'border-gray-200 border-dashed cursor-default'
                ]"
                @click="openDocPreview(doc)"
              >
                <div
                  class="h-28 flex items-center justify-center shrink-0"
                  :class="doc.uploaded ? doc.name == 'Government ID' ? 'bg-[#EEEDFE]' : 'bg-[#EBF3FC]' : 'bg-gray-50/50'"
                >
                  <UIcon
                    :name="doc.uploaded ? getDocIcon(doc.type) : 'i-heroicons-document'"
                    class="w-12 h-12"
                    :class="getDocIconColor(doc.name, doc.uploaded)"
                  />
                </div>
                <div class="p-4 bg-white flex-1 border-t border-gray-100">
                  <h4 class="text-sm font-medium text-gray-900">
                    {{ doc.name }}
                  </h4>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ doc.type }}
                  </p>
                  <p
                    class="text-xs mt-3 font-medium flex items-center gap-1"
                    :class="doc.uploaded ? 'text-emerald-600' : 'text-rose-500'"
                  >
                    <UIcon
                      v-if="!doc.uploaded"
                      name="i-heroicons-x-mark"
                      class="w-3.5 h-3.5"
                    />
                    <span v-if="doc.uploaded">✓</span>
                    {{ doc.status }}
                  </p>
                </div>
              </div>
            </div>
            <div
              v-else
              class="text-center py-8 text-gray-500 text-sm"
            >
              No documents provided
            </div>
          </div>

          <!-- Review Notes -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
            <h3 class="text-xs font-medium text-gray-400 tracking-wider uppercase mb-5">
              Review Notes
            </h3>
            <UTextarea
              v-model="reviewNote"
              placeholder="Add review notes here — visible to operations team only..."
              class="mb-4 w-full"
              :ui="{ base: 'bg-[#F9FAFB] border border-[#ECECEC] py-[12.5px] px-[15px]' }"
              :rows="3"
              variant="outline"
            />
            <div class="flex justify-end">
              <UButton
                variant="soft"
                :loading="savingNote"
                :disabled="!reviewNote.trim()"
                class="px-5 py-[6.5px] bg-[#EBF3FC] text-[#185FA5] rounded-[7.5px] border border-[#B5D4F4] text-[14px] disabled:opacity-20 disabled:cursor-not-allowed"
                @click="saveNote"
              >
                Save note
              </UButton>
            </div>
            <div class="mt-4">
              <div
                v-for="(note, index) in selectedSubmission.notes"
                :key="index"
                class="mb-4 bg-gray-50 p-5 py-3 rounded-sm"
              >
                <p class="text-sm text-gray-700 font-normal">
                  {{ note.note }} <span class="text-gray-500 text-[12px]"> - by {{ note.addedBy }}</span>
                </p>
                <p class="text-xs font-light text-primary mt-1">
                  {{ note.date }}
                </p>
              </div>
            </div>
          </div>

          <!-- Activity History -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
            <h3 class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-6">
              Activity History
            </h3>
            <div
              v-if="selectedSubmission.history && selectedSubmission.history.length > 0"
              class="space-y-2"
            >
              <div
                v-for="(event, index) in selectedSubmission.history"
                :key="index"
                class="relative pl-6"
                :class="{ 'border-b border-gray-100 pb-[10px]': index !== selectedSubmission.history.length - 1 }"
              >
                <div class="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-[#185FA5] z-10" />
                <p class="text-sm text-gray-900 font-medium">
                  {{ event.action }}
                </p>
                <p class="text-sm font-light text-gray-500">
                  {{ event.date }}
                </p>
              </div>
            </div>
            <div
              v-else
              class="text-center py-4 text-gray-500 text-sm"
            >
              No activity history
            </div>
          </div>
        </template>
      </div>

      <!-- No selection placeholder -->
      <div
        v-else-if="!skeleton"
        class="flex-1 flex items-center justify-center"
      >
        <SharedEmptyState
          icon="i-lucide-file-search"
          title="No submission selected"
          description="Select a lawyer from the list to review their documents and verification details."
        />
      </div>
    </div>

    <!-- Document Preview Modal -->
    <SharedBaseModal
      v-model="showDocPreview"
      :title="previewDoc?.name || 'Document Preview'"
      max-width="max-w-[600px]"
    >
      <div
        v-if="previewDoc"
        class="mt-4"
      >
        <!-- Preview Area -->
        <div class="rounded-xl border border-gray-200 overflow-hidden mb-6 bg-gray-50">
          <div
            v-if="isImageDoc(previewDoc.type)"
            class="flex items-center justify-center p-4 min-h-[300px]"
          >
            <img
              :src="previewDoc.url"
              :alt="previewDoc.name"
              class="max-w-full max-h-[400px] object-contain rounded-lg"
            >
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center py-16 px-4"
          >
            <UIcon
              :name="getDocIcon(previewDoc.type)"
              class="w-20 h-20 mb-4"
              :class="getDocIconColor(previewDoc.name, true)"
            />
            <p class="text-sm font-medium text-gray-900">
              {{ previewDoc.name }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ previewDoc.type }}
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
            @click="openInNewTab"
          >
            Open in new tab
          </UButton>
          <UButton
            block
            icon="i-heroicons-arrow-down-tray"
            class="bg-[#003357] hover:bg-[#004474] text-white font-semibold py-3 rounded-[8px]"
            @click="downloadDocument(previewDoc)"
          >
            Download
          </UButton>
        </div>
      </div>
    </SharedBaseModal>

    <!-- Approve Confirmation Modal -->
    <SharedBaseModal
      v-model="showApproveConfirm"
      title="Approve Verification"
      max-width="max-w-[440px]"
    >
      <div class="mt-2">
        <p class="text-[14px] text-gray-500 mb-6">
          Are you sure you want to approve <span class="font-semibold text-gray-900">{{ selectedSubmission?.name }}</span>'s verification? This will grant them full access to the platform.
        </p>
        <div class="flex gap-3">
          <UButton
            block
            variant="outline"
            color="neutral"
            class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 rounded-[8px]"
            @click="showApproveConfirm = false"
          >
            Cancel
          </UButton>
          <UButton
            block
            :loading="updating"
            class="bg-[#0F6E56] hover:bg-teal-800 text-white font-semibold py-3 rounded-[8px]"
            @click="confirmApprove"
          >
            Approve
          </UButton>
        </div>
      </div>
    </SharedBaseModal>

    <!-- Reject Reason Modal -->
    <SharedBaseModal
      v-model="showRejectModal"
      title="Reject Verification"
      max-width="max-w-[440px]"
    >
      <div class="mt-2">
        <p class="text-[14px] text-gray-500 mb-5">
          Reject <span class="font-semibold text-gray-900">{{ selectedSubmission?.name }}</span>'s application. They will be notified of the decision.
        </p>
        <label class="text-[13px] font-semibold text-gray-600 mb-2 block">Reason</label>
        <UTextarea
          v-model="rejectReason"
          placeholder="State the reason for rejection..."
          :rows="3"
          class="mb-6 w-full"
        />
        <div class="flex gap-3">
          <UButton
            block
            variant="outline"
            color="neutral"
            class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 rounded-[8px]"
            @click="showRejectModal = false"
          >
            Cancel
          </UButton>
          <UButton
            block
            :loading="updating"
            :disabled="!rejectReason.trim()"
            class="bg-[#A32D2D] hover:bg-rose-800 text-white font-semibold py-3 rounded-[8px]"
            @click="confirmReject"
          >
            Reject
          </UButton>
        </div>
      </div>
    </SharedBaseModal>

    <!-- Success Modal (always on top) -->
    <SharedSuccessModal
      v-model="showSuccessModal"
      :title="successTitle"
      :description="successDescription"
      @complete="handleSuccessComplete"
    />
  </div>
</template>
