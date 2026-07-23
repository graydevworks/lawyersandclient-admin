<script setup lang="ts">
interface Props {
  icon?: string
  title?: string
  description?: string
  actionLabel?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-inbox',
  title: 'No data yet',
  description: 'There\'s nothing to display here right now.'
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <UIcon
        :name="icon"
        class="w-8 h-8 text-gray-400"
      />
    </div>
    <h3 class="text-[16px] font-semibold text-gray-900 mb-1">
      {{ title }}
    </h3>
    <p class="text-[14px] text-gray-400 max-w-[280px] mb-4">
      {{ description }}
    </p>
    <UButton
      v-if="actionLabel"
      variant="outline"
      color="neutral"
      size="sm"
      class="rounded-full"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </UButton>
  </div>
</template>
