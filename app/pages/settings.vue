<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { z } from 'zod'

definePageMeta({ middleware: 'auth' })

const activeTab = ref('Security')
const activeContentTab = ref('Featured lawyers')
const showContentMenu = ref(false)
const toast = useToast()

const {
  loading: bannersLoading,
  updating: bannersUpdating,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners
} = useBanner()

const {
  loading: _featuredLoading,

  updating: featuredUpdating,
  getFeaturedLawyers,
  updateFeaturedLawyers,
  searchFeaturedLawyers
} = useFeatured()

const { getWebAds } = useWebAd()

const featuredSearchQ = ref('')
let featuredSearchLimit = 6
const selectedFeaturedIds = ref<number[]>([])
const infoModalOpen = ref(false)
const infoModalMessage = ref('')
const maxFeatured = 6

type FeaturedSearchResult = FeaturedLawyer & {
  avatarUrl?: string
  practiceArea?: string
}

const featuredSearchResults = ref<FeaturedSearchResult[]>([])
const featuredDropdownOpen = ref(false)

const featuredWrapperRef = ref<HTMLElement | null>(null)




type FeaturedLawyer = {
  id: number
  name: string
  practice: string
  location: string
}

const featuredLawyers = ref<FeaturedLawyer[]>([])

const tabs = [
  { id: 'General', label: 'General', icon: 'i-lucide-settings' },
  { id: 'Security', label: 'Security', icon: 'i-lucide-shield-check' },
  { id: 'Admin accounts', label: 'Admin accounts', icon: 'i-lucide-user' },
  { id: 'Content Management', label: 'Content Management', icon: 'i-lucide-layout' }
]

const contentTabs = ['App banners', 'Featured lawyers', 'Website Ads']

const handleTabClick = (tabId: string) => {
  if (tabId === 'Content Management') {
    activeTab.value = tabId
    showContentMenu.value = true
  } else {
    activeTab.value = tabId
    showContentMenu.value = false
  }
}

const handleBackToSettings = () => {
  showContentMenu.value = false
  activeTab.value = 'General'
}

const normalizeFeaturedLawyer = (lawyer: any): FeaturedLawyer => ({
  id: Number(lawyer?.id),
  name: lawyer?.name || lawyer?.full_name || lawyer?.fullName || '',
  practice: lawyer?.practice || lawyer?.practice_area || lawyer?.practiceArea || '',
  location: lawyer?.location || lawyer?.city || lawyer?.state || ''
})

const loadFeatured = async () => {
  const result = await getFeaturedLawyers()
  console.log('[Featured lawyers] API response:', result)

  if (!result?.success) {
    toast.add({
      title: 'Could not load featured lawyers',
      description: (result as any)?.error?.data?.message || 'Please try again.',
      color: 'error'
    })
    return
  }

  // Observed response shape:
  // {
  //   status,
  //   message,
  //   data: {
  //     success,
  //     message,
  //     data: { max, featured: [] }
  //   }
  // }
  const outerData = (result as any)?.data
  const innerData = outerData?.data?.data ?? outerData?.data ?? outerData

  const featuredList: any[] = Array.isArray(innerData?.featured)
    ? innerData.featured
    : []

  // When "featured" returns only featured lawyers, treat all returned as selected.
  const normalized = featuredList.map(normalizeFeaturedLawyer).filter(l => Number.isFinite(l.id))
  featuredLawyers.value = normalized
  selectedFeaturedIds.value = normalized.map(l => l.id)

  // Keep the UI constraint aligned with backend max (default 6).
  const maxFromApi = Number(innerData?.max)
  if (Number.isFinite(maxFromApi)) {
    featuredSearchLimit = maxFromApi
  }
}

const loadFeaturedSearch = async () => {

  if (!featuredSearchQ.value?.trim()) {
    featuredSearchResults.value = []
    featuredDropdownOpen.value = false
    return
  }

  // reopen dropdown after user types/searches again
  featuredDropdownOpen.value = true

  const result = await searchFeaturedLawyers({
    q: featuredSearchQ.value,
    limit: featuredSearchLimit
  })

  if (!result?.success) {
    toast.add({
      title: 'Could not search featured lawyers',
      description: (result as any)?.error?.data?.message || 'Please try again.',
      color: 'error'
    })
    featuredSearchResults.value = []
    featuredDropdownOpen.value = false
    return
  }

  const outerData = (result as any)?.data
  const innerData = outerData?.data?.data ?? outerData?.data ?? outerData

  const featuredList: any[] = Array.isArray(innerData?.featured)
    ? innerData.featured
    : Array.isArray(innerData?.data?.featured)
      ? innerData.data.featured
      : Array.isArray(innerData?.lawyers)
        ? innerData.lawyers
        : []

  featuredSearchResults.value = featuredList
    .map((x: any) => {
      const normalized = normalizeFeaturedLawyer(x)
      return {
        ...normalized,
        avatarUrl: x?.profile_photo_url || x?.avatar || x?.image || x?.photo_url || '',
        practiceArea: x?.practice || x?.practice_area || x?.practiceArea || normalized.practice
      }
    })
    .filter(l => Number.isFinite(l.id))

  featuredDropdownOpen.value = featuredSearchResults.value.length > 0
}

