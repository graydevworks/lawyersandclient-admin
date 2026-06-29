<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface CaseRow {
  id: string
  name: string
  avatar?: string
  email?: string
  status?: string
  joined?: string
  contact?: string
  [key: string]: unknown
}

interface CardField {
  key: string
  label: string
}

interface Props {
  columns: TableColumn<CaseRow>[]
  data: CaseRow[]
  linkPrefix?: string
  cardFields?: CardField[]
}

withDefaults(defineProps<Props>(), {
  linkPrefix: '/user',
  cardFields: () => []
})

const emit = defineEmits(['view-profile'])

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success'
    case 'suspended': return 'error'
    case 'new': return 'primary'
    case 'verified': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'error'
    case 'stalled': return 'warning'
    case 'completed': return 'success'
    default: return 'neutral'
  }
}
</script>

<template>
  <div class="bg-white overflow-hidden">
    <!-- Desktop Table (xl and above) -->
    <div class="hidden xl:block overflow-x-auto">
      <UTable
        :data="data"
        :columns="columns"
        class="w-full min-w-[720px] p-0 border-0 divider-none"
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
              <span class="text-[12px] text-gray-400 font-normal">{{ row.original.email }}</span>
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

        <!-- Custom Role Cell -->
        <template #role-cell="{ row }">
          <span class="text-gray-700 text-[14px] font-medium capitalize">{{ (row.original as any).role }}</span>
        </template>

        <template #lastActive-cell="{ row }">
          <span class="text-gray-500! text-[14px] font-normal">{{ (row.original as any).lastActive }}</span>
        </template>

        <!-- Custom Actions Cell -->
        <template #actions-cell="{ row }">
          <UButton
            label="View Profile"
            variant="outline"
            color="neutral"
            size="xs"
            class="font-semibold text-[#003357] border-[#E2E8F0] hover:bg-[#F8F9FB] py-[9px] px-[12px] rounded-[4px] text-[13px]"
            @click="emit('view-profile', row.original)"
          />
        </template>
      </UTable>
    </div>

    <!-- Mobile/Tablet Card View (below xl) -->
    <div class="xl:hidden space-y-3 p-4">
      <div
        v-for="row in data"
        :key="row.id"
        class="bg-white border border-gray-100 rounded-[12px] p-4 space-y-3"
      >
        <!-- Card Header: Avatar + Name + Status -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <UAvatar
              :src="row.avatar"
              :alt="row.name"
              class="size-[40px]"
            />
            <div>
              <p class="text-[14px] font-semibold text-gray-900">
                {{ row.name }}
              </p>
              <p v-if="row.email" class="text-[12px] text-gray-400">
                {{ row.email }}
              </p>
              <p v-else-if="row.contact" class="text-[12px] text-gray-400">
                {{ row.contact }}
              </p>
            </div>
          </div>
          <UBadge
            v-if="row.status"
            :color="getStatusColor(row.status)"
            variant="subtle"
            class="rounded-full px-2.5 h-[24px] text-[11px] font-medium shrink-0"
          >
            {{ row.status }}
          </UBadge>
        </div>

        <!-- Card Fields -->
        <div
          v-if="cardFields.length"
          class="grid grid-cols-2 gap-2 text-[13px]"
        >
          <div
            v-for="field in cardFields"
            :key="field.key"
            class="flex flex-col"
          >
            <span class="text-gray-400 text-[12px]">{{ field.label }}</span>
            <span class="text-gray-700 font-medium">{{ row[field.key] }}</span>
          </div>
        </div>

        <!-- Card Action -->
        <div class="pt-1">
          <UButton
            label="View Profile"
            variant="outline"
            color="neutral"
            size="xs"
            class="w-full justify-center font-semibold text-[#003357] border-[#E2E8F0] hover:bg-[#F8F9FB] py-[9px] rounded-[6px] text-[13px]"
            @click="emit('view-profile', row)"
          />
        </div>
      </div>

      <!-- Empty state for cards -->
      <SharedEmptyState
        v-if="data.length === 0"
        title="No records found"
        description="There are no records to display right now."
      />
    </div>

    <!-- Footer -->
    <div class="px-4 md:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between bg-gray-50/30" v-if="false">
      <div class="text-xs text-gray-500">
        Showing 1–{{ Math.min(data.length, 10) }} of {{ data.length }} users
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
