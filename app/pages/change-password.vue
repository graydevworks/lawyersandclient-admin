<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { changePassword, loading } = useChangePassword()
const toast = useToast()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    errorMessage.value = 'All fields are required.'
    showError.value = true
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'New passwords do not match.'
    showError.value = true
    return
  }

  const result = await changePassword({
    current_password: currentPassword.value,
    password: newPassword.value,
    password_confirmation: confirmPassword.value
  })

  if (result.success) {
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    showSuccess.value = true
  } else {
    errorMessage.value = String(result.error)
    showError.value = true
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto space-y-6">
    <div>
      <h1 class="text-[20px] font-semibold text-gray-900">
        Change Password
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        Update your admin account password
      </p>
    </div>

    <UCard class="rounded-2xl border-0 ring-0">
      <form
        class="space-y-5 p-2"
        @submit.prevent="handleSubmit"
      >
        <UFormGroup label="Current password">
          <UInput
            v-model="currentPassword"
            type="password"
            size="lg"
            class="rounded-xl"
          />
        </UFormGroup>
        <UFormGroup label="New password">
          <UInput
            v-model="newPassword"
            type="password"
            size="lg"
            class="rounded-xl"
          />
        </UFormGroup>
        <UFormGroup label="Confirm new password">
          <UInput
            v-model="confirmPassword"
            type="password"
            size="lg"
            class="rounded-xl"
          />
        </UFormGroup>
        <UButton
          type="submit"
          block
          size="lg"
          :loading="loading"
          class="bg-[#003357] hover:bg-[#004474] text-white font-semibold rounded-xl"
        >
          Update password
        </UButton>
      </form>
    </UCard>

    <SharedSuccessModal
      v-model="showSuccess"
      title="Password changed successfully"
      description="Your password has been updated."
      @complete="showSuccess = false"
    />

    <SharedErrorModal
      v-model="showError"
      :description="errorMessage"
      @complete="showError = false"
    />
  </div>
</template>
