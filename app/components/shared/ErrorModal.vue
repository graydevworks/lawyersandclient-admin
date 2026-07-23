<script setup lang="ts">
import StatusModal from './StatusModal.vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  description?: string
  buttonText?: string
  showClose?: boolean
}>(), {
  title: 'Error!',
  buttonText: 'Dismiss',
  showClose: true
})

const emit = defineEmits(['update:modelValue', 'complete'])
</script>

<template>
  <StatusModal
    :model-value="props.modelValue"
    type="error"
    :title="props.title"
    :description="props.description"
    :button-text="props.buttonText"
    :show-close="props.showClose"
    @update:model-value="val => emit('update:modelValue', val)"
    @complete="emit('complete')"
  />
</template>
