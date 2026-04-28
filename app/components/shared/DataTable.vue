<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface CaseRow {
  id: string
  name: string
  avatar?: string
  status?: string
  joined?: string
  contact?: string
  [key: string]: unknown
}

interface Props {
  columns: TableColumn<CaseRow>[]
  data: CaseRow[]
}

defineProps<Props>()

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success'
    case 'suspended': return 'error'
    case 'new': return 'primary'
    default: return 'neutral'
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <UTable
      :data="data"
      :columns="columns"
      class="w-full"
    >
      <!-- Custom User Cell -->
      <template #user-cell="{ row }">
        <div class="flex items-center gap-3 py-1">
          <UAvatar
            :src="row.original.avatar"
            :alt="row.original.name"
            size="sm"
          />
          <div class="flex flex-col">
            <span class="font-medium text-gray-900">{{ row.original.name }}</span>
            <span class="text-[10px] text-gray-400 font-medium uppercase">{{ row.original.id }}</span>
          </div>
        </div>
      </template>

      <!-- Custom Status Cell -->
      <template #status-cell="{ row }">
        <UBadge
          v-if="row.original.status"
          :color="getStatusColor(row.original.status)"
          variant="subtle"
          size="sm"
          class="rounded-full px-2.5 py-0.5"
        >
          {{ row.original.status }}
        </UBadge>
      </template>

      <!-- Custom Joined Cell -->
      <template #joined-cell="{ row }">
        <span class="text-gray-500">{{ row.original.joined }}</span>
      </template>

      <!-- Custom Contact Cell -->
      <template #contact-cell="{ row }">
        <span class="text-gray-500">{{ row.original.contact }}</span>
      </template>

      <!-- Custom Actions Cell -->
      <template #actions-cell="{ row }">
        <UButton
          label="View Profile"
          variant="outline"
          color="neutral"
          size="xs"
          class="font-semibold text-[#003357] border-[#E2E8F0] hover:bg-[#F8F9FB]"
          :to="`/user/${row.original.id}`"
        />
      </template>
    </UTable>

    <!-- Footer -->
    <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
      <div class="text-xs text-gray-500">
        Showing 1–10 of {{ data.length }} users
      </div>
      <UPagination
        :model-value="1"
        :total="data.length"
        :items-per-page="10"
        class="gap-1"
      />
    </div>
  </div>
</template>
