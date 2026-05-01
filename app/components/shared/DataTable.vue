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
  linkPrefix?: string
}

const props = withDefaults(defineProps<Props>(), {
  linkPrefix: '/user'
})

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
  <div class="bg-white overflow-hidden">
    <UTable
      :data="data"
      :columns="columns"
      class="w-full p-0 border-0 divider-none"
      :ui="{
        base: 'divider-none border-none',
        th: 'divider-none border-none! font-light!',
        tr: 'divider-none border-none!',
        thead: 'divider-none border-none bg-[#F9F9FB]',
        separator: 'hidden'
      }"
    >
      <!-- Custom User Cell -->
      <template #user-cell="{ row }">
        <div class="flex items-center gap-3 py-1">
          <UAvatar
            :src="row.original.avatar"
            :alt="row.original.name"
            class="size-[32px]"
          />
          <div class="flex flex-col gap-[6px]">
            <span class="font-normal text-gray-900 text-[13px]">{{ row.original.name }}</span>
            <span class="text-[12px] text-gray-400 font-normal uppercase">{{ row.original.id }}</span>
          </div>
        </div>
      </template>

      <!-- Custom Status Cell -->
      <template #status-cell="{ row }">
        <UBadge
          v-if="row.original.status"
          :color="getStatusColor(row.original.status)"
          variant="subtle"
          class="rounded-full px-2.5 h-[28px] text-[12px] font-medium"
        >
          {{ row.original.status }}
        </UBadge>
      </template>

      <!-- Custom Joined Cell -->
      <template #joined-cell="{ row }">
        <span class="text-gray-500! text-[14px] font-normal">{{ row.original.joined }}</span>
      </template>

      <!-- Custom Contact Cell -->
      <template #contact-cell="{ row }">
        <span class="text-gray-500! text-[14px] font-normal">{{ row.original.contact }}</span>
      </template>

      <template #lastActive-cell="{ row }">
        <span class="text-gray-500! text-[14px] font-normal">{{ row.original.lastActive }}</span>
      </template>

      <!-- Custom Actions Cell -->
      <template #actions-cell="{ row }">
        <UButton
          label="View Profile"
          variant="outline"
          color="neutral"
          size="xs"
          class="font-semibold text-[#003357] border-[#E2E8F0] hover:bg-[#F8F9FB] py-[9px] px-[12px] rounded-[4px] text-[13px]"
          :to="`${props.linkPrefix}/${row.original.id}`"
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
        :first-icon="false"
        class="gap-1"
      >
        <template #first>
          <UButton class="bg-white! hidden text-neutral-700 border border-[#E8EAED]" />
        </template>
        <template #next>
          <UButton class="bg-white! text-neutral-700 border border-[#E8EAED]">
            Next <UIcon name="iconoir:arrow-right" />
          </UButton>
        </template>
        <template #prev>
          <UButton class="bg-white! text-neutral-700 border border-[#E8EAED]">
            <UIcon name="iconoir:arrow-left" />
            Prev
          </UButton>
        </template>
        <template #last>
          <UButton class="bg-white! hidden text-neutral-700 border border-[#E8EAED]" />
        </template>
      </UPagination>
    </div>
  </div>
</template>
