<script setup lang="ts">
defineEmits(['toggle-sidebar'])
</script>

<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
    <div class="flex items-center gap-4 flex-1">
      <UButton
        icon="i-lucide-menu"
        color="neutral"
        variant="ghost"
        class="lg:hidden"
        @click="$emit('toggle-sidebar')"
      />
      
      <div class="flex-1 max-w-md hidden md:block">
        <UInput
          icon="i-lucide-search"
          placeholder="Search ..."
          variant="ghost"
          class="bg-gray-100 rounded-lg hover:bg-gray-200 focus-within:bg-gray-50 focus-within:ring-1 focus-within:ring-gray-300 transition-all border-0"
          size="sm"
        />
      </div>
    </div>

    <div class="flex items-center gap-6">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-bell"
        class="relative"
      >
        <template #trailing>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </template>
      </UButton>

      <div class="flex items-center gap-3 pl-6 border-l border-gray-200 cursor-pointer hover:opacity-80 transition-opacity">
        <UAvatar
          src="https://i.pravatar.cc/150?u=admin"
          alt="Atiba Heritage"
          size="sm"
        />
        <div class="hidden sm:block text-left">
          <p class="text-xs font-semibold text-gray-900 leading-tight">Atiba Heritage</p>
          <p class="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Admin</p>
        </div>
      </div>
    </div>
  </header>
</template>
