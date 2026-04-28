<script setup lang="ts">
const isSidebarOpen = useState('isSidebarOpen', () => false)
const isTabletSheetOpen = useState('isTabletSheetOpen', () => false)
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FB] flex relative">
    <!-- Sidebar for desktop (lg and above) -->
    <div class="hidden lg:block px-[24px]! pt-[16px]">
      <PartialsSidebar />
    </div>

    <!-- Tablet Sidebar (USheet) -->
    <USheet
      v-model="isTabletSheetOpen"
      side="left"
      class="md:hidden lg:hidden"
    >
      <PartialsSidebar class="w-full! relative!" />
    </USheet>

    <!-- Mobile Sidebar (USlideover) -->
    <USlideover
      v-model="isSidebarOpen"
      side="left"
      class="md:hidden"
    >
      <PartialsSidebar class="w-full! relative!" />
    </USlideover>

    <!-- Main Content -->
    <div
      class="flex-1 flex flex-col min-h-screen transition-all duration-300"
      :class="[isSidebarOpen || isTabletSheetOpen ? '' : 'lg:ml-64']"
    >
      <PartialsTopBar
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
        @toggle-tablet-sidebar="isTabletSheetOpen = !isTabletSheetOpen"
      />

      <main class="flex-1 pr-[12px] pt-[100px]!">
        <slot />
      </main>
    </div>
  </div>
</template>

<style>
body {
  font-family: 'Public Sans', sans-serif;
  color: #111827; /* Fallback for text-gray-900 */
}
</style>
