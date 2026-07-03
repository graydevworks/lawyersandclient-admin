<script setup lang="ts">
import { adminSchema } from '~/schemas/adminSchema'
import type { AdminFormData } from '~/schemas/adminSchema'
import ErrorModal from '~/components/shared/ErrorModal.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const toast = useToast()

const { createAdminAccount, updateAdminAccount, getAdminAccounts } = useAdmin()

const isEditMode = computed(() => !!route.query.email)

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

// Load admin data if in edit mode
const loadAdminData = async () => {
  if (!isEditMode.value || !route.query.email) return

  const result = await getAdminAccounts()
  if (result?.success) {
    const data = result.data as any
    const accounts = data?.data?.data ?? data?.data ?? data?.accounts ?? []
    const admin = accounts.find((acc: any) => acc.email === route.query.email)

    if (admin) {
      formData.name = admin.name || admin.full_name || ''
      formData.email = admin.email || ''
      formData.role = admin.role || 'operations_admin'
    }
  }
}

onMounted(() => {
  if (isEditMode.value) {
    loadAdminData()
  }
})

const roles = [
  { label: 'Operations Admin', value: 'operations_admin' },
  { label: 'Support Admin', value: 'support_admin' }
]

const handleSuccessComplete = () => {
  showSuccessModal.value = false
  navigateTo('/settings?tab=Admin accounts')
}

const showErrorModal = ref(false)
const errorModalTitle = ref('Validation error.')
const errorModalDescription = ref('Please check the form for errors.')

const handleSubmit = async () => {
  formErrors.value = {}

  // Client-side validation with Zod
  const validationResult = adminSchema.safeParse(formData)

  if (!validationResult.success) {
    // Match API-like shape: { success:false, message:'Validation error.', errors:{ field:[...]} }
    const apiLikeErrors: Record<string, string[]> = {}

    validationResult.error.issues.forEach((issue) => {
      const field = (issue.path?.[0] as string) || 'form'
      if (!apiLikeErrors[field]) apiLikeErrors[field] = []
      apiLikeErrors[field].push(issue.message)
    })

    // Keep current field UI working (show first error per field)
    Object.entries(apiLikeErrors).forEach(([field, messages]) => {
      formErrors.value[field] = messages[0]
    })

    // Use the same error modal component/style
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
    formDataToSend.append('password', formData.password)
    formDataToSend.append('password_confirmation', formData.password_confirmation)
    formDataToSend.append('role', formData.role)

    let response
    if (isEditMode.value) {
      // For update, we need to find the admin ID first
      const result = await getAdminAccounts()
      if (result?.success) {
        const data = result.data as any
        const accounts = data?.data?.data ?? data?.data ?? data?.accounts ?? []
        const admin = accounts.find((acc: any) => acc.email === route.query.email)

        if (admin?.id) {
          response = await updateAdminAccount(admin.id, formDataToSend)
        }
      }
    } else {
      response = await createAdminAccount(formDataToSend)
    }

    // Handle server-side validation errors
    if (response?.success) {
      successTitle.value = isEditMode.value ? 'Admin Updated' : 'Admin Created'
      successMessage.value = isEditMode.value ? 'Admin account has been updated successfully.' : 'Admin account has been created successfully.'
      showSuccessModal.value = true
    } else if (response?.data?.errors) {
      // Server returned validation errors
      const serverErrors = response.data.errors as Record<string, string[]>
      Object.entries(serverErrors).forEach(([field, messages]) => {
        formErrors.value[field] = messages[0] // Show first error for each field
      })

      toast.add({
        title: 'Validation Error',
        description: response.data.message || 'Please check the form for errors.',
        color: 'error',
        duration: 5000
      })
    } else {
      // Generic error
      const errorMessage = response?.data?.message || (isEditMode.value ? 'Failed to update admin account.' : 'Failed to create admin account.')
      toast.add({
        title: 'Error',
        description: errorMessage,
        color: 'error'
      })
    }
  } catch (error) {
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
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <ErrorModal
      v-model="showErrorModal"
      :title="errorModalTitle"
      :description="errorModalDescription"
      button-text="Dismiss"
    />
    <div class="max-w-2xl mx-auto">
      <NuxtLink
        to="/settings"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors font-medium"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="w-4 h-4"
        />
        Back to settings
      </NuxtLink>

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ isEditMode ? 'Edit admin account' : 'Create admin account' }}
        </h1>
        <p class="text-sm text-gray-500 font-medium">
          {{ isEditMode ? 'Update admin account details' : 'Basic information for the new admin account' }}
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form
          class="space-y-6"
          @submit.prevent="handleSubmit"
        >
          <UFormField
            label="Name"
            name="name"
            :ui="{ label: 'text-gray-700 font-semibold text-sm mb-2 block' }"
            :error="formErrors.name"
          >
            <UInput
              v-model="formData.name"
              placeholder="Enter full name"
              size="lg"
              class="w-full"
              icon="i-lucide-user"
              :ui="{
                base: 'rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-[#003357] focus:border-transparent transition-all duration-200',
                placeholder: 'text-gray-400'
              }"
            />
          </UFormField>

          <UFormField
            label="Email address"
            name="email"
            :ui="{ label: 'text-gray-700 font-semibold text-sm mb-2 block' }"
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
                base: 'rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-[#003357] focus:border-transparent transition-all duration-200',
                placeholder: 'text-gray-400'
              }"
            />
          </UFormField>

          <UFormField
            label="Password"
            name="password"
            :ui="{ label: 'text-gray-700 font-semibold text-sm mb-2 block' }"
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
                base: 'rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-[#003357] focus:border-transparent transition-all duration-200',
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
            :ui="{ label: 'text-gray-700 font-semibold text-sm mb-2 block' }"
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
                base: 'rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-[#003357] focus:border-transparent transition-all duration-200',
                placeholder: 'text-gray-400'
              }"
            />
          </UFormField>

          <UFormField
            label="Role"
            name="role"
            :ui="{ label: 'text-gray-700 font-semibold text-sm mb-2 block' }"
            :error="formErrors.role"
          >
            <USelectMenu
              v-model="formData.role"
              :options="roles"
              option-attribute="value"
              size="lg"
              class="w-full"
              icon="i-lucide-shield"
              :ui="{
                base: 'rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-[#003357] focus:border-transparent transition-all duration-200',
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
