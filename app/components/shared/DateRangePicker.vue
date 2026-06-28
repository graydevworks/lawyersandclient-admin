<script setup lang="ts">
/**
 * Unified date range picker — inline dropdown or header pill button.
 */
const props = withDefaults(defineProps<{
  from?: string
  to?: string
  variant?: 'inline' | 'header'
  label?: string
}>(), {
  variant: 'inline',
  label: 'Select dates'
})

const emit = defineEmits<{
  'update:from': [value: string]
  'update:to': [value: string]
  apply: []
  clear: []
}>()

const isOpen = ref(false)
const draftFrom = ref('')
const draftTo = ref('')

const wrapperRef = ref<HTMLElement | null>(null)

watch(() => props.from, (v) => { draftFrom.value = v || '' }, { immediate: true })
watch(() => props.to, (v) => { draftTo.value = v || '' }, { immediate: true })

const formatDisplayDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const displayLabel = computed(() => {
  if (props.from && props.to) {
    return `${formatDisplayDate(props.from)} - ${formatDisplayDate(props.to)}`
  }
  if (props.from) return formatDisplayDate(props.from)
  return props.label
})

const toggle = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    draftFrom.value = props.from || ''
    draftTo.value = props.to || ''
  }
}

const apply = () => {
  emit('update:from', draftFrom.value)
  emit('update:to', draftTo.value)
  emit('apply')
  isOpen.value = false
}

const clear = () => {
  draftFrom.value = ''
  draftTo.value = ''
  emit('update:from', '')
  emit('update:to', '')
  emit('clear')
  isOpen.value = false
}

const onClickOutside = (e: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div
    ref="wrapperRef"
    class="relative"
  >
    <UButton
      icon="i-lucide-calendar"
      color="neutral"
      :variant="variant === 'header' ? 'solid' : 'outline'"
      class="shadow-sm bg-white hover:bg-gray-100 focus:bg-gray-100 text-[#222222] rounded-full"
      :class="variant === 'header' ? 'p-[12.5px]' : 'px-4 py-[7px]'"
      @click.stop="toggle"
    >
      {{ displayLabel }}
      <template #trailing>
        <UIcon
          name="i-lucide-chevron-down"
          class="ml-2 w-4 h-4 transition-transform"
          :class="isOpen ? 'rotate-180' : ''"
        />
      </template>
    </UButton>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 z-30 w-[300px] bg-white rounded-2xl border border-gray-100 shadow-xl p-5 space-y-4"
        @click.stop
      >
        <div class="flex items-center gap-2 pb-1 border-b border-gray-100">
          <div class="w-8 h-8 rounded-lg bg-[#003357]/10 flex items-center justify-center">
            <UIcon
              name="i-lucide-calendar-range"
              class="w-4 h-4 text-[#003357]"
            />
          </div>
          <p class="text-sm font-semibold text-gray-900">
            Date range
          </p>
        </div>

        <div class="space-y-3">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</label>
            <UInput
              v-model="draftFrom"
              type="date"
              size="md"
              class="w-full"
              :ui="{ base: 'rounded-xl bg-gray-50 border-gray-200' }"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</label>
            <UInput
              v-model="draftTo"
              type="date"
              size="md"
              class="w-full"
              :ui="{ base: 'rounded-xl bg-gray-50 border-gray-200' }"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <UButton
            block
            size="sm"
            class="bg-[#003357] hover:bg-[#004474] text-white font-semibold rounded-xl"
            @click="apply"
          >
            Apply
          </UButton>
          <UButton
            v-if="from || to"
            block
            size="sm"
            color="neutral"
            variant="outline"
            class="rounded-xl border-gray-200"
            @click="clear"
          >
            Clear
          </UButton>
        </div>
      </div>
    </Transition>
  </div>
</template>
