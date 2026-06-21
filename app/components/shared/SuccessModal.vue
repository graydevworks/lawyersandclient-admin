<script setup lang="ts">
/**
 * SuccessModal — green checkmark confirmation modal.
 * Matches the app's success feedback pattern.
 * On mobile/tablet (< md): slides up from the bottom as a bottom sheet.
 * On desktop (>= md): centered dialog.
 */
const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  description: string
  buttonText?: string
  showClose?: boolean
}>(), {
  buttonText: 'Complete',
  showClose: true
})

const emit = defineEmits(['update:modelValue', 'complete'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const handleComplete = () => {
  isOpen.value = false
  emit('complete')
}

const close = () => {
  isOpen.value = false
}

const contentClasses = [
  'max-w-[440px]',
  'rounded-t-[16px] md:rounded-[16px]',
  'overflow-hidden shadow-xl',
  'fixed bottom-0 left-0 right-0 translate-x-0 translate-y-0',
  'w-full',
  'max-h-[85vh] overflow-y-auto',
  'md:bottom-auto md:left-auto md:right-auto md:translate-x-[-50%] md:translate-y-[-50%]',
  'md:top-1/2 md:w-auto'
].join(' ')
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{ content: contentClasses, overlay: 'z-[100]', backdrop: 'z-[100]' }"
  >
    <div class="bg-white px-6 py-8 flex flex-col items-center text-center relative">
      <!-- Close button -->
      <UButton
        v-if="showClose"
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="sm"
        class="rounded-full absolute top-4 right-4"
        @click="close"
      />

      <!-- Success Icon -->
      <div class="w-[64px] h-[64px] rounded-full bg-[#22C55E] flex items-center justify-center mb-5 animate-[bounceIn_0.5s_ease-out]">
        <UIcon
          name="i-lucide-check"
          class="w-8 h-8 text-white"
        />
      </div>

      <!-- Title -->
      <h2 class="text-[20px] font-bold text-gray-900 mb-2">
        {{ title }}
      </h2>

      <!-- Description -->
      <p class="text-[14px] text-gray-500 leading-relaxed mb-8 max-w-[340px]">
        {{ description }}
      </p>

      <!-- Complete Button -->
      <UButton
        block
        class="bg-[#003357] hover:bg-[#004474] text-white font-semibold py-3 rounded-[8px] text-[14px]"
        @click="handleComplete"
      >
        {{ buttonText }}
      </UButton>
    </div>
  </UModal>
</template>
