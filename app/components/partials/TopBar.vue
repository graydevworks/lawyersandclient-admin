<script setup lang="ts">
const emit = defineEmits(['toggle-sidebar', 'toggle-tablet-sidebar'])

// Use window resize event to detect screen size
const isMobile = ref(false)

const checkScreen = () => {
  isMobile.value = window.innerWidth < 768 // md breakpoint
}

let resizeListener: (() => void) | null = null

onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
  resizeListener = checkScreen
})

onUnmounted(() => {
  if (resizeListener) {
    window.removeEventListener('resize', resizeListener)
  }
})

const handleToggle = () => {
  if (isMobile.value) {
    emit('toggle-sidebar')
  } else {
    emit('toggle-tablet-sidebar')
  }
}
</script>

<template>
  <header class="relative">
    <div class="fixed h-16 bg-white border-b border-gray-200 flex items-center justify-between px-[12px] py-[10px] top-[16px] z-40 w-[calc(100%-24px)] left-[50%] translate-x-[-50%] rounded-[12px]">
      <NuxtLink
        to="/dashboard"
        class="p-8"
      >
        <div class="flex items-center space-x-2">
          <img
            src="/images/LCS@2x.png"
            alt="Logo"
            class="w-8"
          >
          <span class="text-primary font-semibold text-lg">Lawyers & Clients</span>
        </div>
      </NuxtLink>
      <div class="flex items-center gap-4 flex-1 w-full">
        <!-- Spacer -->
      </div>

      <div class="flex items-center gap-6">
        <div class="flex-1 max-w-md hidden lg:block">
          <UInput
            icon="i-lucide-search"
            placeholder="Search ..."
            variant="ghost"
            class="bg-gray-100 rounded-lg hover:bg-gray-200 focus-within:bg-gray-50 focus-within:ring-1 focus-within:ring-gray-300 transition-all border-0 rounded-full overflow-hidden"
            size="sm"
            :ui="{ base: 'h-[36px]' }"
          />
        </div>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-bell"
          class="flex justify-center relative size-[36px] rounded-full bg-[#F6F6F6]"
        >
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </UButton>

        <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-[150px] h-full bg-[#F6F6F6] py-[4px] px-[4.5px] rounded-full">
          <UAvatar
            src="https://i.pravatar.cc/150?u=admin"
            alt="Atiba Heritage"
            size="sm"
            class="size-[33px]"
          />
          <div class="hidden md:block text-left">
            <p class="text-[12px] font-medium text-gray-900 leading-tight">
              Atiba Heritage
            </p>
            <p class="text-[10px] text-gray-500 uppercase tracking-wider font-normal">
              Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
