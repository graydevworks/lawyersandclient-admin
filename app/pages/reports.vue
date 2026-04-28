<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('All')

const submissions = [
  { id: 1, title: 'Fraudulent activity - false credentials', reporter: 'Tunde Bakare', against: 'Emeka Nwachukwu', time: '6 hours ago', active: true },
  { id: 2, title: 'Harassment in chat messages', reporter: 'Aisha Musa', against: 'Kunle Adewale', time: '1 day ago', active: false },
  { id: 3, title: 'Incorrect legal advice given', reporter: 'Biodun Adeyemi', against: 'Seun Bello', time: '1 day ago', active: false },
  { id: 4, title: 'No-show for scheduled consultation', reporter: 'Ngozi Chukwu', against: 'Dami Okonkwo', time: '1 day ago', active: false },
  { id: 5, title: 'Harassment in chat messages', reporter: 'Aisha Musa', against: 'Kunle Adewale', time: '1 day ago', active: false },
  { id: 6, title: 'Harassment in chat messages', reporter: 'Aisha Musa', against: 'Kunle Adewale', time: '1 day ago', active: false },
  { id: 7, title: 'Harassment in chat messages', reporter: 'Aisha Musa', against: 'Kunle Adewale', time: '1 day ago', active: false }
]

const timeline = [
  { status: 'Report submitted by Tunde Bakare', time: '31 Mar 2026, 10:14am' },
  { status: 'Assigned to admin for review', time: '31 Mar 2026, 10:16am' },
  { status: 'Stage advanced to Action — user suspended pending investigation', time: '31 Mar 2026, 10:14am' },
  { status: 'Stage advanced — Case closed', time: '31 Mar 2026, 10:14am' }
]

const resolutionNote = ref('Account suspended')
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 leading-tight">
        Reports & Disputes
      </h1>
      <p class="text-sm text-gray-500">
        9 open • 2 escalated
      </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 items-start">
      <!-- Left side: Submissions list -->
      <UCard
        class="lg:w-[400px] flex-shrink-0"
        :ui="{ body: { padding: 'p-4 sm:p-4' } }"
      >
        <h2 class="font-bold text-gray-900 text-lg mb-4">
          Submissions
        </h2>

        <UInput
          icon="i-lucide-search"
          placeholder="Search reports..."
          class="mb-6"
        />

        <div class="flex gap-2 mb-4 border-b border-gray-100 pb-2">
          <button
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="activeTab === 'All' ? 'bg-[#EFF6FF] text-[#003357]' : 'text-gray-500 hover:text-gray-900'"
            @click="activeTab = 'All'"
          >
            All
          </button>
          <button
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="activeTab === 'New' ? 'bg-[#EFF6FF] text-[#003357]' : 'text-gray-500 hover:text-gray-900'"
            @click="activeTab = 'New'"
          >
            New
          </button>
          <button
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="activeTab === 'Review' ? 'bg-[#EFF6FF] text-[#003357]' : 'text-gray-500 hover:text-gray-900'"
            @click="activeTab = 'Review'"
          >
            Review
          </button>
        </div>

        <div class="space-y-1 -mx-4">
          <button
            v-for="sub in submissions"
            :key="sub.id"
            class="w-full text-left p-4 hover:bg-gray-50 transition-colors border-l-2"
            :class="sub.active ? 'bg-[#F8FAFC] border-[#003357]' : 'border-transparent'"
          >
            <h3 class="font-bold text-sm text-gray-900 line-clamp-1">
              {{ sub.title }}
            </h3>
            <p class="text-xs text-gray-500 mt-1 line-clamp-1">
              Reported by {{ sub.reporter }} • against {{ sub.against }}
            </p>
            <p class="text-xs text-gray-400 mt-2">
              {{ sub.time }}
            </p>
          </button>
        </div>
      </UCard>

      <!-- Right side: Report Details -->
      <div class="flex-1 w-full space-y-6">
        <UCard class="w-full">
          <div class="pb-6 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-900">
              Fraudulent activity — false credentials
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              RPT-0041 • Fraud • Submitted 31 Mar 2026, 2:10pm
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gray-100">
            <!-- Reporter -->
            <div class="space-y-4">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Reporter
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500">Name</span>
                  <span class="font-medium text-gray-900">Tunde Bakare</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500">Type</span>
                  <span class="font-medium text-gray-900">Client</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500">Submitted</span>
                  <span class="font-medium text-red-500">31 Mar 2026, 2:10pm</span>
                </div>
              </div>
            </div>

            <!-- Applicant -->
            <div class="space-y-4">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Applicant
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500">Name</span>
                  <span class="font-medium text-gray-900">Emeka Nwachukwu</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500">Type</span>
                  <span class="font-medium text-gray-900">Lawyer</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-500">Priority</span>
                  <UBadge
                    color="gray"
                    variant="solid"
                    class="rounded-full bg-gray-100 text-gray-600 font-medium px-3"
                  >
                    Normal
                  </UBadge>
                </div>
              </div>
            </div>
          </div>

          <div class="py-6 space-y-4 border-b border-gray-100">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Description
            </h3>
            <p class="text-sm font-medium text-gray-900 leading-relaxed">
              Mr Emeka claimed to be a senior partner at a firm that does not exist, and requested upfront payment outside the platform before any consultation.
            </p>
          </div>

          <div class="py-6 space-y-6 border-b border-gray-100">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Case timeline
            </h3>

            <div class="space-y-6 relative ml-1">
              <div class="absolute top-2 bottom-2 left-[5px] w-[2px] bg-gray-100" />

              <div
                v-for="(event, idx) in timeline"
                :key="idx"
                class="relative pl-6"
              >
                <div class="absolute left-0 top-[6px] w-[12px] h-[12px] rounded-full bg-[#003357] border-2 border-white z-10" />
                <p class="text-sm font-medium text-gray-900">
                  {{ event.status }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ event.time }}
                </p>
              </div>
            </div>
          </div>

          <div class="pt-6 space-y-4">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Resolution notes
            </h3>
            <p class="text-xs text-gray-500">
              State action taken
            </p>

            <UInput
              v-model="resolutionNote"
              class="w-full"
            />

            <div class="flex justify-end pt-2">
              <UButton
                color="white"
                variant="solid"
                class="shadow-sm border border-[#003357] text-[#003357] hover:bg-[#EEF6FF]"
              >
                Save note
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
