<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits(['toggle-sidebar', 'toggle-tablet-sidebar'])
const router = useRouter()

const { currentUser } = useAuth()
const { searchLawyers } = useSearch()

const displayName = computed(() => {
  const u = currentUser.value as Record<string, unknown> | undefined
  const data = u?.data as Record<string, unknown> | undefined
  if (data?.first_name || data?.last_name) {
    return `${data.first_name || ''} ${data.last_name || ''}`.trim()
  }
  return (u?.email as string)?.split('@')[0] || 'Admin'
})

const userAvatar = computed(() => {
  const u = currentUser.value as Record<string, unknown> | undefined
  const data = u?.data as Record<string, unknown> | undefined
  return data?.profile_photo_url || data?.avatar || 'https://i.pravatar.cc/150?u=admin'
})

const userRole = computed(() => {
  const u = currentUser.value as Record<string, unknown> | undefined
  const data = u?.data as Record<string, unknown> | undefined
  return data?.role || u?.role || 'Admin'
})

// Use window resize event to detect screen size
const isMobile = ref(false)

const checkScreen = () => {
  isMobile.value = window.innerWidth < 768 // md breakpoint
}

let resizeListener: (() => void) | null = null

onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
  resizeListener = checkScreen
})

onUnmounted(() => {
  if (resizeListener) {
    window.removeEventListener('resize', resizeListener)
  }
})

const handleToggle = () => {
  if (isMobile.value) {
    emit('toggle-sidebar')
  } else {
    emit('toggle-tablet-sidebar')
  }
}

// --- Search ---
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)
const showSearchDropdown = ref(false)
let searchDebounce: ReturnType<typeof setTimeout> | null = null

