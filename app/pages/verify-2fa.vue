<script setup lang="ts">
definePageMeta({
  layout: 'blank',
  middleware: 'auth',
  role: 'auth'
})

const route = useRoute()
const { verifyTwoFactorLogin, loading } = useTwoFactor()
const { fetch: refreshSession } = useUserSession()

const email = ref(String(route.query.email || ''))
const otp = ref('')
const showErrorModal = ref(false)
const errorTitle = ref('')
const errorDescription = ref('')

const handleVerify = async () => {
  if (!email.value || !otp.value) {
    errorTitle.value = 'Missing Information'
    errorDescription.value = 'Email and verification code are required.'
    showErrorModal.value = true
    return
  }

  const result = await verifyTwoFactorLogin(email.value, otp.value)

  if (result.success) {
    await refreshSession()
    await navigateTo('/dashboard')
  } else {
    errorTitle.value = 'Verification Failed'
    errorDescription.value = String(result.error)
    showErrorModal.value = true
  }
}
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center p-4 font-['Public_Sans']">
    <div
      class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style="background-image: url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop')"
    >
      <div class="absolute inset-0 bg-[#001D31]/80 backdrop-blur-[1px]" />
    </div>

    <div class="w-full max-w-[480px] z-10 bg-white rounded-[32px] shadow-2xl p-8 sm:p-12 flex flex-col items-center">
      <img
        src="/images/lawyers&clients.svg"
        alt="Lawyers & Clients"
        class="h-12 w-auto mb-6"
      >

      <h1 class="text-[22px] font-semibold text-gray-900 mb-2 text-center">
        Two-Factor Authentication
      </h1>
      <p class="text-sm text-gray-500 mb-8 text-center">
        Enter the verification code sent to your email
      </p>

      <form
        class="w-full space-y-5"
        @submit.prevent="handleVerify"
      >
        <UFormGroup label="Email address">
          <UInput
            v-model="email"
            type="email"
            required
            size="xl"
            class="rounded-[20px]"
          />
        </UFormGroup>

        <UFormGroup label="Verification Code">
          <UInput
            v-model="otp"
            type="text"
            required
            placeholder="Enter 6-digit code"
            maxlength="6"
            size="xl"
            class="rounded-[20px] text-center tracking-widest text-lg"
          />
        </UFormGroup>

        <UButton
          type="submit"
          block
          size="xl"
          :loading="loading"
          class="bg-[#003357] hover:bg-[#002244] text-white font-bold rounded-[20px] h-[56px]"
        >
          Verify & Continue
        </UButton>
      </form>

      <SharedErrorModal
        v-model="showErrorModal"
        :title="errorTitle"
        :description="errorDescription"
        @complete="showErrorModal = false"
      />
    </div>
  </div>
</template>
