<script setup lang="ts">
import { ref, computed } from 'vue'

const submissions = [
  {
    id: 'LWY-0088',
    initials: 'NA',
    name: 'Ngozi Amadi',
    specialty: 'Commercial Law',
    location: 'Abuja',
    submittedAt: '6 hours ago',
    fullDate: '31 Mar 2026, 10:14am',
    docsUploaded: 2,
    docsTotal: 3,
    priority: 'Normal',
    email: 'ngozi.amadi@gmail.com',
    missing: 'Profile Photo',
    statusBg: 'bg-emerald-100 text-emerald-700',
    documents: [
      { name: 'Bar Certificate', type: 'PDF · 1.2 MB', status: 'Uploaded', uploaded: true },
      { name: 'Government ID', type: 'Image · 840 KB', status: 'Uploaded', uploaded: true },
      { name: 'Profile Photo', type: 'Image', status: 'Missing', uploaded: false }
    ],
    history: [
      { action: 'Application submitted by Ngozi Amadi', date: '31 Mar 2026, 10:14am' },
      { action: 'Documents uploaded: Bar Certificate, Government ID', date: '31 Mar 2026, 10:16am' }
    ]
  },
  {
    id: 'LWY-0089',
    initials: 'SO',
    name: 'Seun Olatunji',
    specialty: 'Labour Law',
    location: 'Lagos',
    submittedAt: '1 day ago',
    fullDate: '30 Mar 2026, 14:30pm',
    docsUploaded: 1,
    docsTotal: 3,
    priority: 'Normal',
    email: 'seun.olatunji@gmail.com',
    missing: 'Government ID, Profile Photo',
    statusBg: 'bg-indigo-100 text-indigo-700',
    documents: [
      { name: 'Bar Certificate', type: 'PDF · 1.5 MB', status: 'Uploaded', uploaded: true }
    ],
    history: [
      { action: 'Application submitted by Seun Olatunji', date: '30 Mar 2026, 14:30pm' }
    ]
  },
  {
    id: 'LWY-0090',
    initials: 'IF',
    name: 'Ify Folarin',
    specialty: 'Family Law',
    location: 'Ibadan',
    submittedAt: '2 days ago',
    fullDate: '29 Mar 2026, 09:15am',
    docsUploaded: 2,
    docsTotal: 3,
    priority: 'Normal',
    email: 'ify.folarin@gmail.com',
    missing: 'Bar Certificate',
    statusBg: 'bg-orange-100 text-orange-700',
    documents: [],
    history: []
  },
  {
    id: 'LWY-0091',
    initials: 'KE',
    name: 'Kunle Eze',
    specialty: 'Criminal Law',
    location: 'Lagos',
    submittedAt: '3 days ago',
    fullDate: '28 Mar 2026, 16:45pm',
    docsUploaded: 3,
    docsTotal: 3,
    priority: 'Urgent',
    email: 'kunle.eze@gmail.com',
    missing: 'None',
    statusBg: 'bg-rose-100 text-rose-700',
    documents: [],
    history: []
  },
  {
    id: 'LWY-0092',
    initials: 'TA',
    name: 'Temi Adeyinka',
    specialty: 'Property Law',
    location: 'Abuja',
    submittedAt: '4 days ago',
    fullDate: '27 Mar 2026, 11:20am',
    docsUploaded: 3,
    docsTotal: 3,
    priority: 'Urgent',
    email: 'temi.adeyinka@gmail.com',
    missing: 'None',
    statusBg: 'bg-blue-100 text-blue-700',
    documents: [],
    history: []
  },
  {
    id: 'LWY-0093',
    initials: 'DO',
    name: 'Dami Okonkwo',
    specialty: 'Corporate Law',
    location: 'Lagos',
    submittedAt: '5 days ago',
    fullDate: '26 Mar 2026, 13:10pm',
    docsUploaded: 3,
    docsTotal: 3,
    priority: 'Urgent',
    email: 'dami.okonkwo@gmail.com',
    missing: 'None',
    statusBg: 'bg-emerald-100 text-emerald-700',
    documents: [],
    history: []
  },
  {
    id: 'LWY-0094',
    initials: 'YA',
    name: 'Yemi Abiodun',
    specialty: 'Tax Law',
    location: 'Lagos',
    submittedAt: '6 days ago',
    fullDate: '25 Mar 2026, 10:05am',
    docsUploaded: 2,
    docsTotal: 3,
    priority: 'Urgent',
    email: 'yemi.abiodun@gmail.com',
    missing: 'Government ID',
    statusBg: 'bg-indigo-100 text-indigo-700',
    documents: [],
    history: []
  }
]

