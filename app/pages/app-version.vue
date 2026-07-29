<script setup lang="ts">
import * as v from 'valibot'
import { onMounted, ref } from 'vue'

definePageMeta({ middleware: 'auth' })

const { getAppVersionsByRole, createAppVersion, updating } = useAppVersion()

// --- Data ---
interface AppVersionInfo {
  appVersion: string
  forceUpdate: boolean
}

const clientVersion = ref<AppVersionInfo>({ appVersion: '', forceUpdate: false })
const lawyerVersion = ref<AppVersionInfo>({ appVersion: '', forceUpdate: false })

const clientLoading = ref(true)
const lawyerLoading = ref(true)

// --- Modal State ---
const showCreateModal = ref(false)
const isSubmitting = ref(false)
const selectedRole = ref<'client' | 'lawyer'>('client')

// Form data
const formData = ref({
  appVersion: '',
  forceUpdate: false
})

// Form errors
const formErrors = ref({
  appVersion: ''
})

// Confirmation modal
const showConfirmModal = ref(false)

// Success/Error modals
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// --- Valibot Schema ---
const appVersionSchema = v.object({
  appVersion: v.pipe(v.string(), v.minLength(1, 'App version is required')),
  forceUpdate: v.boolean()
})

// --- Fetch Functions ---
const fetchClientVersion = async () => {
  clientLoading.value = true
  try {
    const result = await getAppVersionsByRole('client')
    if (result.success && result.data) {
      clientVersion.value = result.data as AppVersionInfo
    }
  } catch (err) {
    console.error('Failed to fetch client version:', err)
  } finally {
    clientLoading.value = false
  }
}

const fetchLawyerVersion = async () => {
  lawyerLoading.value = true
  try {
    const result = await getAppVersionsByRole('lawyer')
    if (result.success && result.data) {
      lawyerVersion.value = result.data as AppVersionInfo
    }
  } catch (err) {
    console.error('Failed to fetch lawyer version:', err)
  } finally {
    lawyerLoading.value = false
  }
}

// --- Open Create Modal ---
const openCreateModal = (role: 'client' | 'lawyer') => {
  selectedRole.value = role
  formData.value = {
    appVersion: '',
    forceUpdate: false
  }
  formErrors.value = {
    appVersion: ''
  }
  showCreateModal.value = true
}

// --- Handle Form Submit ---
const handleFormSubmit = () => {
  formErrors.value = {
    appVersion: ''
  }

  const result = v.safeParse(appVersionSchema, {
    appVersion: formData.value.appVersion,
    forceUpdate: formData.value.forceUpdate
  })

  if (!result.success) {
    const errors: Record<string, string> = {}
    for (const issue of result.issues) {
      const pathKey = issue.path?.[0]
      if (pathKey) {
        const field = pathKey.key as string
        errors[field] = issue.message
      }
    }
    formErrors.value = { ...formErrors.value, ...errors }
    return
  }

  showConfirmModal.value = true
}

// --- Confirm Create ---
const confirmCreate = async () => {
  showConfirmModal.value = false
  isSubmitting.value = true

  try {
    const payload = {
      [selectedRole.value === 'client' ? 'client_app_version' : 'lawyer_app_version']: formData.value.appVersion,
      [selectedRole.value === 'client' ? 'client_force_update' : 'lawyer_force_update']: formData.value.forceUpdate
    }

    const result = await createAppVersion(payload)
    console.log(result)

    if (result.success && (result.data.status == '200' || result.data.status == 200)) {
      const message = (result.data as Record<string, unknown>)?.message as string || 'App version created successfully!'
      successMessage.value = message
      showSuccessModal.value = true
      showCreateModal.value = false

      // Refresh the specific card
      if (selectedRole.value === 'client') {
        await fetchClientVersion()
      } else {
        await fetchLawyerVersion()
      }
    } else {
      errorMessage.value = result.data.message
      showErrorModal.value = true
    }
  } catch {
    errorMessage.value = 'An unexpected error occurred'
    showErrorModal.value = true
  } finally {
    isSubmitting.value = false
  }
}

