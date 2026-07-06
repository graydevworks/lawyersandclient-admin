<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLawyers } from '../../../composables/useLawyers'
import ErrorModal from '~/components/shared/ErrorModal.vue'
import { formatRelativeDate } from '~/util/helper'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

type Lawyer = {
  name?: string
  banner?: string
  profilePicture?: string
  id?: string
  location?: string
  phone?: string
  email?: string
  rating?: number
  experience?: string
  status?: string
  languages?: string[]
  bio?: string
  practiceAreas?: string[]
  verificationStatus?: string
  activity?: {
    totalChats?: number
    reportsFiled?: number
    lastActive?: string
    joined?: string
  }
  documents?: Array<{
    title?: string
    type?: string
    size?: string
    status?: string
    icon?: string
    color?: string
    isMissing?: boolean
    url?: string
    file_url?: string
    document_url?: string
  }>
  reviews?: Array<{
    name?: string
    rating?: number
    date?: string
    comment?: string
  }>
  workExperience?: Array<{
    role?: string
    company?: string
    period?: string
    description?: string
  }>
}

const lawyer = ref<Lawyer>({})
const isLoading = ref(true)

const isResetConfirmOpen = ref(false)
const isSuspendDialogOpen = ref(false)
const isReinstateConfirmOpen = ref(false)

const isResetSuccessOpen = ref(false)
const isSuspendSuccessOpen = ref(false)
const isReinstateSuccessOpen = ref(false)

const isDeleteConfirmOpen = ref(false)
const isDeleteSuccessOpen = ref(false)

const showErrorModal = ref(false)
const errorModalTitle = ref('Error')
const errorModalDescription = ref('')

const suspendReason = ref('Abuse / misconduct')
const deleteReason = ref('Abuse / misconduct')
const deleteConfirmed = ref(false)
const suspendReasons = [
  'Abuse / misconduct',
  'Spam or fraudulent activity',
  'Violation of terms of service',
  'Multiple complaints',
  'Other'
]
const deleteReasons = [
  'Abuse / misconduct',
  'Spam or fraudulent activity',
  'Violation of terms of service',
  'Multiple complaints',
  'Other'
]
const isMutating = ref(false)

const { showLawyers, resetLawyerPassword, suspendLawyer, reinstateLawyer, deleteLawyer } = useLawyers()

// Document preview state
const showDocPreview = ref(false)
const previewDoc = ref<{ name: string, type: string, url: string } | null>(null)

const isSuspended = ref(false)

watch(
  () => lawyer.value.status,
  (v) => {
    if (!isMutating.value) {
      isSuspended.value = (v || '').toLowerCase().includes('suspend')
    }
  },
  { immediate: true }
)

