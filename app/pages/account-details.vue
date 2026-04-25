<script setup lang="ts">
const firstName = ref('Heritage')
const lastName = ref('Atiba')
const email = ref('atibaheritage8@gmail.com')
const role = ref('Ops Admin')
const phone = ref('+234 8137496017')

const roles = ['Super Admin', 'Ops Admin', 'Support Admin']

const handleContinue = () => {
  navigateTo('/settings')
}
</script>

<template>
  <div class="max-w-2xl mx-auto py-12 px-4">
    <NuxtLink
      to="/settings"
      class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-8 transition-colors"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="w-4 h-4"
      />
      Back to settings
    </NuxtLink>

    <div class="mb-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Account details
      </h1>
      <p class="text-sm text-gray-500 font-medium">
        Basic information for the new admin account
      </p>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="handleContinue"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormGroup
          label="First Name"
          name="firstName"
          :ui="{ label: 'text-gray-400 font-normal text-xs mb-1.5 block' }"
        >
          <UInput
            v-model="firstName"
            placeholder="First Name"
            size="xl"
            class="w-full"
            :ui="{
              base: 'rounded-lg bg-white border-gray-200 focus:ring-[#003357]'
            }"
          />
        </UFormGroup>

        <UFormGroup
          label="Last Name"
          name="lastName"
          :ui="{ label: 'text-gray-400 font-normal text-xs mb-1.5 block' }"
        >
          <UInput
            v-model="lastName"
            placeholder="Last Name"
            size="xl"
            class="w-full"
            :ui="{
              base: 'rounded-lg bg-white border-gray-200 focus:ring-[#003357]'
            }"
          />
        </UFormGroup>
      </div>

      <UFormGroup
        label="Email address"
        name="email"
        :ui="{ label: 'text-gray-400 font-normal text-xs mb-1.5 block' }"
      >
        <UInput
          v-model="email"
          placeholder="Email address"
          size="xl"
          class="w-full"
          :ui="{
            base: 'rounded-lg bg-white border-gray-200 focus:ring-[#003357]'
          }"
        />
      </UFormGroup>

      <UFormGroup
        label="Role"
        name="role"
        :ui="{ label: 'text-gray-400 font-normal text-xs mb-1.5 block' }"
      >
        <USelectMenu
          v-model="role"
          :options="roles"
          size="xl"
          class="w-full"
          :ui="{
            base: 'rounded-lg bg-white border-gray-200 focus:ring-[#003357]'
          }"
        />
      </UFormGroup>

      <UFormGroup
        label="Phone number (Optional)"
        name="phone"
        :ui="{ label: 'text-gray-400 font-normal text-xs mb-1.5 block' }"
      >
        <UInput
          v-model="phone"
          placeholder="Phone number"
          size="xl"
          class="w-full"
          :ui="{
            base: 'rounded-lg bg-white border-gray-200 focus:ring-[#003357]'
          }"
        />
      </UFormGroup>

      <div class="pt-4 flex justify-end">
        <UButton
          type="submit"
          size="xl"
          class="bg-[#003357] hover:bg-[#002244] text-white font-bold rounded-lg px-8 py-3 transition-all"
        >
          Continue
        </UButton>
      </div>
    </form>
  </div>
</template>
