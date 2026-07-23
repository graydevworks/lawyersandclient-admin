<script setup lang="ts">
import type { NuxtError } from '#app'
import { ref, onMounted } from 'vue'

const props = defineProps({
  error: Object as () => NuxtError
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/images/LC W@2x.png' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const searchQuery = ref('')
const isLoaded = ref(false)

const handleSearch = () => {
  if (searchQuery.value) {
    clearError({ redirect: `/find-lawyers?q=${encodeURIComponent(searchQuery.value)}` })
  } else {
    clearError({ redirect: '/find-lawyers' })
  }
}

onMounted(() => {
  // Trigger animations shortly after mount for a smooth entry effect
  setTimeout(() => {
    isLoaded.value = true
  }, 150)
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white overflow-hidden">
    <PublicHeader class="relative z-20" />

    <main class="flex-grow flex flex-col items-center justify-center px-4 py-[200px] relative">
      <!-- Background Subtle Animated Elements for depth -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
        <div
          class="absolute w-[800px] h-[800px] rounded-full blur-3xl opacity-0 bg-blue-50 transform scale-50 transition-all duration-[2000ms] ease-out"
          :class="{ '!scale-100 !opacity-50': isLoaded }"
        />
        <div
          class="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-0 bg-gray-50 transform translate-y-40 transition-all duration-[2500ms] delay-300 ease-out"
          :class="{ '!translate-y-0 !opacity-60': isLoaded }"
        />
      </div>

      <!-- Content Container -->
      <div class="z-10 text-center max-w-3xl w-full flex flex-col items-center">
        <!-- Large Error Code -->
        <div class="relative group cursor-default">
          <!-- Epic glow effect behind the text -->
          <div class="absolute inset-0 blur-xl opacity-0 group-hover:opacity-30 bg-[#002B49] transition-opacity duration-700" />

          <p
            class="text-[120px] md:text-[150px]! font-bold text-[#002B49] leading-none mb-4 opacity-0 translate-y-16 scale-95 transition-all duration-[1200ms] ease-out drop-shadow-sm"
            :class="{ '!opacity-100 !translate-y-0': isLoaded }"
          >
            {{ error?.statusCode || 404 }}
          </p>
        </div>

        <!-- Main Descriptive Message -->
        <p
          class="text-xl md:text-2xl text-gray-800 font-normal mb-6 opacity-0 translate-y-8 transition-all duration-[1000ms] delay-[400ms] ease-out"
          :class="{ '!opacity-100 !translate-y-0': isLoaded }"
        >
          Sorry, the page you're looking for cannot be found
        </p>

        <!-- Helpful Guidance / Links -->
        <p
          class="text-base md:text-lg text-gray-700 mb-10 opacity-0 translate-y-8 transition-all duration-[1000ms] delay-[600ms] ease-out font-normal"
          :class="{ '!opacity-100 !translate-y-0': isLoaded }"
        >
          Visit our
          <button
            class="text-blue-800 hover:text-blue-800 underline underline-offset-4 decoration-blue-900 hover:decoration-blue-600 font-medium transition-all duration-300"
            @click="clearError({ redirect: '/' })"
          >
            homepage
          </button>,
          get <button
            class="text-blue-800 hover:text-blue-800 underline underline-offset-4 decoration-blue-900 hover:decoration-blue-600 font-medium transition-all duration-300"
            @click="clearError({ redirect: '/contact' })"
          >
            help
          </button>,
          or Search for lawyers
        </p>

        <!-- Interactive Search Bar -->
        <div
          class="w-full max-w-lg flex flex-col sm:flex-row items-center gap-3 opacity-0 translate-y-10 transition-all duration-[1000ms] delay-[800ms] ease-out"
          :class="{ '!opacity-100 !translate-y-0': isLoaded }"
        >
          <UInput
            v-model="searchQuery"
            placeholder="What legal support do you need?"
            icon="i-heroicons-magnifying-glass"
            size="xl"
            class="w-full flex-grow shadow-sm ring-1 ring-gray-200 rounded-md bg-white hover:shadow-md transition-shadow duration-300 focus-within:ring-2 focus-within:ring-[#002B49]"
            :ui="{ base: 'pl-10 !ring-0 rounded-[8px]!', leadingIcon: 'pl-3 size-[15px]' }"
            @keyup.enter="handleSearch"
          />
          <UButton
            size="xl"
            class="w-full sm:w-auto px-[20px] py-[9.6px] bg-[#002B49] text-white hover:bg-[#001D33] active:bg-[#001020] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center font-medium rounded-md whitespace-nowrap"
            @click="handleSearch"
          >
            Search
          </UButton>
        </div>
      </div>
    </main>

    <PublicFooter class="mt-auto relative z-20" />
  </div>
</template>
