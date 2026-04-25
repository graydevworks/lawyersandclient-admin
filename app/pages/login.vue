<script setup lang="ts">
definePageMeta({
  layout: 'blank'
})

const email = ref('atibaheritage@gmail.com')
const password = ref('............')
const showPassword = ref(false)

const login = () => {
  // Mock login redirect
  navigateTo('/dashboard')
}
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center p-4">
    <!-- Background Image with Overlay -->
    <div 
      class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop')"
    >
      <div class="absolute inset-0 bg-[#001D31]/70 backdrop-blur-[2px]"></div>
    </div>

    <!-- Login Card -->
    <UCard 
      class="w-full max-w-[480px] z-10 rounded-[32px] overflow-hidden shadow-2xl border-0"
      :ui="{ 
        body: 'p-8 sm:p-12',
        root: 'bg-white'
      }"
    >
      <div class="flex flex-col items-center">
        <!-- Logo -->
        <div class="mb-8 flex flex-col items-center">
          <div class="w-12 h-12 bg-[#003357] rounded-xl flex items-center justify-center text-white mb-2">
            <span class="text-2xl font-bold">C</span>
          </div>
          <p class="text-[10px] font-bold tracking-[0.2em] text-[#003357] uppercase">Lawyers & Clients</p>
        </div>

        <h1 class="text-2xl font-bold text-[#111827] mb-8">Sign In to access Admin dashboard</h1>

        <form @submit.prevent="login" class="w-full space-y-6">
          <UFormGroup label="Email address" name="email" :ui="{ label: 'text-gray-400 font-normal text-xs mb-1.5 block' }">
            <UInput
              v-model="email"
              placeholder="Email address"
              size="xl"
              class="w-full"
              :ui="{ 
                base: 'rounded-2xl bg-white border-gray-200 focus:ring-[#003357]',
              }"
            />
          </UFormGroup>

          <UFormGroup label="Password" name="password" :ui="{ label: 'text-gray-400 font-normal text-xs mb-1.5 block' }">
            <div class="relative">
              <UInput
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                size="xl"
                class="w-full"
                :ui="{ 
                  base: 'rounded-2xl bg-white border-gray-200 focus:ring-[#003357]',
                }"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-5 h-5" />
              </button>
            </div>
          </UFormGroup>

          <div class="text-right">
            <NuxtLink to="/forgot-password" class="text-xs font-bold text-[#003357] hover:underline">
              Forgot Password
            </NuxtLink>
          </div>

          <UButton
            type="submit"
            block
            size="xl"
            class="bg-[#003357] hover:bg-[#002244] text-white font-bold rounded-2xl py-4 transition-all"
          >
            Login to your account
          </UButton>
        </form>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
:deep(.u-input-wrapper input) {
  font-weight: 500;
  color: #111827;
}
</style>
