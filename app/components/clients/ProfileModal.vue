<script setup lang="ts">
/**
 * ClientProfileModal — User details modal with Reset Password and Suspend Account actions.
 * Triggered from clients page "View Profile" button.
 */

interface ClientInfo {
  id: string
  name: string
  email?: string
  contact?: string
  location?: string
  status: string
  avatar?: string
  joined: string
  lastActive: string
  totalChats?: number
  reportsFiled?: number
}

const props = defineProps<{
  modelValue: boolean
  client: ClientInfo | null
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success'
    case 'suspended': return 'error'
    case 'new': return 'primary'
    default: return 'neutral'
  }
}

const statusBadgeColor = computed(() => getStatusColor(props.client?.status || ''))
</script>

<template>
  <SharedBaseModal
    v-model="isOpen"
    title="User details"
    max-width="max-w-[520px]"
  >
    <template v-if="client">
      <!-- Profile Header -->
      <div class="flex items-center gap-4 mt-3 mb-6">
        <UAvatar
          :src="client.avatar || `https://i.pravatar.cc/150?u=${client.id}`"
          :alt="client.name"
          size="lg"
          class="size-[56px]"
        />
        <div>
          <h3 class="text-[18px] font-bold text-gray-900">
            {{ client.name }}
          </h3>
          <p class="text-[13px] text-gray-400">
            Client since {{ client.joined }}
          </p>
        </div>
      </div>

      <!-- Account Info Section -->
      <div class="mb-6">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Account Info
        </h4>
        <div class="space-y-0">
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">User ID</span>
            <span class="font-semibold text-gray-900">{{ client.id }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Email</span>
            <span class="text-gray-900">{{ client.email || client.contact || 'N/A' }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Location</span>
            <span class="text-gray-900">{{ client.location || 'N/A' }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3">
            <span class="text-gray-500">Status</span>
            <UBadge
              :color="statusBadgeColor"
              variant="subtle"
              class="rounded-full px-3 py-0.5 font-bold text-[12px]"
            >
              {{ client.status }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- Activity Section -->
      <div class="mb-6">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Activity
        </h4>
        <div class="space-y-0">
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Total chats</span>
            <span class="font-semibold text-gray-900">{{ client.totalChats ?? 0 }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Reports filed</span>
            <span class="font-semibold text-gray-900">{{ client.reportsFiled ?? 0 }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3 border-b border-gray-100">
            <span class="text-gray-500">Last active</span>
            <span class="text-gray-900">{{ client.lastActive }}</span>
          </div>
          <div class="flex justify-between items-center text-sm py-3">
            <span class="text-gray-500">Joined</span>
            <span class="text-gray-900">{{ client.joined }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3">
        <UButton
          block
          class="bg-[#003357] hover:bg-[#004474] text-white font-semibold py-3 rounded-[8px] text-[14px]"
          @click="console.log('[Reset Password] for:', client.id)"
        >
          Reset password
        </UButton>
        <UButton
          block
          variant="outline"
          color="neutral"
          class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 rounded-[8px] text-[14px] hover:bg-gray-50"
          @click="console.log('[Suspend Account] for:', client.id)"
        >
          Suspend account
        </UButton>
      </div>
    </template>
  </SharedBaseModal>
</template>
