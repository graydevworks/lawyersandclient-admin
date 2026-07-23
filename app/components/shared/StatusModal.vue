<script setup lang="ts">
import { modalContentClasses, statusIcons, type StatusType } from './modal/useModalLayout'

interface ActionButton {
  label: string
  variant?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  type?: StatusType
  title: string
  description?: string
  buttonText?: string
  secondaryButtonText?: string
  showClose?: boolean
  actions?: ActionButton[]
}>(), {
  type: 'success',
  buttonText: 'Complete',
  showClose: true
})

const emit = defineEmits(['update:modelValue', 'complete', 'secondary'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const close = () => {
  isOpen.value = false
}

const handleComplete = () => {
  isOpen.value = false
  emit('complete')
}

const handleSecondary = () => {
  emit('secondary')
}

const primaryBtnClass = computed(() => {
  if (props.type === 'error') return 'bg-[#DC2626] hover:bg-[#B91C1C]'
  if (props.type === 'warning') return 'bg-[#F59E0B] hover:bg-[#D97706]'
  if (props.type === 'info') return 'bg-[#2563EB] hover:bg-[#1D4ED8]'
  return 'bg-[#003357] hover:bg-[#004474]'
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      content: modalContentClasses(),
      overlay: 'bg-black/40 z-[9999]'
    }"
  >
    <template #content>
      <div class="bg-white px-6 py-8 flex flex-col items-center text-center relative">
        <UButton
          v-if="showClose"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          class="rounded-full absolute top-4 right-4"
          @click="close"
        />

        <div class="w-[96px] h-[96px] flex items-center justify-center mb-5 animate-[bounceIn_0.5s_ease-out]">
          <img
            :src="statusIcons[type]"
            :alt="type"
            class="w-full h-full object-contain"
          >
        </div>

        <h2 class="text-[20px] font-bold text-gray-900 mb-2 leading-snug">
          {{ title }}
        </h2>

        <p
          v-if="description"
          class="text-[14px] text-gray-500 leading-relaxed mb-8 max-w-[340px]"
        >
          {{ description }}
        </p>

        <div
          v-if="actions?.length"
          class="flex gap-3 w-full"
        >
          <UButton
            v-for="(action, idx) in actions"
            :key="idx"
            block
            class="font-semibold py-3 rounded-[8px] text-[14px]"
            :class="action.variant === 'secondary'
              ? 'border border-[#E5E7EB] text-gray-900 bg-white hover:bg-gray-50'
              : action.variant === 'danger'
                ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
                : `${primaryBtnClass} text-white`"
            @click="action.onClick?.()"
          >
            {{ action.label }}
          </UButton>
        </div>

        <div
          v-else
          class="flex gap-3 w-full"
          :class="secondaryButtonText ? '' : ''"
        >
          <UButton
            v-if="secondaryButtonText"
            block
            variant="outline"
            color="neutral"
            class="border border-[#E5E7EB] text-gray-900 font-semibold py-3 rounded-[8px] text-[14px] hover:bg-gray-50"
            @click="handleSecondary"
          >
            {{ secondaryButtonText }}
          </UButton>
          <UButton
            block
            class="text-white font-semibold py-3 rounded-[8px] text-[14px]"
            :class="primaryBtnClass"
            @click="handleComplete"
          >
            {{ buttonText }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.5); }
  60% { transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
