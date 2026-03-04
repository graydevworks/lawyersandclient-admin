<script setup lang="ts">
declare module 'nuxt/app' {
  interface NuxtLayouts {
    client: unknown
  }
}

definePageMeta({
  layout: 'client',
  middleware: 'auth'
})
</script>

<template>
  <p>Dashboard</p>
</template>