const showInfoModal = (message: string) => {
  infoModalMessage.value = message
  infoModalOpen.value = true
}

const toggleFeaturedSelection = async (lawyerId: number, nextSelected: boolean) => {
  if (featuredUpdating.value) return

  // close dropdown after toggling; it will reopen only after new search input
  featuredDropdownOpen.value = false

  const alreadySelected = selectedFeaturedIds.value.includes(lawyerId)

  if (nextSelected && !alreadySelected && selectedFeaturedIds.value.length >= maxFeatured) {
    showInfoModal(`You cannot select more than ${maxFeatured} featured lawyers and return.`)
    return
  }

  const nextIds = nextSelected
    ? Array.from(new Set([...selectedFeaturedIds.value, lawyerId]))
    : selectedFeaturedIds.value.filter(id => id !== lawyerId)

  const formData = new FormData()
  nextIds.forEach(id => formData.append('lawyer_ids[]', String(id)))

  const result = await updateFeaturedLawyers(formData)
  if (!result?.success) {
    toast.add({
      title: 'Update failed',
      description: (result as any)?.error?.data?.message || 'Please try again.',
      color: 'error'
    })
    return
  }

  selectedFeaturedIds.value = nextIds

  // Refresh selected list after successful update so the grid stays accurate.
  await loadFeatured()
}

const loadWebsiteAdsAndLog = async () => {
  const result = await getWebAds()
  console.log('[Website Ads] API response:', result)
}

watch(
  () => activeContentTab.value,
  async (tab) => {
    if (tab === 'Featured lawyers') await loadFeatured()
    if (tab === 'Website Ads') await loadWebsiteAdsAndLog()
  },
  { immediate: true }
)

type BannerStatus = 'active' | 'inactive'

type AppBanner = {
  id: number
  title: string
  subtitle: string
  link: string
  status: BannerStatus
  image?: string
}

const bannerSchema = z.object({
  image: z.instanceof(File).optional(),
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  link: z.string().trim().optional(),
  status: z.enum(['active', 'inactive'])
})

const appBanners = ref<AppBanner[]>([])
const isBannerModalOpen = ref(false)
const editingBanner = ref<AppBanner | null>(null)
const bannerForm = reactive<{
  image: File | null
  title: string
  subtitle: string
  link: string
  status: BannerStatus
}>({
  image: null,
  title: '',
  subtitle: '',
  link: '',
  status: 'active'
})
const bannerFileInputKey = ref(0)
const bannerFormError = ref('')
const draggingBannerIndex = ref<number | null>(null)

const activeBannerCount = computed(() => appBanners.value.filter(banner => banner.status === 'active').length)
const bannerModalTitle = computed(() => editingBanner.value ? 'Edit banner' : 'Add banner')
const bannerStatusOptions = ['active', 'inactive']

const responseSucceeded = (result: any) => {
  const status = Number(result?.data?.status ?? result?.data?.data?.status ?? 200)
  return Boolean(result?.success) && status >= 200 && status < 400
}

const responseMessage = (result: any, fallback: string) => {
  return (result?.data as { message?: string } | undefined)?.message || fallback
}

const extractBannerList = (response: any): any[] => {
  const payload = response?.data?.data?.data ?? response?.data?.data ?? response?.data ?? response
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.banners)) return payload.banners
  return []
}

const normalizeBannerStatus = (status: unknown): BannerStatus => {
  if (status === true || status === 1 || String(status).toLowerCase() === 'active' || String(status).toLowerCase() === 'live') {
    return 'active'
  }

  return 'inactive'
}

const normalizeBanner = (banner: any): AppBanner => ({
  id: Number(banner.id),
  title: banner.title || '',
  subtitle: banner.subtitle || '',
  link: banner.link || '',
  status: normalizeBannerStatus(banner.status ?? banner.is_active),
  image: banner.image || banner.image_url || banner.banner_image || banner.photo_url || ''
})

const fetchAppBanners = async () => {
  const result = await getBanners()
  console.log('[App banners] API response:', result)

  if (responseSucceeded(result)) {
    appBanners.value = extractBannerList(result).map(normalizeBanner).filter(banner => Number.isFinite(banner.id))
  } else {
    toast.add({
      title: 'Could not load banners',
      description: result?.data?.message || 'Please try again.',
      color: 'error'
    })
  }
}

onMounted(fetchAppBanners)

