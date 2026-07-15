<script setup lang="ts">
definePageMeta({
  layout: 'blank',
  middleware: 'auth',
  role: 'auth'
})

const { login } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }

  isLoading.value = true
  try {
    const result = await login({
      email: email.value,
      password: password.value,
      role: 'admin'
    })

    if (!result.success && result.error) {
      errorMessage.value = result.error

      console.log('[Login] Error 22:', result.error)
    }
  } catch (err) {
    errorMessage.value = 'Something went wrong. Please try again.'
    console.error('[Login] Error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center p-4 font-['Public_Sans']">
    <!-- Background Image with Overlay -->
    <div
      class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style="background-image: url('/images/login.jpg')"
    >
      <div class="absolute inset-0 bg-[#00000099] backdrop-blur-[1px]" />
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-[536px] z-10 bg-white rounded-[32px] shadow-2xl py-[40px] px-[56px] flex flex-col items-center">
      <!-- Logo -->
      <div class="mb-6">
        <img
          src="/images/LCS@2x.png"
          alt="Lawyers & Clients"
          class="h-[39px] w-auto"
        >
      </div>

      <h1 class="text-[24px] font-normal text-[#111827] mb-10 text-center leading-tight">
        Sign In to access Admin dashboard
      </h1>

      <form
        class="w-full space-y-8"
        @submit.prevent="handleLogin"
      >
        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2"
        >
          <UIcon
            name="i-lucide-alert-circle"
            class="w-4 h-4 shrink-0"
          />
          {{ errorMessage }}
        </div>
        <div class="space-y-1.5">
          <label
            for="email"
            class="text-[13px] font-medium text-gray-400 ml-1"
          >Email address</label>
          <UInput
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            size="xl"
            class="w-full"
            :ui="{
              base: 'rounded-[32px] bg-white border-gray-200 focus:ring-[#003357] h-[47px] px-6 text-[15px]'
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
              placeholder="Enter your password"
              size="xl"
              class="w-full"
              :ui="{
                base: 'rounded-[32px] bg-white border-gray-200 focus:ring-[#003357] h-[47px] px-6 text-[15px]'
              }"
            />
            <button
              type="button"
              class="absolute flex items-center right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              @click="showPassword = !showPassword"
            >
              <UIcon
                :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="w-5 h-5"
              />
            </button>
          </div>
        </div>

        <UButton
          type="submit"
          block
          size="xl"
          :loading="isLoading"
          class="bg-[#003357] hover:bg-[#002244] text-white font-bold rounded-[32px] h-[47px] text-[16px] transition-all shadow-lg active:scale-[0.98] disabled:bg-[#00335770]"
        >
          {{ isLoading ? 'Signing in...' : 'Login to your account' }}
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
