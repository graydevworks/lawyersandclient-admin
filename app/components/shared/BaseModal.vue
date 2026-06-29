<script setup lang="ts">
/**
 * BaseModal — reusable modal shell matching the app's design system.
 * Provides: title, close button, animated overlay, and content slot.
 * On mobile/tablet (< md): slides up from the bottom as a bottom sheet.
 * On desktop (>= md): centered dialog.
 */
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  maxWidth?: string
  showClose?: boolean
}>(), {
  maxWidth: 'max-w-[500px]',
  showClose: true
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const close = () => {
  isOpen.value = false
}

const contentClasses = [
  // Base desktop: centered modal
  props.maxWidth,
  'rounded-t-[16px] md:rounded-[16px]',
  'overflow-hidden shadow-xl',
  // Mobile: bottom sheet
  'fixed bottom-0 left-0 right-0 translate-x-0 translate-y-0',
  'w-full z-[9999]',
  'max-h-[85vh] overflow-y-auto',
  // Desktop: reset to centered
  'md:bottom-auto md:left-[50%] md:translate-x-[-50%] md:translate-y-[-50%]',
  'md:top-1/2 md:w-auto'
].join(' ')
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{ content: contentClasses }"
  >
    <template #content>
      <div class="bg-white">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 class="text-[20px] font-bold text-gray-900">
            {{ title }}
          </h2>
          <UButton
            v-if="showClose"
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-full -mr-1"
            @click="close"
          />
        </div>

        <!-- Content -->
        <div class="px-6 pb-6">
          <slot />
        </div>
      </div>
    </template>
  </UModal>
</template>