// Click-outside: hide the dropdown when user clicks outside search area
onMounted(() => {
  if (!featuredWrapperRef.value) return

  const handler = (e: MouseEvent) => {
    if (!featuredDropdownOpen.value) return

    const el = featuredWrapperRef.value
    const target = e.target as Node | null
    if (!el || !target) return

    if (!el.contains(target)) {
      featuredDropdownOpen.value = false
    }
  }

  document.addEventListener('mousedown', handler)
  return () => document.removeEventListener('mousedown', handler)
})




const resetBannerForm = () => {
  bannerForm.image = null
  bannerForm.title = ''
  bannerForm.subtitle = ''
  bannerForm.link = ''
  bannerForm.status = 'active'
  bannerFormError.value = ''
  bannerFileInputKey.value++
}

const openCreateBannerModal = () => {
  editingBanner.value = null
  resetBannerForm()
  isBannerModalOpen.value = true
}

const openEditBannerModal = (banner: AppBanner) => {
  editingBanner.value = banner
  bannerForm.image = null
  bannerForm.title = banner.title
  bannerForm.subtitle = banner.subtitle
  bannerForm.link = banner.link
  bannerForm.status = banner.status
  bannerFormError.value = ''
  bannerFileInputKey.value++
  isBannerModalOpen.value = true
}

const closeBannerModal = () => {
  isBannerModalOpen.value = false
  editingBanner.value = null
  resetBannerForm()
}

const handleBannerImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  bannerForm.image = input.files?.[0] || null
}

const buildBannerFormData = () => {
  const formData = new FormData()
  if (bannerForm.image) formData.append('image', bannerForm.image)
  formData.append('title', bannerForm.title.trim())
  formData.append('subtitle', bannerForm.subtitle.trim())
  formData.append('link', bannerForm.link.trim())
  formData.append('status', bannerForm.status)
  return formData
}

const submitBannerForm = async () => {
  const parsed = bannerSchema.safeParse({
    image: bannerForm.image || undefined,
    title: bannerForm.title,
    subtitle: bannerForm.subtitle,
    link: bannerForm.link,
    status: bannerForm.status
  })

  if (!parsed.success) {
    bannerFormError.value = parsed.error.issues[0]?.message || 'Please check the banner details.'
    return
  }

  if (!editingBanner.value && !bannerForm.image) {
    bannerFormError.value = 'Banner image is required.'
    return
  }

  bannerFormError.value = ''
  const result = editingBanner.value
    ? await updateBanner(editingBanner.value.id, buildBannerFormData())
    : await createBanner(buildBannerFormData())

  if (!responseSucceeded(result)) {
    bannerFormError.value = responseMessage(result, `Failed to ${editingBanner.value ? 'update' : 'create'} banner.`)
    return
  }

  toast.add({
    title: editingBanner.value ? 'Banner updated' : 'Banner created',
    color: 'success'
  })
  closeBannerModal()
  await fetchAppBanners()
}

const buildReorderFormData = () => {
  const formData = new FormData()
  appBanners.value.forEach((banner) => {
    formData.append('banner_ids[]', String(banner.id))
  })
  return formData
}

const persistBannerOrder = async (previousOrder: AppBanner[]) => {
  const result = await reorderBanners(buildReorderFormData())

  if (!responseSucceeded(result)) {
    appBanners.value = previousOrder
    toast.add({
      title: 'Reorder failed',
      description: responseMessage(result, 'The previous banner order was restored.'),
      color: 'error'
    })
    return
  }

  console.log('[App banners] reordered ids:', appBanners.value.map(banner => banner.id))
}

const moveBanner = async (fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex || toIndex < 0 || toIndex >= appBanners.value.length || bannersUpdating.value) return

  const previousOrder = [...appBanners.value]
  const nextOrder = [...appBanners.value]
  const [movedBanner] = nextOrder.splice(fromIndex, 1)
  if (!movedBanner) return

  nextOrder.splice(toIndex, 0, movedBanner)
  appBanners.value = nextOrder
  await persistBannerOrder(previousOrder)
}

const handleBannerDrop = async (toIndex: number) => {
  if (draggingBannerIndex.value === null) return
  const fromIndex = draggingBannerIndex.value
  draggingBannerIndex.value = null
  await moveBanner(fromIndex, toIndex)
}

const removeBanner = async (banner: AppBanner) => {
  const previousBanners = [...appBanners.value]
  appBanners.value = appBanners.value.filter(item => item.id !== banner.id)

  const result = await deleteBanner(banner.id)
  if (!responseSucceeded(result)) {
    appBanners.value = previousBanners
    toast.add({
      title: 'Delete failed',
      description: responseMessage(result, 'The banner was restored.'),
      color: 'error'
    })
    return
  }

  toast.add({
    title: 'Banner removed',
    color: 'success'
  })
}

