<script setup lang="ts">
definePageMeta({
  layout: 'blank'
})

const email = ref('atibaheritage@gmail.com')
const password = ref('password123')
const showPassword = ref(false)

const login = () => {
  // Mock login redirect
  navigateTo('/dashboard')
}
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center p-4 font-['Public_Sans']">
    <!-- Background Image with Overlay -->
    <div
      class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop')"
    >
      <div class="absolute inset-0 bg-[#001D31]/80 backdrop-blur-[1px]" />
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-[540px] z-10 bg-white rounded-[40px] shadow-2xl p-8 sm:p-12 md:p-16 flex flex-col items-center">
      <!-- Logo -->
      <div class="mb-6">
        <img
          src="/images/lawyers&clients.svg"
          alt="Lawyers & Clients"
          class="h-16 w-auto"
        >
      </div>

      <h1 class="text-[24px] font-semibold text-[#111827] mb-10 text-center leading-tight">
        Sign In to access Admin dashboard
      </h1>

      <form
        class="w-full space-y-8"
        @submit.prevent="login"
      >
        <div class="space-y-1.5">
          <label
            for="email"
            class="text-[13px] font-medium text-gray-400 ml-1"
          >Email address</label>
          <UInput
            id="email"
            v-model="email"
            placeholder="atibaheritage@gmail.com"
            size="xl"
            class="w-full"
            :ui="{
              base: 'rounded-[32px] bg-white border-gray-200 focus:ring-[#003357] h-[56px] px-6 text-[15px]',
              placeholder: 'text-gray-900 font-medium'
            }"
          />
        </div>

        <div class="space-y-1.5">
          <label
            for="password"
            class="text-[13px] font-medium text-gray-400 ml-1"
          >Password</label>
          <div class="relative">
            <UInput
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••••••"
              size="xl"
              class="w-full"
              :ui="{
                base: 'rounded-[32px] bg-white border-gray-200 focus:ring-[#003357] h-[56px] px-6 text-[15px]',
                placeholder: 'text-gray-900 font-medium'
              }"
            />
            <button
              type="button"
              class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              @click="showPassword = !showPassword"
            >
              <UIcon
                :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="w-5 h-5"
              />
            </button>
          </div>
          <div class="flex justify-end pt-1">
            <NuxtLink
              to="/forgot-password"
              class="text-[14px] font-bold text-[#003357] hover:underline"
            >
              Forgot Password
            </NuxtLink>
          </div>
        </div>

        <UButton
          type="submit"
          block
          size="xl"
          class="bg-[#003357] hover:bg-[#002244] text-white font-bold rounded-[32px] h-[60px] text-[16px] transition-all shadow-lg active:scale-[0.98]"
        >
          Login to your account
        </UButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
:deep(.u-input-wrapper input) {
  font-weight: 500;
  color: #111827;
}

/* Custom shadow for the card to match premium feel */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>
