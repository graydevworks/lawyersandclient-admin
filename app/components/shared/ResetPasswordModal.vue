<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  email: string
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})
</script>

<template>
  <SharedConfirmationModal
    v-model="isOpen"
    title="Reset Password"
    :description="`Send a password reset link to the user's registered email: ${email}`"
    icon="i-lucide-key-round"
    confirm-text="Confirm"
    cancel-text="Cancel"
    @confirm="emit('confirm')"
    @cancel="isOpen = false"
  />
</template>
