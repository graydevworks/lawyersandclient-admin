<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { adminSchema, adminUpdateSchema } from '~/schemas/adminSchema'
import type { AdminFormData } from '~/schemas/adminSchema'
import ErrorModal from '~/components/shared/ErrorModal.vue'
import SuccessModal from '~/components/shared/SuccessModal.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const toast = useToast()

const { createAdminAccount, updateAdminAccount, getAdminAccounts } = useAdmin()

// --- Route-driven mode ---
const editAdminId = computed<number | null>(() => {
  const raw = route.query.id
  if (raw === undefined) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
})

const isEditMode = computed(() => editAdminId.value !== null)

const isLoadingAdmin = ref(false)

const formData = reactive<AdminFormData>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'operations_admin'
})

const formErrors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const successTitle = ref('')
const successMessage = ref('')

const roles = [
  { label: 'Operations Admin', value: 'operations_admin' },
  { label: 'Support Admin', value: 'support_admin' }
]

const loadAdminData = async () => {
  if (!isEditMode.value || editAdminId.value === null) return

  isLoadingAdmin.value = true
  try {
    const result = await getAdminAccounts()
    if (!result?.success) return

    const data = result.data as any
    const accounts = data?.data?.data ?? data?.data ?? data?.accounts ?? []

    const admin = accounts.admins?.find((acc: any) => Number(acc?.id) === editAdminId.value)

    // As requested: console.log the matched admin
    if (admin) {
      console.log('[account-details] admin matched by id:', admin)

      formData.name = admin.name || admin.full_name || ''
      formData.email = admin.email || ''
      formData.role = admin.role || 'operations_admin'
    }
  } finally {
    isLoadingAdmin.value = false
  }
}

onMounted(() => {
  if (isEditMode.value) loadAdminData()

  if(route.query.admin === 'profile') {
    // form
  }
})

const handleSuccessComplete = () => {
  showSuccessModal.value = false
  navigateTo('/settings?tab=Admin accounts')
}

const showErrorModal = ref(false)
const errorModalTitle = ref('Validation error.')
const errorModalDescription = ref('Please check the form for errors.')

