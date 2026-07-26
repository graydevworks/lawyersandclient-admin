<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, fetch: refreshSession } = useUserSession()
const { enableTwoFactor, disableTwoFactor, loading } = useTwoFactor()
const toast = useToast()

const isEnabled = ref(false)
const showDisableModal = ref(false)
const disablePassword = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  const data = user.value?.data as { two_factor_enabled?: boolean, is_2fa_enabled?: boolean } | undefined
  isEnabled.value = Boolean(data?.two_factor_enabled ?? data?.is_2fa_enabled)
})

const handleToggle = async (value: boolean) => {
  if (value) {
    const result = await enableTwoFactor()

    if (result.success) {
      successMessage.value = 'Two-factor authentication has been enabled.'
      showSuccess.value = true
      await refreshSession()
    } else {
      isEnabled.value = false
      errorMessage.value = String(result.error)
      showError.value = true
    }
  } else {
    isEnabled.value = true
    disablePassword.value = ''
    showDisableModal.value = true
  }
}

const confirmDisable = async () => {
  if (!disablePassword.value) return

  const result = await disableTwoFactor(disablePassword.value)

  if (result.success) {
    isEnabled.value = false
    showDisableModal.value = false
    disablePassword.value = ''
    successMessage.value = 'Two-factor authentication has been disabled.'
    showSuccess.value = true
    await refreshSession()
  } else {
    isEnabled.value = true
    errorMessage.value = String(result.error)
    showError.value = true
    showDisableModal.value = false
    disablePassword.value = ''
    isEnabled.value = true
  }
}

const cancelDisable = () => {
  isEnabled.value = true
  showDisableModal.value = false
  disablePassword.value = ''
}
</script>

<template>
  <div class="max-w-xl mx-auto space-y-6">
    <div>
      <h1 class="text-[16px] font-semibold text-gray-900">
        Two-Factor Authentication
      </h1>
      <p class="text-[14px] text-gray-500 mt-1">
        Add an extra layer of security to your account
      </p>
    </div>

    <UCard class="rounded-2xl border-0 ring-0 p-2">
      <div class="flex items-center justify-between py-1">
        <div>
          <h3 class="font-medium text-gray-900">
            Enable 2FA
          </h3>
          <p class="text-[14px] text-gray-500">
            Secure your account with 2FA
          </p>
        </div>
        <USwitch
          v-model="isEnabled"
          color="primary"
          :disabled="loading"
          @update:model-value="handleToggle"
        />
      </div>
    </UCard>

    <SharedConfirmationModal
      v-model="showDisableModal"
      title="Disable 2FA"
      description="Enter your password to disable two-factor authentication."
      icon="i-lucide-shield-off"
      confirm-text="Disable"
      cancel-text="Cancel"
      confirm-color="danger"
      :loading="loading"
      :confirm-disabled="!disablePassword"
      @confirm="confirmDisable"
      @cancel="cancelDisable"
    >
      <UFormGroup label="Password">
        <UInput
          v-model="disablePassword"
          type="password"
          size="lg"
          class="rounded-xl"
        />
      </UFormGroup>
    </SharedConfirmationModal>

    <SharedSuccessModal
      v-model="showSuccess"
      :title="successMessage"
      description="Your security settings have been updated."
      @complete="showSuccess = false"
    />

    <SharedErrorModal
      v-model="showError"
      :description="errorMessage"
      @complete="showError = false"
    />
  </div>
</template>
