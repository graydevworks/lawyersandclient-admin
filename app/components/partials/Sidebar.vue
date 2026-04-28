<script setup lang="ts">
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
  <aside class="w-64 h-screen bg-white border-r border-gray-200 flex flex-col lg:fixed lg:left-0 lg:top-0 z-50">
    <div class="p-6">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-[#003357] rounded-lg flex items-center justify-center text-white font-bold text-xl">
          C
        </div>
        <div class="w-24 h-4 bg-gray-100 rounded" /> <!-- Logo placeholder text -->
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto py-4">
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
            class="flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors"
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