const handleSubmit = async () => {
  formErrors.value = {}

  const validationResult = isEditMode.value
    ? adminUpdateSchema.safeParse(formData)
    : adminSchema.safeParse(formData)

  if (!validationResult.success) {
    const apiLikeErrors: Record<string, string[]> = {}

    validationResult.error.issues.forEach((issue) => {
      const field = (issue.path?.[0] as string) || 'form'
      if (!apiLikeErrors[field]) apiLikeErrors[field] = []
      apiLikeErrors[field].push(issue.message)
    })

    Object.entries(apiLikeErrors).forEach(([field, messages]) => {
      formErrors.value[field] = messages[0]
    })

    errorModalTitle.value = 'Validation error.'
    errorModalDescription.value = 'Please fix the highlighted fields and try again.'
    showErrorModal.value = true
    return
  }

  isSubmitting.value = true

  try {
    const formDataToSend = new FormData()

    formDataToSend.append('name', formData.name)
    formDataToSend.append('email', formData.email)
    if (formData.password) {
      formDataToSend.append('password', formData.password)
      formDataToSend.append('password_confirmation', formData.password_confirmation)
    }
    formDataToSend.append('role', formData.role)

    let response: any

    if (isEditMode.value && editAdminId.value !== null) {
      // Update via PUT (useAdmin composable)
      response = await updateAdminAccount(editAdminId.value, formDataToSend)
    } else {
      response = await createAdminAccount(formDataToSend)
    }

    if (response?.success) {
      successTitle.value = isEditMode.value ? 'Admin Updated' : 'Admin Created'
      successMessage.value = isEditMode.value
        ? 'Admin account has been updated successfully.'
        : 'Admin account has been created successfully.'
      showSuccessModal.value = true
      return
    }

    if (response?.data?.errors) {
      const serverErrors = response.data.errors as Record<string, string[]>

      // show first error in errors (email[0] etc)
      const firstEntry = Object.entries(serverErrors)[0]
      if (firstEntry) {
        const [, messages] = firstEntry
        if (Array.isArray(messages) && messages[0]) {
          errorModalTitle.value = response.data.message || 'Validation error.'
          errorModalDescription.value = messages[0]
          showErrorModal.value = true
        }
      }

      // also keep field-level messages
      Object.entries(serverErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages[0]) {
          formErrors.value[field] = messages[0]
        }
      })

      return
    }

    // non-validation backend error (e.g. super admin accounts cannot be modified)
    if (response?.data?.message) {
      errorModalTitle.value = 'Error'
      errorModalDescription.value = response.data.message
      showErrorModal.value = true
      return
    }

    errorModalTitle.value = 'Error'
    errorModalDescription.value = response?.data?.message || (isEditMode.value ? 'Failed to update admin account.' : 'Failed to create admin account.')
    showErrorModal.value = true
  } catch (error) {
    // if something weird happens, ensure modal is shown with a message
    errorModalTitle.value = 'Error'
    errorModalDescription.value = 'An unexpected error occurred.'
    showErrorModal.value = true

    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred.',
      color: 'error'
    })
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen py-12 px-4">
    <ErrorModal
      v-model="showErrorModal"
      :title="errorModalTitle"
      :description="errorModalDescription"
      button-text="Dismiss"
    />

    <div class="max-w-2xl mx-auto">
      <NuxtLink
        to="/settings"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors font-medium border border-[#D8D8D8] px-4 py-1 rounded-full"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="w-4 h-4"
        />
        Back to settings
      </NuxtLink>

      <div class="mb-8">
        <h1 class="text-[28px] font-medium text-black">
          {{ isEditMode ? 'Account details' : 'Account details' }}
        </h1>
        <p class="text-[16px] text-[#919191] font-medium">
          {{ isEditMode ? 'Basic information for the admin account' : 'Basic information for the new admin account' }}
        </p>
      </div>

      <div class="rounded-2xl p-8">
        <div v-if="isEditMode && isLoadingAdmin" class="space-y-6">
          <USkeleton class="h-10 w-full rounded-xl" />
          <USkeleton class="h-10 w-full rounded-xl" />
          <USkeleton class="h-10 w-full rounded-xl" />
          <USkeleton class="h-10 w-full rounded-xl" />
          <USkeleton class="h-10 w-full rounded-xl" />
          <USkeleton class="h-12 w-32 rounded-xl ml-auto" />
        </div>

        <form
          v-else
          class="space-y-6"
          @submit.prevent="handleSubmit"
        >
          <UFormField
            label="Full Name"
            name="name"
            :ui="{ label: 'text-[#A8A8A8] font-semibold text-sm block' }"
            :error="formErrors.name"
          >
            <UInput
              v-model="formData.name"
              placeholder="Enter full name"
              size="lg"
              class="w-full"
              icon="i-lucide-user"
              :ui="{
                base: 'rounded-sm border-0 focus:ring-2 focus:ring-[#E5E5E5] bg-transparent focus:border-transparent transition-all duration-200 h-[42px]',
                placeholder: 'text-gray-400'
              }"
            />
          </UFormField>

          <UFormField
            label="Email address"
            name="email"
            :ui="{ label: 'text-[#A8A8A8] font-semibold text-sm block' }"
            :error="formErrors.email"
          >
            <UInput
              v-model="formData.email"
              placeholder="Enter email address"
              size="lg"
              class="w-full"
              icon="i-lucide-mail"
              :disabled="isEditMode"
              :ui="{
                base: 'rounded-sm border-0 focus:ring-2 focus:ring-[#E5E5E5] bg-transparent focus:border-transparent transition-all duration-200 h-[42px] w-full',
                placeholder: 'text-gray-400'
              }"
            />
          </UFormField>

          <UFormField
            label="Role"
            name="role"
            :ui="{ label: 'text-[#A8A8A8] font-semibold text-sm block' }"
            :error="formErrors.role"
          >
            <USelect
              v-model="formData.role"
              :items="roles"
              option-attribute="value"
              size="lg"
              class="w-full"
              icon="i-lucide-shield"
              :ui="{
                base: 'rounded-sm border-0 focus:ring-2 focus:ring-[#E5E5E5] bg-transparent focus:border-transparent transition-all duration-200 h-[42px] w-full',
                placeholder: 'text-gray-400'
              }"
            />
          </UFormField>

          <UFormField
            label="Password"
            name="password"
            :ui="{ label: 'text-[#A8A8A8] font-semibold text-sm block' }"
            :error="formErrors.password"
          >
            <UInput
              v-model="formData.password"
              type="password"
              placeholder="Enter password"
              size="lg"
              class="w-full"
              icon="i-lucide-lock"
              :ui="{
                base: 'rounded-sm border-0 focus:ring-2 focus:ring-[#E5E5E5] bg-transparent focus:border-transparent transition-all duration-200 h-[42px] w-full',
                placeholder: 'text-gray-400'
              }"
            />
            <p class="text-xs text-gray-400 mt-1">
              Min 8 chars; must include upper/lowercase letters, a number, and a symbol
            </p>
          </UFormField>

          <UFormField
            label="Confirm Password"
            name="password_confirmation"
            :ui="{ label: 'text-[#A8A8A8] font-semibold text-sm block' }"
            :error="formErrors.password_confirmation"
          >
            <UInput
              v-model="formData.password_confirmation"
              type="password"
              placeholder="Confirm password"
              size="lg"
              class="w-full"
              icon="i-lucide-lock"
              :ui="{
                base: 'rounded-sm border-0 focus:ring-2 focus:ring-[#E5E5E5] bg-transparent focus:border-transparent transition-all duration-200 h-[42px] w-full',
                placeholder: 'text-gray-400'
              }"
            />
          </UFormField>

          <div class="pt-6 flex justify-end">
            <UButton
              type="submit"
              size="lg"
              :loading="isSubmitting"
              class="bg-[#003357] hover:bg-[#002244] text-white font-semibold rounded-xl px-8 py-3 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {{ isEditMode ? 'Update admin' : 'Create admin' }}
            </UButton>
          </div>
        </form>
      </div>
    </div>

    <SuccessModal
      v-model="showSuccessModal"
      :title="successTitle"
      :description="successMessage"
      button-text="Done"
      @complete="handleSuccessComplete"
    />
  </div>
</template>

