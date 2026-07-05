<script setup lang="ts">
import { ref } from 'vue'

const isSidebarOpen = ref(false)
const isTabletSheetOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-[#F6F6F6] flex relative overflow-x-hidden">
    <NetworkStatusModal />
    <!-- Sidebar for desktop (lg and above) -->
    <div class="hidden lg:block px-[24px]! pt-[16px]">
      <PartialsSidebar />
    </div>

    <!-- Tablet Sheet -->
    <USlideover
      v-model:open="isTabletSheetOpen"
      side="left"
      class="hidden md:block lg:hidden"
      :ui="{ content: 'w-[300px] max-w-[85vw]' }"
    >
      <template #content>
        <PartialsSidebar
          class="w-full! relative! h-full"
          @close="isTabletSheetOpen = false"
        />
      </template>
    </USlideover>

    <!-- Mobile Sheet -->
    <USlideover
      v-model:open="isSidebarOpen"
      side="left"
      class="md:hidden"
      :ui="{ content: 'w-[280px] max-w-[88vw]' }"
    >
      <template #content>
        <PartialsSidebar
          class="w-full! relative! h-full"
          @close="isSidebarOpen = false"
        />
      </template>
    </USlideover>

    <!-- Main Content -->
    <div
      class="flex-1 flex flex-col min-h-screen transition-all duration-300"
      :class="['lg:ml-64']"
    >
      <PartialsTopBar
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
        @toggle-tablet-sidebar="isTabletSheetOpen = !isTabletSheetOpen"
      />

      <main class="flex-1 px-3 md:px-4 lg:pr-[12px] lg:pl-0 pt-[88px] md:pt-[96px]">
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