const adminAccounts = [
  { name: 'Super Admin', email: 'admin@lawyersclient.ng', role: 'Super Admin', color: 'primary' as const },
  { name: 'Ops Admin', email: 'ops@lawyersclients.ng', role: 'Operations', color: 'primary' as const },
  { name: 'Support Admin', email: 'support@lawyersclient.ng', role: 'Support', color: 'success' as const }
]

const permissions = [
  { title: 'Operations Admin — suspend users', description: 'Allow Ops Admin to suspend and activate accounts' },
  { title: 'Operations Admin — approve lawyers', description: 'Allow Ops Admin to verify and approve lawyer applications' },
  { title: 'Support Admin — view chat logs', description: 'Limited to flagged conversations only' },
  { title: 'Support Admin — send notifications', description: 'Allow Support Admin to broadcast messages' }
]

const enable2FA = ref(false)
const sessionTimeout = ref('30 minutes')
</script>

<template>
  <div class="space-y-8 max-w-7xl">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 leading-tight">
          {{ activeTab === 'Content Management' ? 'Content Management' : 'System Settings' }}
        </h1>
        <p class="text-sm text-gray-500">
          {{ activeTab === 'Content Management' ? 'Manage public facing pages, FAQs, and blog posts' : 'Platform configuration • Super Admin only' }}
        </p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Sidebar Settings menu -->
      <UCard
        class="lg:w-72 shrink-0 border border-gray-100"
        :ui="{
          body: 'p-0 sm:p-0',
          root: 'overflow-hidden'
        }"
      >
        <div class="relative overflow-hidden">
          <!-- Sliding container -->
          <div
            class="flex transition-transform duration-300 ease-in-out"
            :class="showContentMenu ? '-translate-x-full' : 'translate-x-0'"
          >
            <!-- Main Settings Menu -->
            <div class="w-full shrink-0">
              <div class="flex flex-col py-4">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  class="flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors relative"
                  :class="activeTab === tab.id ? 'bg-[#EFF6FF] text-[#003357]' : 'text-gray-600 hover:bg-gray-50'"
                  @click="handleTabClick(tab.id)"
                >
                  <div
                    v-if="activeTab === tab.id"
                    class="absolute left-0 top-0 bottom-0 w-1 bg-[#003357]"
                  />
                  <UIcon
                    :name="tab.icon"
                    class="w-5 h-5"
                    :class="activeTab === tab.id ? 'text-[#003357]' : 'text-gray-400'"
                  />
                  {{ tab.label }}
                </button>

                <div class="px-6 py-4 mt-2 border-t border-gray-100">
                  <button class="flex items-center gap-3 text-sm font-medium text-red-500 hover:text-red-700 transition-colors">
                    <UIcon
                      name="i-lucide-log-out"
                      class="w-5 h-5"
                    />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <!-- Content Management Sub-Menu -->
            <div class="w-full shrink-0">
              <div class="flex flex-col py-4">
                <button
                  class="flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  @click="handleBackToSettings"
                >
                  <UIcon
                    name="i-lucide-arrow-left"
                    class="w-5 h-5"
                  />
                  Back
                </button>

                <div class="px-6 py-3">
                  <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Content Management
                  </p>
                </div>

                <button
                  v-for="ctab in contentTabs"
                  :key="ctab"
                  class="w-full text-left px-6 py-3 text-sm font-medium transition-colors relative"
                  :class="activeContentTab === ctab ? 'bg-[#EFF6FF] text-[#003357]' : 'text-gray-600 hover:bg-gray-50'"
                  @click="activeContentTab = ctab"
                >
                  <div
                    v-if="activeContentTab === ctab"
                    class="absolute left-0 top-0 bottom-0 w-1 bg-[#003357]"
                  />
                  {{ ctab }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Content Area -->
      <div class="flex-1 min-w-0">
        <!-- Content Management Section -->
        <div
          v-if="activeTab === 'Content Management'"
          class="h-full"
        >
          <!-- Sub-Content Area -->
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden min-h-[600px]">
            <!-- Featured Lawyers -->
            <div
              v-if="activeContentTab === 'Featured lawyers'"
              class="p-6 md:p-8 space-y-6"
            >
              <div>
                <h2 class="text-lg font-bold text-gray-900">
                  Featured lawyers
                </h2>
                <p class="text-sm text-gray-400">
                  Shown on the app home screen and landing page · max 6 featured
                </p>
              </div>

              <div class="relative max-w-xl">
                <div class="flex items-center gap-3">
                  <UInput
                    v-model="featuredSearchQ"
                    icon="i-lucide-search"
                    placeholder="Search lawyers by name or practice"
                    class="flex-1"
                    size="lg"
                    :ui="{ base: 'rounded-lg' }"
                    @keydown.enter="loadFeaturedSearch"
                  />
                  <UButton
                    color="primary"
                    class="bg-[#003357] px-6"
                    size="lg"
                    @click="loadFeaturedSearch"
                  >
                    Search
                  </UButton>
                </div>

                <div
                  v-if="featuredDropdownOpen"
                  class="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  <div class="px-3 py-2 text-xs font-bold text-gray-400 border-b border-gray-100">
                    Select up to {{ maxFeatured }}
                  </div>

                  <div class="max-h-64 overflow-auto">
                    <button
                      v-for="l in featuredSearchResults"
                      :key="l.id"
                      type="button"
                      class="w-full text-left px-3 py-3 hover:bg-gray-50 flex items-center justify-between gap-3"
                      @click.prevent="toggleFeaturedSelection(l.id, !selectedFeaturedIds.includes(l.id))"
                    >
                      <div class="flex items-center gap-3 min-w-0">
                        <UAvatar
                          size="md"
                          :src="l.avatarUrl"
                          class="bg-gray-100"
                        />
                        <div class="min-w-0">
                          <div class="font-bold text-gray-900 text-sm truncate">
                            {{ l.name }}
                          </div>
                          <div class="text-[11px] text-gray-400 truncate">
                            {{ l.practiceArea }} · {{ l.location }}
                          </div>
                        </div>
                      </div>

                      <div class="shrink-0">
                        <UCheckbox
                          :model-value="selectedFeaturedIds.includes(l.id)"
                          color="primary"
                          class="rounded-lg"
                        />
                      </div>
                    </button>
                  </div>

                  <div
                    v-if="featuredSearchResults.length === 0"
                    class="px-3 py-4 text-sm text-gray-500"
                  >
                    No results
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
                <div
                  v-for="lawyer in featuredLawyers"
                  :key="lawyer.id"
                  class="p-4 border rounded-xl flex items-center justify-between transition-all"
                  :class="selectedFeaturedIds.includes(lawyer.id) ? 'border-[#3B82F6] bg-blue-50/30' : 'border-gray-100 hover:border-gray-200'"
                >
                  <div class="flex items-center gap-3">
                    <UAvatar
                      size="md"
                      class="bg-gray-100"
                    />
                    <div>
                      <h4 class="font-bold text-gray-900 text-sm leading-tight">
                        {{ lawyer.name }}
                      </h4>
                      <p class="text-[11px] text-gray-400">
                        {{ lawyer.practice }} · {{ lawyer.location }}
                      </p>
                    </div>
                  </div>

                  <UCheckbox
                    :model-value="selectedFeaturedIds.includes(lawyer.id)"
                    color="primary"
                    class="rounded-lg"
                    @update:model-value="(val) => toggleFeaturedSelection(lawyer.id, val)"
                  />
                </div>
              </div>
            </div>

            <!-- Website Ads -->
            <div
              v-if="activeContentTab === 'Website Ads'"
              class="p-6 md:p-8 space-y-8"
            >
              <div class="flex items-center justify-between border-b pb-6 border-gray-100">
                <h2 class="text-lg font-bold text-gray-900">
                  LawTech Nigeria - homepage banner
                </h2>
                <div class="flex items-center gap-2">
                  <UButton
                    color="neutral"
                    variant="solid"
                    class="border border-gray-200 text-gray-600"
                  >
                    Save draft
                  </UButton>
                  <UButton
                    color="neutral"
                    variant="solid"
                    class="border border-orange-200 text-orange-500"
                  >
                    Pause
                  </UButton>
                  <UButton
                    color="primary"
                    class="bg-blue-600"
                  >
                    Publish
                  </UButton>
                  <UButton
                    color="error"
                    variant="subtle"
                    class="bg-red-50 text-red-500"
                  >
                    Delete
                  </UButton>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div class="lg:col-span-8 space-y-8">
                  <div class="space-y-4">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Ad Type
                    </p>
                    <div class="flex gap-2">
                      <UButton
                        size="sm"
                        class="bg-blue-50 text-[#003357] border border-blue-100 rounded-full px-4"
                      >
                        Banner ad
                      </UButton>
                      <UButton
                        size="sm"
                        variant="ghost"
                        class="text-gray-400 rounded-full px-4"
                      >
                        Text ad
                      </UButton>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Banner Creative
                    </p>
                    <div class="border rounded-xl p-4 bg-gray-50/50">
                      <p class="text-xs text-gray-400 mb-3">
                        Image upload
                      </p>
                      <div class="h-32 bg-[#1A8081] rounded-lg flex flex-col items-center justify-center text-white/70 border-4 border-white shadow-sm overflow-hidden mb-2">
                        <span class="text-xs font-medium">banner_lawtech_march.jpg</span>
                      </div>
                      <p class="text-[10px] text-gray-400">
                        Recommended: 1200x300px · JPG or PNG · max 2MB
                      </p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UFormGroup
                      label="Headline"
                      class="col-span-1"
                    >
                      <UInput
                        model-value="Get legal help from verified lawyers"
                        size="lg"
                        class="rounded-lg"
                      />
                    </UFormGroup>
                    <UFormGroup
                      label="Destination URL"
                      class="col-span-1"
                    >
                      <UInput
                        model-value="https://lawtech.ng/promo"
                        size="lg"
                        class="rounded-lg"
                      />
                    </UFormGroup>
                  </div>
                </div>

                <div class="lg:col-span-4 space-y-6">
                  <div class="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Preview
                    </p>
                    <div class="aspect-4/1 bg-[#1A8081] rounded mb-3" />
                    <h4 class="font-bold text-sm text-gray-900 mb-1">
                      Get legal help from verified lawyers
                    </h4>
                    <a
                      href="#"
                      class="text-xs font-bold text-blue-600 flex items-center gap-1"
                    >Learn more <UIcon
                      name="i-lucide-arrow-right"
                      class="w-3 h-3"
                    /></a>
                  </div>

                  <div class="bg-gray-50/50 rounded-xl p-6 border border-gray-100 space-y-4">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Performance
                    </p>
                    <div class="flex justify-between items-center text-sm">
                      <span class="text-gray-500">Impressions</span>
                      <span class="font-bold text-gray-900">14,280</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                      <span class="text-gray-500">Clicks</span>
                      <span class="font-bold text-gray-900">384</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                      <span class="text-gray-500">CTR</span>
                      <span class="font-bold text-green-500">2.6%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- App Banners -->
            <div
              v-if="activeContentTab === 'App banners'"
              class="p-6 md:p-8 space-y-6"
            >
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 class="text-lg font-bold text-gray-900">
                    App banners
                  </h2>
                  <p class="text-sm text-gray-400">
                    Shown in the carousel at the top of the mobile app home screen · {{ activeBannerCount }} of {{ appBanners.length }} active
                  </p>
                </div>
                <UButton
                  icon="i-lucide-plus"
                  class="bg-[#003357] hover:bg-[#004474] text-white rounded-lg px-4 font-bold"
                  @click="openCreateBannerModal"
                >
                  Add banner
                </UButton>
              </div>

              <div class="space-y-4">
                <div
                  v-if="bannersLoading"
                  class="space-y-4"
                >
                  <USkeleton
                    v-for="i in 3"
                    :key="i"
                    class="h-44 w-full rounded-2xl"
                  />
                </div>

                <div
                  v-else-if="appBanners.length === 0"
                  class="border border-dashed border-gray-200 rounded-2xl py-12"
                >
                  <SharedEmptyState
                    icon="i-lucide-image"
                    title="No app banners"
                    description="Create the first app banner for the mobile app carousel."
                    action-label="Add banner"
                    @action="openCreateBannerModal"
                  />
                </div>

                <template v-else>
                  <div
                    v-for="(banner, idx) in appBanners"
                    :key="banner.id"
                    class="p-6 border border-gray-100 rounded-2xl flex flex-col md:flex-row gap-6 relative group overflow-hidden bg-white transition-shadow"
                    :class="draggingBannerIndex === idx ? 'opacity-60 shadow-lg' : 'hover:shadow-sm'"
                    draggable="true"
                    @dragstart="draggingBannerIndex = idx"
                    @dragover.prevent
                    @drop="handleBannerDrop(idx)"
                    @dragend="draggingBannerIndex = null"
                  >
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-[#003357] transition-colors" />

                    <div class="w-full md:w-48 aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2 shrink-0 overflow-hidden">
                      <img
                        v-if="banner.image"
                        :src="banner.image"
                        :alt="banner.title || 'App banner'"
                        class="w-full h-full object-cover"
                      >
                      <template v-else>
                        <UIcon
                          name="i-lucide-image"
                          class="w-8 h-8"
                        />
                        <span class="text-xs font-medium">No image</span>
                      </template>
                    </div>

                    <div class="flex-1 space-y-4">
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <p class="text-sm font-medium text-gray-400">
                          Title
                        </p>
                        <p class="md:col-span-2 text-sm font-semibold text-gray-900">
                          {{ banner.title || 'Untitled banner' }}
                        </p>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <p class="text-sm font-medium text-gray-400">
                          Subtitle
                        </p>
                        <p class="md:col-span-2 text-sm text-gray-600">
                          {{ banner.subtitle || 'No subtitle' }}
                        </p>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <p class="text-sm font-medium text-gray-400">
                          Link
                        </p>
                        <p class="md:col-span-2 text-sm text-gray-600 break-all">
                          {{ banner.link || 'No link' }}
                        </p>
                      </div>

                      <div class="flex items-center justify-between pt-2">
                        <div class="flex items-center gap-3">
                          <UToggle
                            :model-value="banner.status === 'active'"
                            color="primary"
                            disabled
                          />
                          <span
                            class="text-xs font-bold"
                            :class="banner.status === 'active' ? 'text-[#003357]' : 'text-gray-400'"
                          >
                            {{ banner.status === 'active' ? 'Active' : 'Inactive' }}
                          </span>
                        </div>
                        <div class="flex items-center gap-2">
                          <UButton
                            icon="i-lucide-pencil"
                            size="xs"
                            color="neutral"
                            variant="ghost"
                            class="border border-gray-200"
                            @click="openEditBannerModal(banner)"
                          />
                          <UButton
                            icon="i-lucide-arrow-up"
                            size="xs"
                            color="neutral"
                            variant="ghost"
                            class="border border-gray-200"
                            :disabled="idx === 0 || bannersUpdating"
                            @click="moveBanner(idx, idx - 1)"
                          />
                          <UButton
                            icon="i-lucide-arrow-down"
                            size="xs"
                            color="neutral"
                            variant="ghost"
                            class="border border-gray-200"
                            :disabled="idx === appBanners.length - 1 || bannersUpdating"
                            @click="moveBanner(idx, idx + 1)"
                          />
                          <UButton
                            color="error"
                            variant="subtle"
                            size="sm"
                            class="px-4 font-bold"
                            :loading="bannersUpdating"
                            @click="removeBanner(banner)"
                          >
                            Remove
                          </UButton>
                        </div>
                      </div>
                    </div>

                    <div class="absolute top-4 left-4 w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                      {{ idx + 1 }}
                    </div>
                  </div>
                </template>

                <button
                  v-if="!bannersLoading && appBanners.length > 0"
                  class="w-full py-6 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                  @click="openCreateBannerModal"
                >
                  <UIcon
                    name="i-lucide-plus"
                    class="w-5 h-5"
                  />
                  Add banner
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Tab -->
        <div
          v-else-if="activeTab === 'Security'"
          class="p-6 md:p-8 space-y-8 bg-white rounded-xl border border-gray-100"
        >
          <div>
            <h2 class="text-lg font-bold text-gray-900">
              Authentication
            </h2>
            <p class="text-sm text-gray-500">
              Login and session security
            </p>
          </div>

          <div class="space-y-6">
            <div class="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <h3 class="font-medium text-gray-900">
                  Enable 2FA
                </h3>
                <p class="text-sm text-gray-500">
                  Secure your account with 2FA
                </p>
              </div>
              <UToggle
                v-model="enable2FA"
                color="primary"
              />
            </div>

            <div class="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <h3 class="font-medium text-gray-900">
                  Session timeout
                </h3>
                <p class="text-sm text-gray-500">
                  Edit your session timeout
                </p>
              </div>
              <USelect
                v-model="sessionTimeout"
                :options="['15 minutes', '30 minutes', '1 hour', 'Never']"
                class="w-40"
              />
            </div>

            <div class="flex items-center justify-between py-4">
              <div>
                <h3 class="font-medium text-gray-900">
                  Change password
                </h3>
              </div>
              <UButton
                color="neutral"
                variant="solid"
                class="shadow-sm border border-gray-200"
              >
                Change
              </UButton>
            </div>
          </div>
        </div>

        <!-- Admin accounts Tab -->
        <div
          v-if="activeTab === 'Admin accounts'"
          class="p-6 md:p-8 space-y-8"
        >
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900">
                Admin accounts
              </h2>
              <p class="text-sm text-gray-500">
                Manage roles and access levels
              </p>
            </div>
            <UButton
              icon="i-lucide-plus"
              color="primary"
              class="bg-[#003357] hover:bg-[#002244]"
            >
              Create admin
            </UButton>
          </div>

          <div class="space-y-4">
            <div
              v-for="admin in adminAccounts"
              :key="admin.email"
              class="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
            >
              <div class="flex items-center gap-4">
                <UAvatar
                  :alt="admin.name"
                  size="md"
                  class="bg-gray-100 text-gray-500"
                />
                <div>
                  <h3 class="font-medium text-gray-900">
                    {{ admin.name }}
                  </h3>
                  <p class="text-sm text-gray-400">
                    {{ admin.email }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <UBadge
                  :color="admin.color"
                  variant="subtle"
                  class="rounded-full px-3 py-1 font-medium hidden sm:block"
                >
                  {{ admin.role }}
                </UBadge>
                <UButton
                  color="neutral"
                  variant="solid"
                  size="sm"
                  class="shadow-sm border border-gray-200"
                >
                  Edit
                </UButton>
              </div>
            </div>
          </div>

          <div class="pt-6">
            <h2 class="text-lg font-bold text-gray-900">
              Role permissions
            </h2>
            <p class="text-sm text-gray-500 mb-6">
              What each role can access and do
            </p>

            <div class="space-y-4">
              <div
                v-for="(permission, idx) in permissions"
                :key="idx"
                class="py-4 border-t border-gray-100"
              >
                <h3 class="font-medium text-gray-900">
                  {{ permission.title }}
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                  {{ permission.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- General Tab -->
        <div
          v-if="activeTab === 'General'"
          class="p-6 md:p-8 space-y-8"
        >
          <div>
            <h2 class="text-lg font-bold text-gray-900">
              App Settings
            </h2>
            <p class="text-sm text-gray-500">
              Core platform configuration
            </p>
          </div>

          <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 gap-4">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">
                  Platform name
                </h3>
                <p class="text-sm text-gray-500">
                  Displayed across the app and email communications
                </p>
              </div>
              <UInput
                model-value="Lawyers & Clients"
                class="w-full sm:w-64"
                readonly
              />
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 gap-4">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">
                  Support email
                </h3>
                <p class="text-sm text-gray-500">
                  Where user support requests are directed
                </p>
              </div>
              <UInput
                model-value="support@lawyerclients.ng"
                class="w-full sm:w-64"
                readonly
              />
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 gap-4">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">
                  Default country
                </h3>
                <p class="text-sm text-gray-500">
                  Used for phone formatting and location defaults
                </p>
              </div>
              <UInput
                model-value="Nigeria (NG)"
                class="w-full sm:w-64"
                readonly
              />
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">
                  Default language
                </h3>
                <p class="text-sm text-gray-500">
                  Platform interface language
                </p>
              </div>
              <UInput
                model-value="English"
                class="w-full sm:w-64"
                readonly
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <SharedBaseModal
      v-model="isBannerModalOpen"
      :title="bannerModalTitle"
      max-width="max-w-[560px]"
      @update:model-value="(open) => { if (!open) closeBannerModal() }"
    >
      <form
        class="mt-4 space-y-5"
        @submit.prevent="submitBannerForm"
      >
        <div class="space-y-2">
          <label class="block text-[14px] font-medium text-gray-500">
            Image
          </label>
          <UInput
            :key="bannerFileInputKey"
            type="file"
            accept="image/*"
            size="lg"
            class="w-full"
            :ui="{ base: 'rounded-[8px] border border-[#E5E7EB] px-4 py-3 text-[14px]' }"
            @change="handleBannerImageChange"
          />
          <p
            v-if="editingBanner"
            class="text-xs text-gray-400"
          >
            Leave empty to keep the current image.
          </p>
        </div>

        <div class="space-y-2">
          <label class="block text-[14px] font-medium text-gray-500">
            Title
          </label>
          <UInput
            v-model="bannerForm.title"
            placeholder="e.g Find your lawyer today"
            size="lg"
            class="w-full"
            :ui="{ base: 'rounded-[8px] border border-[#E5E7EB] px-4 py-3 text-[14px]' }"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-[14px] font-medium text-gray-500">
            Subtitle
          </label>
          <UInput
            v-model="bannerForm.subtitle"
            placeholder="e.g Verified legal professionals across Nigeria"
            size="lg"
            class="w-full"
            :ui="{ base: 'rounded-[8px] border border-[#E5E7EB] px-4 py-3 text-[14px]' }"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-[14px] font-medium text-gray-500">
            Link
          </label>
          <UInput
            v-model="bannerForm.link"
            placeholder="https://lawyersclients.ng/search"
            size="lg"
            class="w-full"
            :ui="{ base: 'rounded-[8px] border border-[#E5E7EB] px-4 py-3 text-[14px]' }"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-[14px] font-medium text-gray-500">
            Status
          </label>
          <USelect
            v-model="bannerForm.status"
            :options="bannerStatusOptions"
            size="lg"
            class="w-full"
            :ui="{ base: 'rounded-[8px] border border-[#E5E7EB] px-4 py-3 text-[14px]' }"
          />
        </div>

        <p
          v-if="bannerFormError"
          class="text-sm font-medium text-red-600"
        >
          {{ bannerFormError }}
        </p>

        <div class="flex items-center justify-end gap-3 pt-1">
          <UButton
            type="button"
            variant="outline"
            color="neutral"
            class="border border-[#D1D5DB] text-gray-900 rounded-[8px] px-5 py-2.5 text-[14px] font-medium hover:bg-gray-50"
            @click="closeBannerModal"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            class="bg-[#003357] hover:bg-[#004474] text-white rounded-[8px] px-5 py-2.5 text-[14px] font-medium"
            :loading="bannersUpdating"
          >
            {{ editingBanner ? 'Save changes' : 'Create banner' }}
          </UButton>
        </div>
      </form>
    </SharedBaseModal>

    <SharedBaseModal
      v-model="infoModalOpen"
      title="Info"
      max-width="max-w-[520px]"
      @update:model-value="(open) => { if (!open) infoModalMessage = '' }"
    >
      <div class="mt-4">
        <p class="text-sm text-gray-700">
          {{ infoModalMessage }}
        </p>
        <div class="flex justify-end pt-6">
          <UButton
            color="primary"
            class="bg-[#003357] hover:bg-[#004474]"
            @click="infoModalOpen = false"
          >
            OK
          </UButton>
        </div>
      </div>
    </SharedBaseModal>
  </div>
</template>
