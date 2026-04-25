<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/dashboard')
    }
  ]
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-[#003357]" />
  </div>
</template>