const searchQuery = ref('')
const selectedSubmission = ref(submissions[0])
const reviewNote = ref('')

const filteredSubmissions = computed(() => {
  if (!searchQuery.value) return submissions
  return submissions.filter(s => s.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

function selectSubmission(submission: any) {
  selectedSubmission.value = submission
}
</script>

<template>
  <div class="h-[calc(100vh-theme(spacing.24))] flex flex-col">
    <!-- Header -->
    <div class="mb-6 shrink-0">
      <h1 class="text-2xl font-bold text-gray-900 leading-tight">
        Verification Queue
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        7 pending &middot; 2 need urgent attention
      </p>
    </div>

    <!-- Main Content Split -->
    <div class="flex-1 flex gap-6 min-h-0">
      <!-- Left Column: List -->
      <div class="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
        <div class="p-5 border-b border-gray-100">
          <h2 class="font-bold text-gray-900 mb-4">
            Submissions
          </h2>
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search ..."
            class="w-full"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing>
              <UButton
                v-show="searchQuery !== ''"
                color="gray"
                variant="link"
                icon="i-heroicons-x-mark"
                :padded="false"
                @click="searchQuery = ''"
              />
            </template>
          </UInput>
        </div>

        <div class="flex-1 overflow-y-auto min-h-0">
          <div
            v-for="sub in filteredSubmissions"
            :key="sub.id"
            class="p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3 border-l-4"
            :class="selectedSubmission.id === sub.id ? 'bg-blue-50/30 border-l-blue-600' : 'border-l-transparent'"
            @click="selectSubmission(sub)"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
              :class="sub.statusBg"
            >
              {{ sub.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-900 text-sm truncate">
                {{ sub.name }}
              </h3>
              <p class="text-xs text-gray-500 mt-1 truncate">
                {{ sub.specialty }} &middot; {{ sub.location }}
              </p>
              <p class="text-xs text-gray-400 mt-2">
                {{ sub.submittedAt }}
              </p>
            </div>
            <div class="flex flex-col items-end justify-between self-stretch shrink-0">
              <div class="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <UIcon
                  name="i-heroicons-document-text"
                  class="w-3.5 h-3.5"
                />
                {{ sub.docsUploaded }}/{{ sub.docsTotal }}
              </div>
              <UBadge
                :color="sub.priority === 'Urgent' ? 'red' : 'gray'"
                variant="soft"
                size="xs"
                class="rounded-full px-2"
                :ui="{ rounded: 'rounded-full' }"
              >
                {{ sub.priority }}
              </UBadge>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 shrink-0">
          <span>Showing 1–10 of 89 submissions</span>
          <div class="flex items-center gap-1">
            <UButton
              variant="ghost"
              color="gray"
              size="xs"
              icon="i-heroicons-arrow-left"
            >
              Prev
            </UButton>
            <UButton
              variant="solid"
              color="primary"
              size="xs"
            >
              1
            </UButton>
            <UButton
              variant="ghost"
              color="gray"
              size="xs"
              trailing-icon="i-heroicons-arrow-right"
            >
              Next
            </UButton>
          </div>
        </div>
      </div>

      <!-- Right Column: Details -->
      <div class="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-6 min-h-0">
        <!-- Top Action Bar -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-xl font-bold text-gray-900">
              {{ selectedSubmission.name }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              {{ selectedSubmission.specialty }} &middot; {{ selectedSubmission.location }} &middot; Submitted {{ selectedSubmission.fullDate }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button class="px-5 py-2 rounded-lg font-medium text-sm text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-sm">
              Reject
            </button>
            <button class="px-5 py-2 rounded-lg font-medium text-sm text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-sm">
              Approve
            </button>
          </div>
        </div>

        <!-- Info Cards Grid -->
        <div class="grid grid-cols-2 gap-6 shrink-0">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-6">
              Submission
            </h3>
            <div class="space-y-5">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Submitted</span>
                <span class="font-medium text-gray-900">{{ selectedSubmission.fullDate }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Documents</span>
                <span class="font-medium text-gray-900">{{ selectedSubmission.docsUploaded }} of {{ selectedSubmission.docsTotal }} uploaded</span>
              </div>
              <div class="flex justify-between items-center text-sm border-b border-gray-100 pb-5">
                <span class="text-gray-500">Missing</span>
                <span :class="selectedSubmission.missing !== 'None' ? 'text-red-500' : 'text-gray-900'">{{ selectedSubmission.missing }}</span>
              </div>
              <div class="flex justify-between items-center text-sm pt-1">
                <span class="text-gray-500">Priority</span>
                <UBadge
                  :color="selectedSubmission.priority === 'Urgent' ? 'red' : 'gray'"
                  variant="soft"
                  size="sm"
                  class="rounded-full px-3"
                >
                  {{ selectedSubmission.priority }}
                </UBadge>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-6">
              Applicant
            </h3>
            <div class="space-y-5 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Lawyer ID</span>
                <span class="font-medium text-gray-900 uppercase">{{ selectedSubmission.id }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Email</span>
                <span class="font-medium text-gray-900">{{ selectedSubmission.email }}</span>
              </div>
              <div class="flex justify-between items-center border-b border-gray-100 pb-5">
                <span class="text-gray-500">Location</span>
                <span class="font-medium text-gray-900">{{ selectedSubmission.location }}</span>
              </div>
              <div class="flex justify-between items-center pt-1">
                <span class="text-gray-500">Practice area</span>
                <span class="font-medium text-gray-900">{{ selectedSubmission.specialty }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xs font-bold text-gray-400 tracking-wider uppercase">
              Documents
            </h3>
            <UButton
              variant="ghost"
              color="primary"
              size="sm"
              icon="i-heroicons-arrow-down-tray"
            >
              Download all
            </UButton>
          </div>
          <div
            v-if="selectedSubmission.documents && selectedSubmission.documents.length > 0"
            class="grid grid-cols-3 gap-4"
          >
            <div
              v-for="doc in selectedSubmission.documents"
              :key="doc.name"
              class="border rounded-xl overflow-hidden flex flex-col"
              :class="doc.uploaded ? 'border-gray-200' : 'border-gray-200 border-dashed'"
            >
              <div
                class="h-28 flex items-center justify-center shrink-0"
                :class="doc.uploaded ? 'bg-indigo-50/50' : 'bg-gray-50/50'"
              >
                <UIcon
                  :name="doc.uploaded ? 'i-heroicons-document-text' : 'i-heroicons-document'"
                  class="w-8 h-8"
                  :class="doc.uploaded ? 'text-indigo-500' : 'text-gray-300'"
                />
              </div>
              <div class="p-4 bg-white flex-1 border-t border-gray-100">
                <h4 class="text-sm font-medium text-gray-900">
                  {{ doc.name }}
                </h4>
                <p class="text-xs text-gray-500 mt-1">
                  {{ doc.type }}
                </p>
                <p
                  class="text-xs mt-3 font-medium flex items-center gap-1"
                  :class="doc.uploaded ? 'text-emerald-600' : 'text-rose-500'"
                >
                  <UIcon
                    :name="doc.uploaded ? 'i-heroicons-check' : 'i-heroicons-x-mark'"
                    class="w-3.5 h-3.5"
                  />
                  {{ doc.status }}
                </p>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-center py-8 text-gray-500 text-sm"
          >
            No documents provided
          </div>
        </div>

        <!-- Review Notes -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
          <h3 class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-5">
            Review Notes
          </h3>
          <UTextarea
            v-model="reviewNote"
            placeholder="Add review notes here — visible to operations team only..."
            class="mb-4 bg-gray-50/50"
            :rows="3"
            variant="outline"
          />
          <div class="flex justify-end">
            <UButton
              color="blue"
              variant="soft"
              class="px-5"
            >
              Save note
            </UButton>
          </div>
        </div>

        <!-- Activity History -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
          <h3 class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-6">
            Activity History
          </h3>
          <div
            v-if="selectedSubmission.history && selectedSubmission.history.length > 0"
            class="space-y-6"
          >
            <div
              v-for="(event, index) in selectedSubmission.history"
              :key="index"
              class="relative pl-6"
            >
              <div class="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-600 z-10" />
              <div
                v-if="index !== selectedSubmission.history.length - 1"
                class="absolute left-[3px] top-3 w-[2px] h-full bg-gray-200"
              />
              <p class="text-sm text-gray-900 font-medium">
                {{ event.action }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ event.date }}
              </p>
            </div>
          </div>
          <div
            v-else
            class="text-center py-4 text-gray-500 text-sm"
          >
            No activity history
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
