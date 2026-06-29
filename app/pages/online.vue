<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { getOnlineUsers } = useOnlineUsers()

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

const totalCount = ref(0)

const fetchOnline = async () => {
  const result = await getOnlineUsers()
  if (result && result.data && (result.data as any).data && (result.data as any).data.success) {
    const data = (result.data as any).data.data
    const list = Array.isArray(data) ? data : (data.users || data.online_users || [])
    totalCount.value = list.length
    onlineUsers.value = list.map((item: any) => ({
      id: item.id,
      name: item.name || item.full_name,
      role: item.role || 'User',
      avatar: item.profile_photo_url || item.avatar || '',
      email: item.email || '',
      lastActive: item.last_active || ''
    }))
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

onMounted(async () => {
  await fetchOnline()
  skeleton.value = false
})

// Real-time: poll every 15 seconds
const { start } = useIntervalFetch(fetchOnline, 15000)
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
            {{ totalCount }} users currently online
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
    </template>
  </div>
</template>
