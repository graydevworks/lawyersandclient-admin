<script setup lang="ts">
defineEmits(['close'])

const { logout } = useAuth()

const navGroups = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard', icon: 'material-symbols:dashboard-rounded', to: '/dashboard' },
      { label: 'Clients', icon: 'mynaui:user', to: '/clients' },
      { label: 'New Users', icon: 'uiw:user-add', to: '/new-users' },
      { label: 'Lawyers', icon: 'solar:case-linear', to: '/lawyers' },
      { label: 'Verification Queue', icon: 'solar:clipboard-check-broken', to: '/verification-queue' },
      { label: 'Cases', icon: 'vaadin:gavel', to: '/cases' },
      { label: 'Practice Areas', icon: 'material-symbols:cases-outline', to: '/practice-areas' }
    ]
  },
  {
    label: 'INSIGHTS',
    items: [
      { label: 'Analytics', icon: 'f7:chart-bar-square', to: '/analytics' },
      { label: 'Reports', icon: 'akar-icons:reciept', to: '/reports' },
      { label: 'Help Center', icon: 'i-lucide-life-buoy', to: '/help-center' }
    ]
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'Settings', icon: 'lineicons:gear-1', to: '/settings' },
      { label: 'Change Password', icon: 'i-lucide-key-round', to: '/change-password' },
      { label: 'Two-Factor Auth', icon: 'i-lucide-shield-check', to: '/two-factor' },
      { label: 'Notifications', icon: 'iconamoon:notification-thin', to: '/notifications' },
      { label: 'Logs', icon: 'i-lucide-scroll-text', to: '/logs' }
    ]
  }
]
</script>

<template>
  <aside class="w-full lg:w-64 bg-white border-r border-gray-200 flex flex-col lg:fixed lg:left-[12px] lg:top-[95px] rounded-[12px] z-50 h-full lg:h-auto">
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
    <nav class="flex-1 overflow-y-auto p-3 md:p-4">
      <div
        v-for="(group, index) in navGroups"
        :key="group.label"
        :class="index != navGroups.length - 1 ? 'mb-8' : 'mb-0'"
      >
        <h3 class="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
          {{ group.label }}
        </h3>
        <div class="space-y-1">
          <ULink
            v-for="item in group.items"
            :key="item.label"
            :to="item.to"
            class="flex items-center gap-3 px-3 md:px-[13px] py-2.5 text-sm font-medium transition-colors rounded-[6px]"
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

    <!-- Logout button -->
    <div class="p-4 border-t border-gray-200">
      <button
        class="flex items-center gap-3 w-full px-3 md:px-[13px] py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-[6px] transition-colors"
        @click="logout"
      >
        <UIcon
          name="i-lucide-log-out"
          class="w-5 h-5 shrink-0"
        />
        Logout
      </button>
    </div>
  </aside>
</template>