// --- Mount ---
onMounted(() => {
  Promise.all([fetchClientVersion(), fetchLawyerVersion()])
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-[16px] font-semibold text-gray-900 leading-tight">
        App Version
      </h1>
      <p class="text-sm text-gray-400 mt-0.5">
        Manage app versions for clients and lawyers
      </p>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Client App Version Card -->
      <UCard class="rounded-[18px] border-0 ring-0">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-[14px] bg-[#003357]/8 flex items-center justify-center">
                <UIcon
                  name="i-lucide-users"
                  class="w-6 h-6 text-[#003357]"
                />
              </div>
              <div>
                <h3
                  class="text-[16px] font-semibold text-gray-900"
                >
                  Client App Version
                </h3>
                <p
                  class="text-[12px] text-gray-400 mt-0.5"
                >
                  Current version
                </p>
              </div>
            </div>
          </div>

          <!-- Skeleton -->
          <div
            v-if="clientLoading"
            class="space-y-3"
          >
            <USkeleton class="h-8 w-32" />
            <USkeleton class="h-6 w-24" />
            <USkeleton class="h-10 w-full mt-4" />
          </div>

          <!-- Content -->
          <div
            v-else
            class="space-y-4"
          >
            <div>
              <p class="text-[12px] text-gray-400 mb-1">
                App Version
              </p>
              <p class="text-[24px] font-bold text-gray-900">
                {{ clientVersion.appVersion || '-' }}
              </p>
            </div>

            <div>
              <p class="text-[12px] text-gray-400 mb-1">
                Force Update
              </p>
              <UBadge
                :color="clientVersion.forceUpdate ? 'error' : 'success'"
                variant="subtle"
                class="rounded-full px-3 py-1 text-[13px] font-medium"
              >
                {{ clientVersion.forceUpdate ? 'Yes' : 'No' }}
              </UBadge>
            </div>

            <UButton
              block
              class="bg-[#003357] hover:bg-[#004474] text-white font-semibold py-2.5 rounded-[8px] text-[14px] mt-4"
              @click="openCreateModal('client')"
            >
              Create New Version
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Lawyer App Version Card -->
      <UCard class="rounded-[18px] border-0 ring-0" v-if="false">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-[14px] bg-[#003357]/8 flex items-center justify-center">
                <UIcon
                  name="i-lucide-briefcase"
                  class="w-6 h-6 text-[#003357]"
                />
              </div>
              <div>
                <h3
                  class="text-[16px] font-semibold text-gray-900"
                >
                  Lawyer App Version
                </h3>
                <p
                  class="text-[12px] text-gray-400 mt-0.5"
                >
                  Current version
                </p>
              </div>
            </div>
          </div>

          <!-- Skeleton -->
          <div
            v-if="lawyerLoading"
            class="space-y-3"
          >
            <USkeleton class="h-8 w-32" />
            <USkeleton class="h-6 w-24" />
            <USkeleton class="h-10 w-full mt-4" />
          </div>

          <!-- Content -->
          <div
            v-else
            class="space-y-4"
          >
            <div>
              <p
                class="text-[12px] text-gray-400 mb-1"
              >
                App Version
              </p>
              <p
                class="text-[24px] font-bold text-gray-900"
              >
                {{ lawyerVersion.appVersion || '-' }}
              </p>
            </div>

            <div>
              <p
                class="text-[12px] text-gray-400 mb-1"
              >
                Force Update
              </p>
              <UBadge
                :color="lawyerVersion.forceUpdate ? 'error' : 'success'"
                variant="subtle"
                class="rounded-full px-3 py-1 text-[13px] font-medium"
              >
                {{ lawyerVersion.forceUpdate ? 'Yes' : 'No' }}
              </UBadge>
            </div>

            <UButton
              block
              class="bg-[#003357] hover:bg-[#004474] text-white font-semibold py-2.5 rounded-[8px] text-[14px] mt-4"
              @click="openCreateModal('lawyer')"
            >
              Create New Version
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Create Modal -->
    <UModal
      v-model:open="showCreateModal"
      :ui="{ content: 'max-w-[480px] rounded-[16px] overflow-hidden shadow-xl' }"
    >
      <template #content>
        <div class="bg-white px-6 pt-6 pb-6">
          <!-- Modal header -->
          <div class="flex items-start justify-between mb-5">
            <div>
              <div class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center mb-3">
                <UIcon
                  name="i-lucide-package-plus"
                  class="w-5 h-5 text-gray-700"
                />
              </div>
              <h2 class="text-[20px] font-bold text-gray-900">
                New {{ selectedRole === 'client' ? 'Client' : 'Lawyer' }} App Version
              </h2>
              <p class="text-[13px] text-gray-400 mt-0.5">
                Create new app version for {{ selectedRole === 'client' ? 'clients' : 'lawyers' }}.
              </p>
            </div>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              class="rounded-full -mr-1 text-gray-400 mt-1"
              @click="showCreateModal = false"
            />
          </div>

          <!-- Form -->
          <div class="space-y-4 mb-6">
            <div>
              <label class="text-[13px] font-semibold text-gray-700 mb-1.5 block">
                App Version <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="formData.appVersion"
                placeholder="e.g. 2.5.0"
                size="lg"
                :ui="{ base: `rounded-[8px] w-full ${formErrors.appVersion ? 'ring-red-500' : ''}` }"
                :class="{ 'ring-0 w-full': formErrors.appVersion }"
                @update:model-value="formErrors.appVersion = ''"
              />
              <p
                v-if="formErrors.appVersion"
                class="text-[12px] text-red-500 mt-1"
              >
                {{ formErrors.appVersion }}
              </p>
            </div>

            <div>
              <label class="text-[13px] font-semibold text-gray-700 mb-1.5 block">
                Force Update
              </label>
              <USelect
                v-model="formData.forceUpdate"
                :items="[
                  { label: 'Yes', value: true },
                  { label: 'No', value: false }
                ]"
                size="lg"
                class="w-full"
                :ui="{ base: 'rounded-[8px]' }"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <UButton
              block
              variant="outline"
              color="neutral"
              class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 rounded-[8px] text-[14px] hover:bg-gray-50"
              @click="showCreateModal = false"
            >
              Cancel
            </UButton>
            <UButton
              block
              class="bg-[#003357] hover:bg-[#004474] text-white font-semibold py-3 rounded-[8px] text-[14px]"
              :loading="updating"
              @click="handleFormSubmit"
            >
              Continue
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Confirmation Modal -->
    <SharedConfirmationModal
      v-model="showConfirmModal"
      title="Create App Version"
      description="Please confirm the following details:"
      icon="i-lucide-check-circle"
      confirm-text="Create"
      cancel-text="Cancel"
      confirm-color="primary"
      :loading="isSubmitting"
      @confirm="confirmCreate"
    >
      <div class="space-y-3">
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm text-gray-600">App Version:</span>
          <span class="text-sm font-semibold text-gray-900">{{ formData.appVersion }}</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-sm text-gray-600">Force Update:</span>
          <UBadge
            :color="formData.forceUpdate ? 'error' : 'success'"
            variant="subtle"
            size="xs"
          >
            {{ formData.forceUpdate ? 'Yes' : 'No' }}
          </UBadge>
        </div>
      </div>
    </SharedConfirmationModal>

    <!-- Success Modal -->
    <SharedSuccessModal
      v-model="showSuccessModal"
      title="Success"
      :description="successMessage"
      button-text="Continue"
      @complete="showSuccessModal = false"
    />

    <!-- Error Modal -->
    <SharedErrorModal
      v-model="showErrorModal"
      title="Error"
      :description="errorMessage"
      button-text="Dismiss"
      @complete="showErrorModal = false"
    />
  </div>
</template>
