<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')

const practiceAreas = ref([
  { id: 1, name: 'Litigation & Disputes', lawyers: 186, active: true },
  { id: 2, name: 'Criminal & Traffic', lawyers: 186, active: true },
  { id: 3, name: 'Intellectual Property', lawyers: 186, active: true },
  { id: 4, name: 'Practice Management', lawyers: 186, active: true },
  { id: 5, name: 'Estate Planning', lawyers: 186, active: true },
  { id: 6, name: 'Immigration', lawyers: 186, active: true },
  { id: 7, name: 'Family', lawyers: 186, active: true },
  { id: 8, name: 'Insolvency', lawyers: 186, active: true },
  { id: 9, name: 'Agency', lawyers: 186, active: true },
  { id: 10, name: 'Environment & Planning', lawyers: 186, active: true },
  { id: 11, name: 'Employment Law', lawyers: 186, active: true },
  { id: 12, name: 'Insolvency', lawyers: 186, active: true },
  { id: 13, name: 'Personal Injury & workers', lawyers: 186, active: true },
  { id: 14, name: 'Agency', lawyers: 186, active: true },
  { id: 15, name: 'Commercial Law', lawyers: 186, active: true },
  { id: 16, name: 'Conveyancing', lawyers: 186, active: true }
])
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Top Bar -->
    <div class="flex items-center justify-between">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Search practice areas"
        class="w-[400px]"
        size="md"
        :ui="{ icon: { leading: { pointer: '' } }, rounded: 'rounded-full' }"
        color="white"
      />
      <UButton
        color="primary"
        class="bg-[#003357] hover:bg-[#004474] text-white px-5 py-2.5 rounded-lg text-sm font-medium"
        icon="i-heroicons-plus"
      >
        Add Practice area
      </UButton>
    </div>

    <!-- Practice Areas Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="area in practiceAreas"
        :key="area.id"
        class="bg-white rounded-2xl p-5 flex flex-col gap-[12.5px]"
      >
        <div class="flex items-start justify-between">
          <h3 class="text-[14px] font-medium text-gray-900 pr-2">
            {{ area.name }}
          </h3>
          <USwitch
            v-model="area.active"
            class="shrink-0"
            :ui="{ base: 'bg-[#013355]! w-[45.71428680419922px]', thumb: 'w-[26px]' }"
          />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[14px] text-[#8A9BB1] font-normal">
            {{ area.lawyers }} lawyers
          </span>
          <button class="text-[14px] font-semibold text-[#003357] hover:text-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between text-sm text-gray-500 pt-2">
      <span>Showing 1–10 of 20 practice areas</span>
      <div class="flex items-center gap-1.5">
        <UButton
          variant="ghost"
          color="gray"
          size="sm"
          icon="i-heroicons-arrow-left"
          class="font-medium text-gray-500"
        >
          Prev
        </UButton>
        <UButton
          v-for="page in 5"
          :key="page"
          :variant="page === 1 ? 'solid' : 'ghost'"
          :color="page === 1 ? 'primary' : 'gray'"
          size="sm"
          class="w-8 h-8 flex items-center justify-center rounded-md font-medium"
          :class="page === 1 ? 'bg-[#003357] hover:bg-[#004474] text-white' : 'text-gray-500'"
        >
          {{ page }}
        </UButton>
        <UButton
          variant="ghost"
          color="gray"
          size="sm"
          trailing-icon="i-heroicons-arrow-right"
          class="font-medium text-gray-500"
        >
          Next
        </UButton>
      </div>
    </div>
  </div>
</template>