const handleSearchInput = () => {
  if (searchDebounce) clearTimeout(searchDebounce)

  if (!searchQuery.value || searchQuery.value.trim().length < 2) {
    searchResults.value = []
    showSearchDropdown.value = false
    return
  }

  searchDebounce = setTimeout(async () => {
    isSearching.value = true
    showSearchDropdown.value = true
    try {
      const result = await searchLawyers({ q: searchQuery.value.trim() })
      if (result?.success && result?.data?.data) {
        const data = result.data.data
        if (data?.success) {
          const list = Array.isArray(data.data) ? data.data : (data.data?.lawyers || [])
          searchResults.value = list.map((lawyer: any) => ({
            id: lawyer.id,
            name: lawyer.full_name || lawyer.name,
            email: lawyer.email,
            avatar: lawyer.profile_photo_url || lawyer.avatar,
            status: lawyer.verification_status || lawyer.status
          }))
        } else {
          searchResults.value = []
        }
      } else {
        searchResults.value = []
      }
    } catch {
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 400)
}

const goToLawyer = (id: number | string) => {
  showSearchDropdown.value = false
  searchQuery.value = ''
  searchResults.value = []
  router.push(`/lawyers/${id}`)
}

const closeDropdown = () => {
  setTimeout(() => {
    showSearchDropdown.value = false
  }, 200)
}
</script>

<template>
  <header class="relative">
    <div class="fixed h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-4 py-[10px] top-[12px] md:top-[16px] z-40 w-[calc(100%-16px)] md:w-[calc(100%-24px)] left-1/2 -translate-x-1/2 rounded-[12px]">
      <div class="flex items-center gap-2 md:gap-3">
        <UButton
          class="md:hidden"
          color="neutral"
          variant="ghost"
          icon="i-lucide-menu"
          @click="handleToggle"
        />
        <UButton
          class="hidden md:inline-flex lg:hidden"
          color="neutral"
          variant="ghost"
          icon="i-lucide-menu"
          @click="handleToggle"
        />
      </div>
      <NuxtLink
        to="/dashboard"
        class="px-2 md:px-4 lg:p-8 min-w-0"
      >
        <div class="flex items-center space-x-2 min-w-0">
          <img
            src="/images/LCS@2x.png"
            alt="Logo"
            class="w-8"
          >
          <span class="text-primary font-semibold text-sm md:text-base lg:text-lg truncate">Lawyers & Clients</span>
        </div>
      </NuxtLink>
      <div class="flex items-center gap-2 md:gap-4 flex-1 w-full">
        <!-- Spacer -->
      </div>

      <div class="flex items-center gap-2 md:gap-3 lg:gap-6">
        <!-- Mobile/Tablet search icon -->
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-search"
          class="flex lg:hidden justify-center relative size-[36px] rounded-full bg-[#F6F6F6]"
        />
        <div class="flex-1 max-w-md hidden lg:block relative">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Search lawyers..."
            variant="ghost"
            class="bg-gray-100 hover:bg-gray-200 focus-within:bg-gray-50 focus-within:ring-1 focus-within:ring-gray-300 transition-all border-0 rounded-full overflow-hidden"
            size="sm"
            :ui="{ base: 'h-[36px]' }"
            @input="handleSearchInput"
            @blur="closeDropdown"
            @focus="searchQuery.trim().length >= 2 && searchResults.length > 0 ? showSearchDropdown = true : null"
          />

          <!-- Search Results Dropdown -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="showSearchDropdown"
              class="absolute top-full w-[300px] left-0 right-0 mt-2 bg-white rounded-[12px] shadow-xl border border-gray-100 z-[100] max-h-[320px] overflow-y-auto"
            >
              <!-- Loading state -->
              <div
                v-if="isSearching"
                class="p-4 flex items-center gap-3 text-gray-400"
              >
                <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
                <span class="text-[13px]">Searching...</span>
              </div>

              <!-- Results -->
              <template v-else-if="searchResults.length > 0">
                <button
                  v-for="result in searchResults"
                  :key="result.id"
                  class="w-[300px] flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer text-left border-b border-gray-50 last:border-0"
                  @mousedown.prevent="goToLawyer(result.id)"
                >
                  <UAvatar
                    :src="result.avatar"
                    :alt="result.name"
                    class="size-[32px] shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] font-semibold text-gray-900 truncate">
                      {{ result.name }}
                    </p>
                    <p class="text-[12px] text-gray-400 truncate">
                      {{ result.email }}
                    </p>
                  </div>
                  <UBadge
                    v-if="result.status"
                    :color="result.status?.toLowerCase() === 'approved' || result.status?.toLowerCase() === 'verified' ? 'success'
                      : result.status?.toLowerCase() === 'pending' ? 'warning'
                        : result.status?.toLowerCase() === 'rejected' || result.status?.toLowerCase() === 'suspended' ? 'error'
                          : 'neutral'"
                    variant="subtle"
                    class="rounded-full px-2 text-[11px] shrink-0"
                  >
                    {{ result.status }}
                  </UBadge>
                  <UIcon name="i-lucide-arrow-right" class="size-4 text-gray-300 shrink-0" />
                </button>
              </template>

              <!-- No results -->
              <div
                v-else
                class="p-4 text-center text-[13px] text-gray-400"
              >
                No lawyers found for "{{ searchQuery }}"
              </div>
            </div>
          </Transition>
        </div>
        <NuxtLink to="/notifications">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-bell"
            class="flex justify-center relative size-[36px] rounded-full bg-[#F6F6F6]"
          >
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </UButton>
        </NuxtLink>

        <NuxtLink to="/account-details">
          <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-[150px] h-full bg-[#F6F6F6] py-[4px] px-[4.5px] rounded-full">
            <UAvatar
              :src="userAvatar"
              :alt="displayName"
              size="sm"
              class="size-[33px]"
            />
            <div class="hidden sm:block text-left">
              <p class="text-[12px] font-medium text-gray-900 leading-tight">
                {{ displayName }}
              </p>
              <p class="text-[10px] text-gray-500 uppercase tracking-wider font-normal">
                {{ userRole }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
