<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'

type NetworkStatus = 'online' | 'offline' | 'poor'

const isOnline = ref(navigator.onLine)
const connectionQuality = ref<'good' | 'poor' | 'unknown'>('unknown')
const showStatusBar = ref(false)

const networkStatus = computed<NetworkStatus>(() => {
  if (!isOnline.value) return 'offline'
  if (connectionQuality.value === 'poor') return 'poor'
  return 'online'
})

const statusConfig = computed(() => {
  switch (networkStatus.value) {
    case 'online':
      return {
        bgColor: 'bg-green-500',
        textColor: 'text-white',
        icon: 'i-lucide-wifi',
        message: 'You are online'
      }
    case 'offline':
      return {
        bgColor: 'bg-red-500',
        textColor: 'text-white',
        icon: 'i-lucide-wifi-off',
        message: 'You are offline'
      }
    case 'poor':
      return {
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
        icon: 'i-lucide-wifi-low',
        message: 'Poor network connection'
      }
  }
})

const updateConnectionQuality = () => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  if (connection) {
    const effectiveType = connection.effectiveType?.toLowerCase()
    const downlink = connection.downlink

    if (effectiveType === '4g' && downlink >= 1.5) {
      connectionQuality.value = 'good'
    } else if (['slow-2g', '2g', '3g'].includes(effectiveType) || downlink < 1) {
      connectionQuality.value = 'poor'
    } else {
      connectionQuality.value = 'unknown'
    }
  } else {
    connectionQuality.value = 'unknown'
  }
}

const handleOnline = () => {
  isOnline.value = true
  showStatusBar.value = true
  updateConnectionQuality()

  setTimeout(() => {
    showStatusBar.value = false
  }, 3000)
}

const handleOffline = () => {
  isOnline.value = false
  showStatusBar.value = true
  connectionQuality.value = 'unknown'
}

const handleConnectionChange = () => {
  updateConnectionQuality()
}

onMounted(() => {
  updateConnectionQuality()

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  const connection = (navigator as any).connection
  if (connection) {
    connection.addEventListener('change', handleConnectionChange)
  }
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)

  const connection = (navigator as any).connection
  if (connection) {
    connection.removeEventListener('change', handleConnectionChange)
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="showStatusBar"
      :class="[statusConfig.bgColor, statusConfig.textColor]"
      class="fixed top-0 left-0 right-0 z-[9999] px-4 py-2.5 flex items-center justify-center gap-2 shadow-lg"
    >
      <UIcon
        :name="statusConfig.icon"
        class="w-4 h-4"
      />
      <span class="text-sm font-semibold">
        {{ statusConfig.message }}
      </span>
    </div>
  </Transition>
</template>
