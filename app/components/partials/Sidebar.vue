<script setup lang="ts">
defineEmits(['close'])

const navGroups = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
      { label: 'Clients', icon: 'i-lucide-users', to: '/clients' },
      { label: 'New Users', icon: 'i-lucide-user-plus', to: '/new-users' },
      { label: 'Lawyers', icon: 'i-lucide-briefcase', to: '/lawyers' },
      { label: 'Verification Queue', icon: 'i-lucide-clipboard-check', to: '/verification-queue' },
      { label: 'Cases', icon: 'i-lucide-file-text', to: '/cases' },
      { label: 'Practice Areas', icon: 'i-lucide-scale', to: '/practice-areas' }
    ]
  },
  {
    label: 'INSIGHTS',
    items: [
      { label: 'Analytics', icon: 'i-lucide-bar-chart-3', to: '/analytics' },
      { label: 'Reports', icon: 'i-lucide-pie-chart', to: '/reports' }
    ]
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' },
      { label: 'Notifications', icon: 'i-lucide-bell', to: '/notifications' }
    ]
  }
]
</script>

<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col lg:fixed lg:left-[12px] lg:top-[95px] rounded-[12px] z-50">
    <!-- Close button for mobile/tablet -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
      <h2 class="text-lg font-semibold text-gray-900">
        Menu
      </h2>
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="$emit('close')"
      />
    </div>
    <nav class="flex-1 overflow-y-auto p-[16px]">
      <div
        v-for="group in navGroups"
        :key="group.label"
        class="mb-8"
      >
        <h3 class="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {{ group.label }}
        </h3>
        <div class="space-y-1">
          <ULink
            v-for="item in group.items"
            :key="item.label"
            :to="item.to"
            class="flex items-center gap-3 px-[13px] py-2.5 text-sm font-medium transition-colors rounded-[6px]"
            active-class="bg-[#003357] text-white"
            inactive-class="text-[#64748B] hover:bg-gray-50 hover:text-gray-900"
          >
            <UIcon
              :name="item.icon"
              class="w-5 h-5 shrink-0"
            />
            {{ item.label }}
          </ULink>
        </div>
      </div>
    </nav>
  </aside>
</template>
