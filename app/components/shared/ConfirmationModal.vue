<script setup lang="ts">
import { modalContentClasses } from './modal/useModalLayout'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  description?: string
  icon?: string
  iconClass?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'primary' | 'danger'
  loading?: boolean
  confirmDisabled?: boolean
  maxWidth?: string
  showClose?: boolean
}>(), {
  icon: 'i-lucide-help-circle',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmColor: 'primary',
  maxWidth: 'max-w-[480px]',
  showClose: true
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const close = () => {
  isOpen.value = false
  emit('cancel')
}

const confirm = () => {
  emit('confirm')
}

const confirmClass = computed(() =>
  props.confirmColor === 'danger'
    ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
    : 'bg-[#003357] hover:bg-[#004474] text-white'
)
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{ content: modalContentClasses(maxWidth), overlay: 'bg-black/40 z-[4000]' }"
  >
    <template #content>
      <div class="bg-white px-6 pt-6 pb-6">
        <div class="flex items-start justify-between mb-4">
          <div
            class="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center shrink-0"
            :class="iconClass"
          >
            <UIcon
              :name="icon"
              class="w-5 h-5 text-gray-700"
            />
          </div>
          <UButton
            v-if="showClose"
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-full -mr-1 text-gray-400"
            @click="close"
          />
        </div>

        <h2 class="text-[20px] font-bold text-gray-900 mb-2">
          {{ title }}
        </h2>

        <p
          v-if="description"
          class="text-[14px] text-gray-500 leading-relaxed mb-5"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </p>

        <div class="mb-6 z-[9999999]">
          <slot />
        </div>

        <div class="flex gap-3">
          <UButton
            block
            variant="outline"
            color="neutral"
            class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 rounded-[8px] text-[14px] hover:bg-gray-50"
            :disabled="loading"
            @click="close"
          >
            {{ cancelText }}
          </UButton>
          <UButton
            block
            class="font-semibold py-3 rounded-[8px] text-[14px]"
            :class="confirmClass"
            :loading="loading"
            :disabled="confirmDisabled || loading"
            @click="confirm"
          >
            {{ confirmText }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
