<script setup lang="ts">
import { formatRelativeDate } from '~/util/helper'

definePageMeta({ middleware: 'auth' })

// --- Fetch clients data on mount ---
const { getClients } = useClients()

const skeleton = ref(true)

interface StatItem {
  title: string
  value: string
  trend?: string
  trendType: 'positive' | 'neutral' | 'negative'
  trendSuffix?: string
}

const stats = ref<StatItem[]>([])

const columns = [
  { accessorKey: 'user', header: 'User' },
  { accessorKey: 'contact', header: 'Contact' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'joined', header: 'Joined' },
  { accessorKey: 'actions', header: 'Actions' }
]

const cardFields = [
  { key: 'contact', label: 'Contact' },
  { key: 'joined', label: 'Joined' },
  { key: 'location', label: 'Location' }
]

const clients = ref<{
  id: string
  name: string
  contact: string
  email?: string
  location?: string
  status: string
  joined: string
  avatar: string
}[]>([])

const searchQuery = ref('')

interface ClientRow {
  id: string
  name: string
  contact: string
  email?: string
  location?: string
  status: string
  joined: string
  lastActive: string
  avatar: string
  totalChats?: number
  reportsFiled?: number
  [key: string]: unknown
}

const selectedClient = ref<ClientRow | null>(null)
const isProfileModalOpen = ref(false)

const handleViewProfile = (client: ClientRow) => {
  selectedClient.value = {
    ...client,
    totalChats: 0,
    reportsFiled: 1
  }
  isProfileModalOpen.value = true
}

const fetchClients = async () => {
  const result = await getClients()

  if (result && result.data && result.data.data && result.data.data.success) {
    const clientList = result.data.data.data.clients
    const statistics = result.data.data.data.stats

    clients.value = clientList.map((client: any) => ({
      id: client.id,
      name: client.full_name,
      contact: client.phone,
      email: client.email,
      location: client.location,
      status: client.status,
      joined: client.joined_at ? formatRelativeDate(client.joined_at) : '',
      lastActive: client.last_active ? formatRelativeDate(client.last_active) : 'N/A',
      avatar: client.profile_photo_url || ''
    }))

    stats.value = [
      { title: 'Total Clients', value: statistics.total, trend: '', trendType: 'positive', trendSuffix: '' },
      { title: 'Active', value: statistics.active, trend: '', trendType: 'positive', trendSuffix: '' },
      { title: 'Suspended', value: statistics.suspended, trend: '', trendType: 'negative', trendSuffix: '' },
      { title: 'New Users', value: statistics.new_this_week, trend: '', trendType: 'positive' }
    ]
  }
}

onMounted(async () => {
  await fetchClients()
  skeleton.value = false
})

// Silent background refresh every 60 seconds
const { start } = useIntervalFetch(fetchClients, 60000)
onMounted(() => {
  start()
})
</script>

<template>
  <div class="space-y-8">
    <ClientsProfileModal
      v-model="isProfileModalOpen"
      :client="selectedClient"
      @action-complete="fetchClients"
    />

    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-semibold text-gray-900 leading-tight">
        Clients
      </h1>
      <UButton
        icon="i-lucide-calendar"
        color="neutral"
        variant="solid"
        class="shadow-sm bg-white hover:bg-gray-100 focus:bg-gray-100 text-[#222222] p-[12.5px] rounded-full"
      >
        April 10, 2026 - May 11, 2026
        <template #trailing>
          <UIcon
            name="i-lucide-chevron-down"
            class="ml-2 w-4 h-4"
          />
        </template>
      </UButton>
    </div>

    <!-- Skeleton Loading -->
    <template v-if="skeleton">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UCard
          v-for="i in 4"
          :key="i"
          class="rounded-[10px] border-0 ring-0"
        >
          <div class="space-y-3">
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-7 w-1/3" />
            <USkeleton class="h-3 w-1/2" />
          </div>
        </UCard>
      </div>
      <UCard class="rounded-[24px] border-0 ring-0">
        <div class="space-y-4">
          <div
            v-for="i in 5"
            :key="i"
            class="flex items-center gap-3"
          >
            <USkeleton class="w-10 h-10 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-3/4" />
              <USkeleton class="h-3 w-1/2" />
            </div>
            <USkeleton class="h-6 w-16 rounded-full" />
          </div>
        </div>
      </UCard>
    </template>

    <!-- Real Content -->
    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SharedStatCard
          v-for="stat in stats"
          :key="stat.title"
          v-bind="stat"
        />
      </div>

      <!-- Clients List Card -->
      <UCard
        class="rounded-[24px] border-0 ring-0"
        :ui="{ header: 'border-0 mb-0', body: 'p-0! px-[8px]!' }"
      >
        <template #header>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 class="font-medium text-gray-900">
              Users list
            </h3>
            <div class="flex items-center gap-4">
              <UInput
                v-model="searchQuery"
                icon="i-lucide-search"
                placeholder="Search by name or email..."
                class="w-full md:w-[367px]"
                :ui="{ base: 'rounded-[36px] text-[14px] py-[10px]' }"
              />
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-list-filter"
                size="sm"
                class="whitespace-nowrap rounded-[36px] text-[14px] py-[10px]"
              >
                Sort by
                <template #trailing>
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="ml-2 w-4 h-4"
                  />
                </template>
              </UButton>
            </div>
          </div>
        </template>

        <template v-if="clients.length > 0">
          <SharedDataTable
            :columns="columns"
            :data="clients"
            :card-fields="cardFields"
            @view-profile="handleViewProfile"
          />
        </template>
        <SharedEmptyState
          v-else
          icon="i-lucide-users"
          title="No clients found"
          description="There are no clients to display right now."
        />
      </UCard>
    </template>
  </div>
</template>
