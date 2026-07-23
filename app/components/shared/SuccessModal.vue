<script setup lang="ts">
import StatusModal from './StatusModal.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description: string
    buttonText?: string
    secondaryButtonText?: string
    showClose?: boolean
  }>(),
  {
    buttonText: 'Complete',
    showClose: true
  }
)

const emit = defineEmits(['update:modelValue', 'complete', 'secondary'])
</script>

<template>
  <StatusModal
    :model-value="props.modelValue"
    type="success"
    :title="props.title"
    :description="props.description"
    :button-text="props.buttonText"
    :secondary-button-text="props.secondaryButtonText"
    :show-close="props.showClose"
    @update:model-value="val => emit('update:modelValue', val)"
    @complete="emit('complete')"
    @secondary="emit('secondary')"
  />
</template>
