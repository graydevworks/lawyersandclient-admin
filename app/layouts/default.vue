<script setup lang="ts">
const isSidebarOpen = useState('isSidebarOpen', () => false)
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FB] flex">
    <!-- Sidebar for desktop -->
    <div class="hidden lg:block">
      <PartialsSidebar />
    </div>

    <!-- Mobile Sidebar (Slideover) -->
    <USlideover
      v-model="isSidebarOpen"
      side="left"
      class="lg:hidden"
    >
      <PartialsSidebar class="w-full! relative!" />
    </USlideover>

    <!-- Main Content -->
    <div
      class="flex-1 flex flex-col min-h-screen transition-all duration-300"
      :class="[isSidebarOpen ? '' : 'lg:ml-64']"
    >
      <PartialsTopBar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <main class="flex-1 p-4 md:p-8">
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
