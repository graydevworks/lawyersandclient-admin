<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

const lawyer = {
  name: 'Adejumobi O.',
  id: id || 'GSOC - 02',
  location: 'Ibadan, Nigeria',
  phone: '+234 8137496017',
  email: 'adejumobi@gmail.com',
  rating: 4.8,
  experience: '12 Years',
  status: 'Active',
  languages: ['English', 'Yoruba'],
  bio: 'I am a dedicated corporate lawyer with over 12 years of experience helping startups and established businesses navigate complex legal landscapes. My expertise spans corporate law, contract drafting, and startup advisory, with a proven track record of helping businesses succeed legally and strategically. Throughout my career, I have successfully advised numerous startups through their formative..',
  practiceAreas: [
    'Contract Drafting', 'Startup Advisory', 'Business Registration',
    'Dispute Resolution', 'Intellectual Property', 'Employment Law',
    'Regulatory Compliance', 'Corporate Law'
  ],
  activity: {
    totalChats: 0,
    reportsFiled: 1,
    lastActive: 'Today, 2:14 pm',
    joined: '22 Mar 2026'
  },
  documents: [
    { title: 'Bar Certificate', type: 'PDF', size: '1.2 MB', status: 'Uploaded', icon: 'i-lucide-file-text', color: 'blue' },
    { title: 'Government ID', type: 'Image', size: '640 KB', status: 'Uploaded', icon: 'i-lucide-file-image', color: 'purple' },
    { title: 'Profile Photo', type: 'Image', size: '-', status: 'Missing', icon: 'i-lucide-file', color: 'gray', isMissing: true }
  ],
  reviews: [
    { name: 'Chioma Adeyemi', rating: 5, date: '2 months ago', comment: 'Adebayo helped our startup finalize shareholder agreements quickly and professionally. His attention to detail and business acumen made the process smooth.' },
    { name: 'Tunde Olaseni', rating: 5, date: '4 months ago', comment: 'Excellent legal advice on our company restructuring. Professional, responsive, and incredibly knowledgeable. Highly recommended.' },
    { name: 'Blessing Okoro', rating: 4, date: '5 months ago', comment: 'Great contract review and negotiation services. Would definitely work with Adebayo again for future matters.' }
  ],
  workExperience: [
    { role: 'Senior Associate', company: 'Ade & Co Law Firm', period: '2018 - Present', description: 'Leading corporate and startup advisory practice. Managing client relationships, advising on complex business structures, contract negotiations, and regulatory matters.' },
    { role: 'Corporate Lawyer', company: 'Lagos Legal Partners', period: '2014 - 2018', description: 'Handled corporate transactions, business formation, contract law, and commercial disputes for SMEs and corporate clients.' },
    { role: 'Legal Associate', company: 'Justice & Associates', period: '2012 - 2014', description: 'General practice attorney handling corporate, commercial, and civil litigation matters.' }
  ]
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-12">
    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column (Main Info) -->
      <div class="lg:col-span-8 space-y-6">
        <!-- Profile Header Card -->
        <UCard
          class="overflow-hidden rounded-[24px] border-0 ring-0 shadow-sm"
          :ui="{ body: 'p-0' }"
        >
          <!-- Banner -->
          <div class="h-48 w-full relative">
            <img
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop"
              class="w-full h-full object-cover"
              alt="Banner"
            >
            <div class="absolute inset-0 bg-black/20" />
          </div>

          <div class="px-8 pb-8 -mt-12 relative">
            <div class="flex items-end gap-6 mb-6">
              <UAvatar
                src="https://i.pravatar.cc/150?u=1"
                size="3xl"
                class="size-32 rounded-full border-4 border-white shadow-md"
              />
              <div class="pb-2">
                <div class="flex items-center gap-2 mb-1">
                  <h1 class="text-2xl font-bold text-gray-900">
                    {{ lawyer.name }}
                  </h1>
                  <UIcon
                    name="i-lucide-check-circle"
                    class="text-blue-500 size-5"
                  />
                </div>
                <UBadge
                  color="success"
                  variant="subtle"
                  class="rounded-full px-3 py-1 text-xs font-medium"
                >
                  {{ lawyer.status }}
                </UBadge>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <h3 class="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">
                  Lawyer Bio
                </h3>
                <p class="text-gray-600 text-[14px] leading-relaxed">
                  {{ lawyer.bio }}
                  <button class="text-[#003357] font-bold hover:underline ml-1">
                    See more
                  </button>
                </p>
              </div>

              <div>
                <h3 class="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                  Practice Areas
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="area in lawyer.practiceAreas"
                    :key="area"
                    class="px-4 py-2 bg-gray-50 text-gray-600 text-[13px] rounded-full border border-gray-100"
                  >
                    {{ area }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Documents Section -->
        <UCard class="rounded-[24px] border-0 ring-0 shadow-sm">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Documents
              </h3>
              <button class="text-[#003357] text-[13px] font-bold flex items-center gap-1 hover:underline">
                Download all <UIcon
                  name="i-lucide-download"
                  class="size-4"
                />
              </button>
            </div>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="doc in lawyer.documents"
              :key="doc.title"
              class="border border-gray-100 rounded-2xl p-4 flex flex-col gap-4 group cursor-pointer hover:border-gray-200 transition-colors"
            >
              <div
                class="h-24 w-full flex items-center justify-center rounded-xl"
                :class="[
                  doc.color === 'blue' ? 'bg-blue-50'
                  : doc.color === 'purple' ? 'bg-purple-50' : 'bg-gray-50'
                ]"
              >
                <UIcon
                  :name="doc.icon"
                  class="size-10"
                  :class="[
                    doc.color === 'blue' ? 'text-blue-500'
                    : doc.color === 'purple' ? 'text-purple-500' : 'text-gray-300'
                  ]"
                />
              </div>
              <div>
                <h4 class="text-[13px] font-bold text-gray-900 mb-0.5">
                  {{ doc.title }}
                </h4>
                <div class="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                  <span>{{ doc.type }}</span>
                  <span v-if="doc.size !== '-'">• {{ doc.size }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <UIcon
                    :name="doc.isMissing ? 'i-lucide-alert-circle' : 'i-lucide-check'"
                    class="size-3"
                    :class="doc.isMissing ? 'text-red-500' : 'text-green-500'"
                  />
                  <span
                    class="text-[11px] font-medium italic"
                    :class="doc.isMissing ? 'text-red-500' : 'text-green-500'"
                  >
                    {{ doc.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Reviews Section -->
        <UCard class="rounded-[24px] border-0 ring-0 shadow-sm">
          <template #header>
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Reviews
            </h3>
          </template>

          <div class="divide-y divide-gray-50">
            <div
              v-for="(review, index) in lawyer.reviews"
              :key="index"
              class="py-6 first:pt-0 last:pb-0"
            >
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-[14px] font-bold text-gray-900">
                  {{ review.name }}
                </h4>
                <span class="text-xs text-gray-400">{{ review.date }}</span>
              </div>
              <div class="flex items-center gap-0.5 mb-3">
                <UIcon
                  v-for="i in 5"
                  :key="i"
                  name="i-lucide-star"
                  class="size-4"
                  :class="i <= review.rating ? 'text-orange-400 fill-orange-400' : 'text-gray-200'"
                />
              </div>
              <p class="text-[13px] text-gray-600 leading-relaxed">
                {{ review.comment }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Experience Section -->
        <UCard class="rounded-[24px] border-0 ring-0 shadow-sm">
          <template #header>
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Experience
            </h3>
          </template>

          <div class="space-y-8">
            <div
              v-for="(exp, index) in lawyer.workExperience"
              :key="index"
              class="relative pl-6 border-l-2 border-gray-100"
            >
              <div class="absolute left-[-9px] top-0 size-4 rounded-full border-2 border-gray-100 bg-white" />
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-[15px] font-bold text-gray-900">
                  {{ exp.role }}
                </h4>
                <span class="text-[12px] font-medium text-gray-400">{{ exp.period }}</span>
              </div>
              <p class="text-[13px] font-medium text-gray-400 mb-3">
                {{ exp.company }}
              </p>
              <p class="text-[13px] text-gray-600 leading-relaxed">
                {{ exp.description }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right Column (Sidebar) -->
      <div class="lg:col-span-4 space-y-6">
        <!-- About Sidebar Card -->
        <UCard class="rounded-[24px] border-0 ring-0 shadow-sm p-2">
          <div class="space-y-6">
            <!-- About Info -->
            <section>
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                About
              </h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">User ID</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.id }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Location</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.location }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Phone number</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.phone }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Email</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.email }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Rating</span>
                  <div class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-star"
                      class="size-4 text-orange-400 fill-orange-400"
                    />
                    <span class="text-[13px] font-bold text-gray-900">{{ lawyer.rating }}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Experience</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.experience }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Languages spoken</span>
                  <div class="flex gap-2">
                    <span
                      v-for="lang in lawyer.languages"
                      :key="lang"
                      class="px-3 py-1 bg-gray-50 text-[12px] font-medium text-gray-600 rounded-full border border-gray-100"
                    >
                      {{ lang }}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Activity Info -->
            <section class="pt-6 border-t border-gray-50">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Activity
              </h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Total chats</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.activity.totalChats }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Reports filed</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.activity.reportsFiled }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Last active</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.activity.lastActive }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[13px] text-gray-500">Joined</span>
                  <span class="text-[13px] font-bold text-gray-900">{{ lawyer.activity.joined }}</span>
                </div>
              </div>
            </section>

            <!-- Actions -->
            <section class="pt-6 space-y-3">
              <UButton
                block
                color="neutral"
                class="bg-[#003357] hover:bg-[#002244] text-white font-bold rounded-xl py-3"
              >
                Reset password
              </UButton>
              <UButton
                block
                variant="outline"
                color="neutral"
                class="bg-white text-gray-900 border-gray-200 font-bold rounded-xl py-3 hover:bg-gray-50"
              >
                Suspend account
              </UButton>
              <UButton
                block
                variant="outline"
                color="error"
                class="border-red-200 text-red-500 font-bold rounded-xl py-3 hover:bg-red-50"
              >
                Delete account
              </UButton>
            </section>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
