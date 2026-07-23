<script setup lang="ts">
/**
 * AddPracticeAreaModal — form modal for creating a new practice area.
 * Follows the app's form modal pattern: title + input + cancel/save actions.
 */
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const name = ref('')

const handleSave = () => {
  if (!name.value.trim()) return
  emit('save', name.value.trim())
  name.value = ''
}

const handleCancel = () => {
  name.value = ''
  isOpen.value = false
}

const handleClose = () => {
  name.value = ''
}
</script>

<template>
  <SharedBaseModal
    v-model="isOpen"
    title="Add Practice Area"
    @update:model-value="handleClose"
  >
    <!-- Form -->
    <div class="mt-4 space-y-4">
      <div>
        <label class="block text-[14px] font-normal text-gray-500 mb-2">
          Name
        </label>
        <UInput
          v-model="name"
          placeholder="e.g Environmental law"
          size="lg"
          class="w-full"
          :ui="{ base: 'rounded-[8px] border border-[#E5E7EB] ring-0 px-4 py-3 text-[14px] font-light' }"
          @keyup.enter="handleSave"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 mt-6">
      <UButton
        variant="outline"
        color="neutral"
        class="border border-[#ECECEC] text-[#111111] rounded-[8px] px-5 py-2.5 text-[14px] font-semibold hover:bg-gray-50 px-3 ring-0"
        @click="handleCancel"
      >
        Cancel
      </UButton>
      <UButton
        class="bg-[#003357] disabled:bg-[#003357] hover:bg-[#004474] text-white rounded-[8px] px-5 py-2.5 text-[14px] font-semibold"
        :disabled="!name.trim()"
        @click="handleSave"
      >
        Save
      </UButton>
    </div>
  </SharedBaseModal>
</template>
