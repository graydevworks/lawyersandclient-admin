<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { changePassword, loading } = useChangePassword()
const toast = useToast()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

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
    toast.add({
      title: 'Success',
      description: 'Your password has been changed successfully.',
      color: 'success'
    })
  } else {
    errorMessage.value = String(result.error)
    showError.value = true
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto space-y-6">
    <div>
      <h1 class="text-[16px] font-semibold text-gray-900">
        Change Password
      </h1>
      <p class="text-[14px] text-gray-500 mt-1">
        Update your admin account password
      </p>
    </div>

    <UCard class="rounded-[24px] border-0 ring-0 shadow-sm p-2 sm:p-4">
      <form
        class="space-y-6"
        @submit.prevent="handleSubmit"
      >
        <!-- Current Password -->
        <div class="space-y-2">
          <label class="text-[13px] font-semibold text-gray-600 block">Current password</label>
          <div class="relative">
            <UInput
              v-model="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="Enter current password"
              size="lg"
              class="w-full"
              :ui="{
                base: 'rounded-[12px] bg-white border-gray-200 focus:ring-[#003357] h-[48px] px-4 text-[14px]'
              }"
            />
            <button
              type="button"
              class="flex items-center absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <UIcon
                :name="showCurrentPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="w-5 h-5"
              />
            </button>
          </div>
        </div>

        <!-- New Password -->
        <div class="space-y-2">
          <label class="text-[13px] font-semibold text-gray-600 block">New password</label>
          <div class="relative">
            <UInput
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="Enter new password"
              size="lg"
              class="w-full"
              :ui="{
                base: 'rounded-[12px] bg-white border-gray-200 focus:ring-[#003357] h-[48px] px-4 text-[14px]'
              }"
            />
            <button
              type="button"
              class="flex items-center absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              @click="showNewPassword = !showNewPassword"
            >
              <UIcon
                :name="showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="w-5 h-5"
              />
            </button>
          </div>
        </div>

        <!-- Confirm New Password -->
        <div class="space-y-2">
          <label class="text-[13px] font-semibold text-gray-600 block">Confirm new password</label>
          <div class="relative">
            <UInput
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm new password"
              size="lg"
              class="w-full"
              :ui="{
                base: 'rounded-[12px] bg-white border-gray-200 focus:ring-[#003357] h-[48px] px-4 text-[14px]'
              }"
            />
            <button
              type="button"
              class="flex items-center absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <UIcon
                :name="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="w-5 h-5"
              />
            </button>
          </div>
        </div>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="loading"
          class="bg-[#003357] hover:bg-[#002244] text-white font-semibold rounded-[12px] h-[48px] transition-all"
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

<style scoped>
:deep(.u-input-wrapper input) {
  font-weight: 500;
  color: #111827;
}
</style>
