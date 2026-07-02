<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { getDashboard } = useDashboard()

const skeleton = ref(true)
const searchQuery = ref('')

const onlineUsers = ref<{
  id?: string | number
  name: string
  role: string
  avatar: string
  email?: string
  lastActive?: string
}[]>([])

const currentPage = ref(1)
const perPage = ref(20)
const totalItems = ref(0)
const totalPages = ref(1)

const fetchOnline = async (page: number = 1) => {
  const params: Record<string, any> = {
    page,
    per_page: perPage.value
  }

  const result = await getDashboard(params)
  if (result && result.data && result.data.data && result.data.data.success) {
    const onlineUsersData = result.data.data.data.online_users
    const meta = result.data.data.meta

    onlineUsers.value = onlineUsersData.map((item: { name: string, role: string, profile_photo_url: string }) => ({
      name: item.name,
      role: item.role,
      avatar: item.profile_photo_url
    }))

    if (meta) {
      currentPage.value = meta.current_page || page
      totalItems.value = meta.total || 0
      totalPages.value = meta.last_page || 1
    } else {
      totalItems.value = onlineUsers.value.length
      totalPages.value = 1
    }
  }
}

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return onlineUsers.value
  const q = searchQuery.value.toLowerCase()
  return onlineUsers.value.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q) ||
    (u.email && u.email.toLowerCase().includes(q))
  )
})

const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchOnline(currentPage.value)
  }
}

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchOnline(currentPage.value)
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchOnline(page)
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const windowSize = 5

  // If total pages <= windowSize, show all
  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  // Calculate the starting point for the window
  let start = current - Math.floor(windowSize / 2)
  if (start < 1) start = 1
  if (start + windowSize - 1 > total) start = total - windowSize + 1

  // Generate the window of pages
  return Array.from({ length: windowSize }, (_, i) => start + i)
})

onMounted(async () => {
  await fetchOnline()
  skeleton.value = false
})

// Real-time: poll every 15 seconds
const { start } = useIntervalFetch(() => fetchOnline(currentPage.value), 15000)
onMounted(() => start())
</script>

<template>
  <div class="space-y-[24px]">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-[20px] font-semibold text-gray-900 leading-tight">
          Online Users
        </h1>
        <p class="text-sm text-gray-400 mt-1">
          <span class="inline-flex items-center gap-1.5">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {{ totalItems }} users currently online
          </span>
        </p>
      </div>
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Search online users..."
        class="w-full md:w-[300px]"
        :ui="{ base: 'rounded-[36px] text-[14px] py-[10px]' }"
      />
    </div>

    <!-- Skeleton Loading -->
    <template v-if="skeleton">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard
          v-for="i in 9"
          :key="i"
          class="rounded-[18px] border-0 ring-0"
        >
          <div class="flex items-center gap-3">
            <USkeleton class="w-10 h-10 rounded-full shrink-0" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-3/4" />
              <USkeleton class="h-3 w-1/2" />
            </div>
            <USkeleton class="h-3 w-12 rounded-full" />
          </div>
        </UCard>
      </div>
    </template>

    <!-- Online Users Grid -->
    <template v-else>
      <UCard
        v-if="filteredUsers.length === 0"
        class="rounded-[18px] border-0 ring-0"
      >
        <SharedEmptyState
          icon="i-lucide-wifi-off"
          :title="searchQuery ? 'No matching users' : 'No users online'"
          :description="searchQuery ? 'No online users match &quot;' + searchQuery + '&quot;.' : 'There are no users currently online right now.'"
        />
      </UCard>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <UCard
          v-for="(user, index) in filteredUsers"
          :key="index"
          class="rounded-[18px] border-0 ring-0 hover:shadow-md transition-shadow"
          :ui="{ body: 'p-4!' }"
        >
          <div class="flex items-center gap-3">
            <div class="relative">
              <UAvatar
                :src="user.avatar"
                class="size-[40px]"
              />
              <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-semibold text-gray-900 truncate">
                {{ user.name }}
              </p>
              <p class="text-[13px] text-[#013355] font-medium">
                {{ user.role }}
              </p>
            </div>
            <span class="text-[12px] font-medium text-green-500 shrink-0">online</span>
          </div>
        </UCard>
      </div>

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
            <UButton
              :variant="page === currentPage ? 'solid' : 'ghost'"
              :color="page === currentPage ? 'primary' : 'neutral'"
              size="sm"
              class="w-8 h-8 flex items-center justify-center rounded-md font-medium"
              :class="page === currentPage ? 'bg-[#003357] hover:bg-[#004474] text-white' : 'text-gray-500'"
              @click="goToPage(page)"
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