const loadLawyer = async () => {
  isLoading.value = true
  try {
    const result = (await showLawyers(id)) as unknown

    if (typeof result === 'object'
      && result !== null
      && 'data' in result
    ) {
      const data = (result as { data: unknown }).data

      if (!data || typeof data !== 'object') return

      const lawyersData = (data as { lawyers?: { data?: unknown } }).lawyers?.data
      if (!lawyersData || typeof lawyersData !== 'object') return

      const success = (lawyersData as { success?: boolean }).success
      if (!success) return

      const rawLawyer = (lawyersData as { data?: unknown }).data
      if (!rawLawyer || typeof rawLawyer !== 'object') return

      const d = rawLawyer as {
        id?: string | number
        full_name?: string
        location?: string
        phone?: string
        email?: string
        average_rating?: number
        years_of_experience?: string
        status?: string
        practice_areas?: { name?: string }[] | null
        bio?: string
        activity?: Lawyer['activity']
        documents?: Lawyer['documents']
        reviews?: Lawyer['reviews']
        is_available?: boolean
        banner_photo_url?: string
        profile_photo_url?: string
        verification_status?: string
        work_experiences?: Lawyer['workExperience']
      }

      if (!d.full_name) return

      lawyer.value = {
        id: d.id?.toString(),
        name: d.full_name,
        location: d.location || 'N/A',
        phone: d.phone,
        email: d.email,
        rating: d.average_rating,
        experience: d.years_of_experience,
        status: d.status,
        languages: ['English'],
        bio: d.bio,
        practiceAreas: d.practice_areas && d.practice_areas.length ? d.practice_areas.map((pa: { name?: string }) => pa.name) : ['N/A'],
        activity: d.activity,
        documents: d.documents,
        reviews: d.reviews,
        banner: d.banner_photo_url,
        profilePicture: d.profile_photo_url,
        verificationStatus: d.verification_status,
        workExperience: d.work_experiences
      }

      console.log(lawyer.value)
    }
  } catch (e) {
    console.log('[Lawyers Details] loadLawyer error:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadLawyer()
})

watch(
  () => route.params.id,
  () => {
    loadLawyer()
  }
)

const handleResetPassword = async () => {
  isMutating.value = true
  try {
    const result = await resetLawyerPassword(id)
    if (result.success) {
      isResetConfirmOpen.value = false
      isResetSuccessOpen.value = true
    } else {
      const errorMessage = (result as any).validationMessages?.[0] || (result as any).error || 'Failed to reset password'
      errorModalTitle.value = 'Error'
      errorModalDescription.value = String(errorMessage)
      showErrorModal.value = true
    }
  } finally {
    isMutating.value = false
  }
}

const handleSuspend = async () => {
  if (!suspendReason.value.trim()) return

  isMutating.value = true
  try {
    const res = await suspendLawyer(id, suspendReason.value.trim())
    if (res?.success) {
      isSuspendDialogOpen.value = false
      suspendReason.value = ''
      isSuspended.value = true
      lawyer.value.status = 'Suspended'
      isSuspendSuccessOpen.value = true
    } else {
      const errorMessage = (res as any).validationMessages?.[0] || (res as any).error || 'Failed to suspend account'
      errorModalTitle.value = 'Error'
      errorModalDescription.value = String(errorMessage)
      showErrorModal.value = true
    }
  } finally {
    isMutating.value = false
  }
}

const handleReinstate = async () => {
  isMutating.value = true
  try {
    const res = await reinstateLawyer(id)
    if (res?.success) {
      isReinstateConfirmOpen.value = false
      isSuspended.value = false
      isReinstateSuccessOpen.value = true
    } else {
      const errorMessage = (res as any).validationMessages?.[0] || (res as any).error || 'Failed to reinstate account'
      errorModalTitle.value = 'Error'
      errorModalDescription.value = String(errorMessage)
      showErrorModal.value = true
    }
  } finally {
    isMutating.value = false
  }
}

const handleDelete = async () => {
  isMutating.value = true
  try {
    const res = await deleteLawyer(id)
    if (res?.success) {
      isDeleteConfirmOpen.value = false
      isDeleteSuccessOpen.value = true
      await new Promise(resolve => setTimeout(resolve, 800))
      router.push('/lawyers')
    } else {
      const errorMessage = (res as any).validationMessages?.[0] || (res as any).error || 'Failed to delete account'
      errorModalTitle.value = 'Error'
      errorModalDescription.value = String(errorMessage)
      showErrorModal.value = true
    }
  } finally {
    isMutating.value = false
  }
}

// --- Document actions ---
const isImageDoc = (type: string) => {
  const t = (type || '').toLowerCase()
  return t.includes('image') || t.includes('jpg') || t.includes('jpeg') || t.includes('png') || t.includes('gif') || t.includes('webp')
}

const getDocIcon = (type: string) => {
  const t = (type || '').toLowerCase()
  if (t.includes('pdf')) return 'pepicons-pencil:file'
  if (t.includes('image') || t.includes('jpg') || t.includes('png')) return 'i-lucide-image'
  if (t.includes('word') || t.includes('doc')) return 'pepicons-pencil:file'
  return 'pepicons-pencil:file'
}

const getDocIconColor = (name: string, uploaded: boolean) => {
  if (!uploaded) return 'text-gray-300'
  if (name.toLowerCase().includes('government') || name.toLowerCase().includes('id')) return 'text-indigo-500'
  return 'text-[#185FA5]'
}

const downloadDocument = (doc: { name: string, url: string }) => {
  if (!doc.url) return
  const personName = lawyer.value.name?.replace(/\s+/g, '_') || 'user'
  const fileName = `${personName}_${doc.name.replace(/\s+/g, '_')}`
  const link = window.document.createElement('a')
  link.href = doc.url
  link.download = fileName
  link.target = '_blank'
  window.document.body.appendChild(link)
  link.click()
  window.document.body.removeChild(link)
}

const openDocPreview = (doc: { title: string, type: string, url: string }) => {
  if (!doc.url) return
  previewDoc.value = { name: doc.title, type: doc.type, url: doc.url }
  showDocPreview.value = true
}

const openInNewTab = () => {
  if (previewDoc.value?.url) {
    window.open(previewDoc.value.url, '_blank')
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-12">
    <!-- Loading Skeleton -->
    <div
      v-if="isLoading"
      class="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      <div class="lg:col-span-8 space-y-6">
        <UCard
          class="overflow-hidden rounded-[24px] border-0 ring-0 shadow-sm"
          :ui="{ body: 'p-0' }"
        >
          <div class="h-48 w-full relative">
            <div class="absolute inset-0 bg-gray-100 animate-pulse" />
          </div>

          <div class="px-8 pb-8 -mt-12 relative">
            <div class="flex items-end gap-6 mb-6">
              <div class="size-32 rounded-full bg-gray-100 animate-pulse border-4 border-white shadow-md" />
              <div class="pb-2 w-full">
                <div class="flex items-center gap-2 mb-3">
                  <div class="h-7 w-44 rounded bg-gray-100 animate-pulse" />
                  <div class="h-5 w-5 rounded bg-gray-100 animate-pulse" />
                </div>
                <div class="h-8 w-36 rounded-full bg-gray-100 animate-pulse" />
              </div>
            </div>

            <div class="space-y-6">
              <div class="space-y-3">
                <div class="h-4 w-40 rounded bg-gray-100 animate-pulse" />
                <div class="h-5 w-full rounded bg-gray-100 animate-pulse" />
                <div class="h-5 w-10/12 rounded bg-gray-100 animate-pulse" />
              </div>

              <div class="space-y-3">
                <div class="h-4 w-52 rounded bg-gray-100 animate-pulse" />
                <div class="flex flex-wrap gap-2">
                  <div class="h-9 w-28 rounded-full bg-gray-100 animate-pulse" />
                  <div class="h-9 w-28 rounded-full bg-gray-100 animate-pulse" />
                  <div class="h-9 w-32 rounded-full bg-gray-100 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard class="rounded-[24px] border-0 ring-0 shadow-sm">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="h-4 w-40 rounded bg-gray-100 animate-pulse" />
              <div class="h-4 w-36 rounded bg-gray-100 animate-pulse" />
            </div>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="n in 3"
              :key="n"
              class="border border-gray-100 rounded-2xl p-4 flex flex-col gap-4"
            >
              <div class="h-24 w-full rounded-xl bg-gray-100 animate-pulse" />
              <div class="space-y-3">
                <div class="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                <div class="h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
                <div class="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>
        </UCard>

        <UCard class="rounded-[24px] border-0 ring-0 shadow-sm">
          <template #header>
            <div class="h-4 w-32 rounded bg-gray-100 animate-pulse" />
          </template>
          <div class="divide-y divide-gray-50">
            <div
              v-for="n in 2"
              :key="n"
              class="py-6 first:pt-0 last:pb-0"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="h-4 w-44 rounded bg-gray-100 animate-pulse" />
                <div class="h-3 w-20 rounded bg-gray-100 animate-pulse" />
              </div>
              <div class="flex items-center gap-0.5 mb-3">
                <div
                  v-for="i in 5"
                  :key="i"
                  class="h-4 w-4 rounded bg-gray-100 animate-pulse"
                />
              </div>
              <div class="space-y-2">
                <div class="h-4 w-full rounded bg-gray-100 animate-pulse" />
                <div class="h-4 w-11/12 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>
        </UCard>

        <UCard class="rounded-[24px] border-0 ring-0 shadow-sm">
          <template #header>
            <div class="h-4 w-32 rounded bg-gray-100 animate-pulse" />
          </template>
          <div class="space-y-8">
            <div
              v-for="n in 2"
              :key="n"
              class="relative pl-6 border-l-2 border-gray-100"
            >
              <div class="absolute left-[-9px] top-0 size-4 rounded-full border-2 border-gray-100 bg-white" />
              <div class="flex items-center justify-between mb-2">
                <div class="h-5 w-44 rounded bg-gray-100 animate-pulse" />
                <div class="h-3 w-20 rounded bg-gray-100 animate-pulse" />
              </div>
              <div class="h-4 w-56 rounded bg-gray-100 animate-pulse" />
              <div class="h-4 w-full rounded bg-gray-100 animate-pulse" />
              <div class="h-4 w-10/12 rounded bg-gray-100 animate-pulse mt-2" />
            </div>
          </div>
        </UCard>
      </div>

      <div class="lg:col-span-4 space-y-6">
        <UCard class="rounded-[24px] border-0 ring-0 shadow-sm p-2">
          <div class="space-y-6">
            <section>
              <div class="h-4 w-24 rounded bg-gray-100 animate-pulse mb-4" />
              <div class="space-y-4">
                <div
                  v-for="n in 7"
                  :key="n"
                  class="flex items-center justify-between"
                >
                  <div class="h-4 w-28 rounded bg-gray-100 animate-pulse" />
                  <div class="h-4 w-32 rounded bg-gray-100 animate-pulse" />
                </div>

                <div class="flex items-center justify-between">
                  <div class="h-4 w-44 rounded bg-gray-100 animate-pulse" />
                  <div class="flex gap-2">
                    <div class="h-8 w-20 rounded-full bg-gray-100 animate-pulse" />
                    <div class="h-8 w-20 rounded-full bg-gray-100 animate-pulse" />
                  </div>
                </div>
              </div>
            </section>

            <section class="pt-6 space-y-3">
              <div class="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
              <div class="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
              <div class="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
            </section>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Real Content -->
    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      <div class="lg:col-span-8 space-y-6">
        <UCard
          class="overflow-hidden rounded-[16px] border-0 ring-0 shadow-none"
          :ui="{ body: 'p-0!' }"
        >
          <div class="h-48 w-full relative">
            <img
              :src="lawyer.banner || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop'"
              class="w-full h-full object-cover"
              alt="Banner"
            >
            <div class="absolute inset-0 bg-black/20" />
          </div>

          <div class="px-2 md:px-8 pb-8 -mt-2 md:-mt-12 relative">
            <div class="flex items-end gap-6 mb-6">
              <UAvatar
                :src="lawyer.profilePicture || 'https://i.pravatar.cc/150?u=1'"
                size="3xl"
                class="size-20 md:size-32 rounded-full border-4 border-white shadow-md"
              />
              <div class="pb-2">
                <div class="flex items-center gap-2 mb-1">
                  <h1 class="text-md lg:text-2xl font-bold text-gray-900">
                    {{ lawyer.name }}
                  </h1>
                  <img
                    v-if="lawyer.verificationStatus == 'approved'"
                    src="/images/icons/verified-badge.png"
                    alt="Verified"
                    class="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] md:w-[22px] md:h-[22px] ml-2 inline-block"
                  >
                </div>
                <UBadge
                  color="success"
                  variant="subtle"
                  class="rounded-full px-3 py-1 text-xs font-medium"
                >
                  {{ lawyer.isAvailable ? 'Active' : 'Inactive' }}
                </UBadge>
              </div>
            </div>

            <div class="space-y-6">
              <div v-if="lawyer.bio">
                <h3 class="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">
                  Lawyer Bio
                </h3>
                <p class="text-gray-600 text-[14px] leading-relaxed">
                  {{ lawyer.bio }}
                </p>
              </div>

              <div v-if="lawyer.practiceAreas?.length">
                <h3 class="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                  Practice Areas
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="area in lawyer.practiceAreas"
                    :key="area"
                    class="px-4 py-2 bg-gray-50 text-gray-600 text-[13px] rounded-full border border-gray-100"
                  >
                    {{ area }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard
          v-if="lawyer.documents?.length"
          class="rounded-[24px] border-0 ring-0 shadow-sm"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Documents
              </h3>
              <button class="text-[#003357] text-[13px] font-bold flex items-center gap-1 hover:underline">
                Download all <UIcon
                  name="i-lucide-download"
                  class="size-4"
                />
              </button>
            </div>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="doc in lawyer.documents"
              :key="doc.title"
              class="border border-gray-100 rounded-2xl p-4 flex flex-col gap-4 group cursor-pointer hover:border-gray-200 transition-colors"
              @click="openDocPreview(doc)"
            >
              <div
                class="h-24 w-full flex items-center justify-center rounded-xl"
                :class="[
                  doc.color === 'blue' ? 'bg-blue-50'
                  : doc.color === 'purple' ? 'bg-purple-50' : 'bg-gray-50'
                ]"
              >
                <UIcon
                  :name="doc.icon"
                  class="size-10"
                  :class="[
                    doc.color === 'blue' ? 'text-blue-500'
                    : doc.color === 'purple' ? 'text-purple-500' : 'text-gray-300'
                  ]"
                />
              </div>

              <div>
                <h4 class="text-[13px] font-bold text-gray-900 mb-0.5">
                  {{ doc.title }}
                </h4>
                <div class="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                  <span>{{ doc.type }}</span>
                  <span v-if="doc.size !== '-'">• {{ doc.size }}</span>
                </div>

                <div class="flex items-center gap-1">
                  <UIcon
                    :name="doc.isMissing ? 'i-lucide-alert-circle' : 'i-lucide-check'"
                    class="size-3"
                    :class="doc.isMissing ? 'text-red-500' : 'text-green-500'"
                  />
                  <span
                    class="text-[11px] font-medium italic"
                    :class="doc.isMissing ? 'text-red-500' : 'text-green-500'"
                  >
                    {{ doc.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Experience -->
        <section class="bg-white rounded-[16px] border-0 ring-0 p-4 sm:p-[24px]">
          <h2 class="text-[17px] font-bold text-gray-900 mb-8">
            Experience
          </h2>

          <div
            v-if="lawyer.workExperience && lawyer.workExperience.length > 0"
            class="space-y-[24px]"
          >
            <div
              v-for="(work, index) in lawyer.workExperience"
              :key="index"
              class="relative pl-[24px] pt-1 border-l-2 border-primary pb-[24px]"
            >
              <div class="flex flex-col md:flex-row md:justify-between mb-2 md:items-center">
                <div class="w-full">
                  <div class="flex items-center justify-between gap-2 w-full mb-1">
                    <p class="text-[14px] text-gray-500 font-medium">
                      {{ work.company }}
                    </p>
                    <p class="text-[12px] text-gray-500 font-medium mt-1 md:mt-0">{{ work.start_year }} - {{ work.end_year }}</p>
                  </div>
                  <p class="text-[14px] text-gray-500 font-medium">
                    {{ work.job_title }}
                  </p>
                </div>
              </div>
              <p class="text-[15px] text-gray-600 font-medium mt-1 line-clamp-3">
                {{ work.description }}
              </p>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <UIcon
                name="i-lucide-briefcase"
                class="w-8 h-8 text-primary opacity-60"
              />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              No experience listed yet
            </h3>
            <p class="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
              This legal professional hasn't updated their work history details yet.
            </p>
          </div>
        </section>

        <UCard
          v-if="lawyer.reviews?.length"
          class="rounded-[16px] border-0 ring-0"
        >
          <template #header>
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Reviews
            </h3>
          </template>

          <div class="divide-y divide-gray-50">
            <div
              v-for="(review, index) in lawyer.reviews"
              :key="index"
              class="py-4 border-b border-[#E8E8E8] first:pt-0 last:pb-0"
            >
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-[16px] font-medium text-gray-900">
                  {{ review.client.full_name }}
                </h4>
                <span class="text-xs text-gray-400">{{ formatRelativeDate(review.created_at) }}</span>
              </div>

              <div class="flex items-center gap-0.5 mb-1">
                <UIcon
                  v-for="i in 5"
                  :key="i"
                  :name="(review.rating ?? 0) ? 'tabler:star-filled' : 'tabler:star-outline'"
                  class="size-4"
                  :class="i <= (review.rating ?? 0) ? 'text-orange-400 fill-orange-400' : 'text-gray-200'"
                />
              </div>

              <p class="text-[13px] text-gray-600 leading-relaxed">
                {{ review.comment }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <div class="lg:col-span-4 space-y-6">
        <UCard class="rounded-[16px] border-0 ring-0 shadow-sm p-2">
          <div class="space-y-6">
            <section>
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                About
              </h3>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">User ID</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.id }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Location</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.location }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Phone number</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.phone }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Email</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.email }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Rating</span>
                  <div class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-star"
                      class="size-4 text-orange-400 fill-orange-400"
                    />
                    <span class="text-[13px] font-bold text-gray-900">{{ lawyer.rating }}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Experience</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.experience }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Languages spoken</span>
                  <div class="flex gap-2">
                    <span
                      v-for="lang in lawyer.languages"
                      :key="lang"
                      class="px-3 py-1 bg-gray-50 text-[12px] font-medium text-gray-600 rounded-full border border-gray-100"
                    >
                      {{ lang }}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section class="pt-6 space-y-3">
              <!-- <UButton
                block
                color="neutral"
                class="bg-[#003357] hover:bg-[#002244] text-white font-bold rounded-xl py-3"
                :disabled="isMutating"
                @click="isResetConfirmOpen = true"
              >
                Reset password
              </UButton> -->

              <UButton
                v-if="lawyer.verificationStatus != 'suspended'"
                block
                variant="outline"
                color="neutral"
                class="bg-white text-gray-900 border-gray-200 font-bold rounded-xl py-3 hover:bg-gray-50"
                :disabled="isMutating"
                @click="() => { suspendReason = suspendReasons[0] ?? 'Abuse / misconduct'; isSuspendDialogOpen = true }"
              >
                Suspend account
              </UButton>

              <UButton
                v-else
                block
                variant="outline"
                color="neutral"
                class="bg-white text-gray-900 border-gray-200 font-bold rounded-xl py-3 hover:bg-gray-50"
                :disabled="isMutating"
                @click="isReinstateConfirmOpen = true"
              >
                Reinstate account
              </UButton>

              <UButton
                block
                variant="outline"
                color="error"
                class="border-red-200 text-red-500 font-bold rounded-xl py-3 hover:bg-red-50"
                :disabled="isMutating"
                @click="isDeleteConfirmOpen = true"
              >
                Delete account
              </UButton>
            </section>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Modals -->
    <SharedResetPasswordModal
      v-model="isResetConfirmOpen"
      :email="lawyer.email || ''"
      @confirm="handleResetPassword"
    />

    <SharedConfirmationModal
      v-model="isSuspendDialogOpen"
      title="Suspend Account"
      :description="`Temporarily disable ${lawyer.name}'s access to the platform. You can reinstate the account anytime.`"
      icon="i-lucide-flag"
      confirm-text="Suspend"
      cancel-text="Cancel"
      confirm-color="danger"
      :loading="isMutating"
      :confirm-disabled="!suspendReason.trim()"
      @confirm="handleSuspend"
    >
      <label class="text-[13px] font-semibold text-gray-600 mb-2 block">State reason</label>
      <USelect
        v-model="suspendReason"
        :items="suspendReasons"
        class="w-full"
        :content="{ class: 'z-[999999]! important', strategy: 'fixed' }"
      />
    </SharedConfirmationModal>

    <SharedConfirmationModal
      v-model="isReinstateConfirmOpen"
      title="Reinstate account"
      :description="`Restore ${lawyer.name}'s access to the platform.`"
      icon="i-lucide-user-check"
      confirm-text="Reinstate"
      cancel-text="Cancel"
      :loading="isMutating"
      @confirm="handleReinstate"
    />

    <SharedSuccessModal
      v-model="isResetSuccessOpen"
      title="Password reset link sent successfully"
      :description="`Password reset link has been sent to ${lawyer.email || 'the user'}. The user must click the link to reset their password.`"
      button-text="Complete"
      :show-close="false"
      @complete="isResetSuccessOpen = false"
    />

    <SharedSuccessModal
      v-model="isSuspendSuccessOpen"
      title="Account suspended successfully"
      description="Suspended users cannot log in or interact with the platform. You can reinstate them later."
      secondary-button-text="Reinstate"
      button-text="Complete"
      @secondary="() => { isSuspendSuccessOpen = false; isReinstateConfirmOpen = true }"
      @complete="isSuspendSuccessOpen = false"
    />

    <SharedSuccessModal
      v-model="isReinstateSuccessOpen"
      title="Account reinstated successfully"
      description="The lawyer account is now active again."
      button-text="Complete"
      :show-close="false"
      @complete="isReinstateSuccessOpen = false"
    />

    <SharedConfirmationModal
      v-model="isDeleteConfirmOpen"
      title="Delete User Account"
      description="This action is permanent and cannot be undone."
      icon="i-lucide-trash-2"
      icon-class="bg-red-50"
      confirm-text="Delete Account"
      cancel-text="Cancel"
      confirm-color="danger"
      :loading="isMutating"
      :confirm-disabled="!deleteConfirmed"
      @confirm="handleDelete"
    >
      <label class="text-[13px] font-semibold text-gray-600 mb-2 block">State reason</label>
      <USelect
        v-model="deleteReason"
        :items="deleteReasons"
        class="w-full mb-4"
        :portal="true"
        :ui="{ content: 'z-[9999]' }"
      />
      <label class="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
        <UCheckbox v-model="deleteConfirmed" />
        I understand this action cannot be reversed
      </label>
    </SharedConfirmationModal>

    <!-- Error Modal -->
    <ErrorModal
      v-model="showErrorModal"
      :title="errorModalTitle"
      :description="errorModalDescription"
      button-text="Dismiss"
    />

    <SharedSuccessModal
      v-model="isDeleteSuccessOpen"
      title="User account deleted successfully"
      description="Account permanently deleted, and cannot be restored"
      button-text="Complete"
      :show-close="false"
      @complete="isDeleteSuccessOpen = false"
    />

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
              :class="getDocIconColor(previewDoc.url, true)"
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
  </div>
</template>
