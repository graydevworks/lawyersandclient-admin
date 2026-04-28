<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('Security')
const activeContentTab = ref('Featured lawyers')

const tabs = [
  { id: 'General', label: 'General', icon: 'i-lucide-settings' },
  { id: 'Security', label: 'Security', icon: 'i-lucide-shield-check' },
  { id: 'Admin accounts', label: 'Admin accounts', icon: 'i-lucide-user' },
  { id: 'Content Management', label: 'Content Management', icon: 'i-lucide-layout' }
]

const contentTabs = ['App banners', 'Featured lawyers', 'Website Ads']

const featuredLawyers = [
  { id: 1, name: 'Adaeze Okonkwo', practice: 'Criminal Law', location: 'Lagos', selected: false },
  { id: 2, name: 'Adaeze Okonkwo', practice: 'Criminal Law', location: 'Lagos', selected: true },
  { id: 3, name: 'Adaeze Okonkwo', practice: 'Criminal Law', location: 'Lagos', selected: true },
  { id: 4, name: 'Adaeze Okonkwo', practice: 'Criminal Law', location: 'Lagos', selected: true },
  { id: 5, name: 'Adaeze Okonkwo', practice: 'Criminal Law', location: 'Lagos', selected: false },
  { id: 6, name: 'Adaeze Okonkwo', practice: 'Criminal Law', location: 'Lagos', selected: false },
  { id: 7, name: 'Adaeze Okonkwo', practice: 'Criminal Law', location: 'Lagos', selected: false },
  { id: 8, name: 'Adaeze Okonkwo', practice: 'Criminal Law', location: 'Lagos', selected: false }
]

const appBanners = [
  { id: 1, title: 'Find your lawyer today', subtitle: 'Verified legal professionals across Nigeria', link: 'https://lawyersclients.ng/search', status: 'Live' },
  { id: 2, title: 'Family law made simple', subtitle: 'Trusted advice for custody, divorce & more', link: 'https://lawyersclients.ng/family-law', status: 'Live' },
  { id: 3, title: 'New on the platform', subtitle: 'Commercial lawyers now available in Abuja', link: 'https://lawyersclients.ng/commercial', status: 'Hidden' }
]

const adminAccounts = [
  { name: 'Super Admin', email: 'admin@lawyersclient.ng', role: 'Super Admin', color: 'primary' as const },
  { name: 'Ops Admin', email: 'ops@lawyersclients.ng', role: 'Operations', color: 'primary' as const },
  { name: 'Support Admin', email: 'support@lawyersclient.ng', role: 'Support', color: 'success' as const }
]

const permissions = [
  { title: 'Operations Admin — suspend users', description: 'Allow Ops Admin to suspend and activate accounts' },
  { title: 'Operations Admin — approve lawyers', description: 'Allow Ops Admin to verify and approve lawyer applications' },
  { title: 'Support Admin — view chat logs', description: 'Limited to flagged conversations only' },
  { title: 'Support Admin — send notifications', description: 'Allow Support Admin to broadcast messages' }
]

const enable2FA = ref(false)
const sessionTimeout = ref('30 minutes')
</script>

<template>
  <div class="space-y-8 max-w-7xl">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 leading-tight">
          {{ activeTab === 'Content Management' ? 'Content Management' : 'System Settings' }}
        </h1>
        <p class="text-sm text-gray-500">
          {{ activeTab === 'Content Management' ? 'Manage public facing pages, FAQs, and blog posts' : 'Platform configuration • Super Admin only' }}
        </p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Sidebar Settings menu -->
      <UCard
        class="lg:w-72 shrink-0 border border-gray-100"
        :ui="{
          body: 'p-0 sm:p-0',
          root: 'overflow-hidden'
        }"
      >
        <div class="flex flex-col py-4">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors relative"
            :class="activeTab === tab.id ? 'bg-[#EFF6FF] text-[#003357]' : 'text-gray-600 hover:bg-gray-50'"
            @click="activeTab = tab.id"
          >
            <div
              v-if="activeTab === tab.id"
              class="absolute left-0 top-0 bottom-0 w-1 bg-[#003357]"
            />
            <UIcon
              :name="tab.icon"
              class="w-5 h-5"
              :class="activeTab === tab.id ? 'text-[#003357]' : 'text-gray-400'"
            />
            {{ tab.label }}
          </button>

          <div class="px-6 py-4 mt-2 border-t border-gray-100">
            <button class="flex items-center gap-3 text-sm font-medium text-red-500 hover:text-red-700 transition-colors">
              <UIcon
                name="i-lucide-log-out"
                class="w-5 h-5"
              />
              Logout
            </button>
          </div>
        </div>
      </UCard>

      <!-- Content Area -->
      <div class="flex-1 min-w-0">
        <!-- Content Management Section -->
        <div
          v-if="activeTab === 'Content Management'"
          class="flex flex-col md:flex-row gap-6 h-full"
        >
          <!-- Sub-Sidebar -->
          <div class="w-full md:w-56 flex-shrink-0 space-y-1">
            <button
              v-for="ctab in contentTabs"
              :key="ctab"
              class="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              :class="activeContentTab === ctab ? 'bg-[#EFF6FF] text-[#003357]' : 'text-gray-500 hover:bg-gray-100'"
              @click="activeContentTab = ctab"
            >
              {{ ctab }}
            </button>
          </div>

          <!-- Sub-Content Area -->
          <div class="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden min-h-[600px]">
            <!-- Featured Lawyers -->
            <div
              v-if="activeContentTab === 'Featured lawyers'"
              class="p-6 md:p-8 space-y-6"
            >
              <div>
                <h2 class="text-lg font-bold text-gray-900">
                  Featured lawyers
                </h2>
                <p class="text-sm text-gray-400">
                  Shown on the app home screen and landing page · max 6 featured
                </p>
              </div>

              <div class="flex items-center gap-3 max-w-xl">
                <UInput
                  icon="i-lucide-search"
                  placeholder="Search lawyers by name or practice"
                  class="flex-1"
                  size="lg"
                  :ui="{ base: 'rounded-lg' }"
                />
                <UButton
                  color="primary"
                  class="bg-[#003357] px-6"
                  size="lg"
                >
                  Search
                </UButton>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
                <div
                  v-for="lawyer in featuredLawyers"
                  :key="lawyer.id"
                  class="p-4 border rounded-xl flex items-center justify-between transition-all"
                  :class="lawyer.selected ? 'border-[#3B82F6] bg-blue-50/30' : 'border-gray-100 hover:border-gray-200'"
                >
                  <div class="flex items-center gap-3">
                    <UAvatar
                      size="md"
                      class="bg-gray-100"
                    />
                    <div>
                      <h4 class="font-bold text-gray-900 text-sm leading-tight">
                        {{ lawyer.name }}
                      </h4>
                      <p class="text-[11px] text-gray-400">
                        {{ lawyer.practice }} · {{ lawyer.location }}
                      </p>
                    </div>
                  </div>
                  <UCheckbox
                    v-if="lawyer.selected"
                    :model-value="true"
                    color="primary"
                    class="rounded-lg"
                  />
                  <UButton
                    v-else
                    icon="i-lucide-plus"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    class="text-gray-300"
                  />
                </div>
              </div>
            </div>

            <!-- Website Ads -->
            <div
              v-if="activeContentTab === 'Website Ads'"
              class="p-6 md:p-8 space-y-8"
            >
              <div class="flex items-center justify-between border-b pb-6 border-gray-100">
                <h2 class="text-lg font-bold text-gray-900">
                  LawTech Nigeria - homepage banner
                </h2>
                <div class="flex items-center gap-2">
                  <UButton
                    color="neutral"
                    variant="solid"
                    class="border border-gray-200 text-gray-600"
                  >
                    Save draft
                  </UButton>
                  <UButton
                    color="neutral"
                    variant="solid"
                    class="border border-orange-200 text-orange-500"
                  >
                    Pause
                  </UButton>
                  <UButton
                    color="primary"
                    class="bg-blue-600"
                  >
                    Publish
                  </UButton>
                  <UButton
                    color="error"
                    variant="subtle"
                    class="bg-red-50 text-red-500"
                  >
                    Delete
                  </UButton>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div class="lg:col-span-8 space-y-8">
                  <div class="space-y-4">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Ad Type
                    </p>
                    <div class="flex gap-2">
                      <UButton
                        size="sm"
                        class="bg-blue-50 text-[#003357] border border-blue-100 rounded-full px-4"
                      >
                        Banner ad
                      </UButton>
                      <UButton
                        size="sm"
                        variant="ghost"
                        class="text-gray-400 rounded-full px-4"
                      >
                        Text ad
                      </UButton>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Banner Creative
                    </p>
                    <div class="border rounded-xl p-4 bg-gray-50/50">
                      <p class="text-xs text-gray-400 mb-3">
                        Image upload
                      </p>
                      <div class="h-32 bg-[#1A8081] rounded-lg flex flex-col items-center justify-center text-white/70 border-4 border-white shadow-sm overflow-hidden mb-2">
                        <span class="text-xs font-medium">banner_lawtech_march.jpg</span>
                      </div>
                      <p class="text-[10px] text-gray-400">
                        Recommended: 1200x300px · JPG or PNG · max 2MB
                      </p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UFormGroup
                      label="Headline"
                      class="col-span-1"
                    >
                      <UInput
                        model-value="Get legal help from verified lawyers"
                        size="lg"
                        class="rounded-lg"
                      />
                    </UFormGroup>
                    <UFormGroup
                      label="Destination URL"
                      class="col-span-1"
                    >
                      <UInput
                        model-value="https://lawtech.ng/promo"
                        size="lg"
                        class="rounded-lg"
                      />
                    </UFormGroup>
                  </div>
                </div>

                <div class="lg:col-span-4 space-y-6">
                  <div class="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Preview
                    </p>
                    <div class="aspect-4/1 bg-[#1A8081] rounded mb-3" />
                    <h4 class="font-bold text-sm text-gray-900 mb-1">
                      Get legal help from verified lawyers
                    </h4>
                    <a
                      href="#"
                      class="text-xs font-bold text-blue-600 flex items-center gap-1"
                    >Learn more <UIcon
                      name="i-lucide-arrow-right"
                      class="w-3 h-3"
                    /></a>
                  </div>

                  <div class="bg-gray-50/50 rounded-xl p-6 border border-gray-100 space-y-4">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Performance
                    </p>
                    <div class="flex justify-between items-center text-sm">
                      <span class="text-gray-500">Impressions</span>
                      <span class="font-bold text-gray-900">14,280</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                      <span class="text-gray-500">Clicks</span>
                      <span class="font-bold text-gray-900">384</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                      <span class="text-gray-500">CTR</span>
                      <span class="font-bold text-green-500">2.6%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- App Banners -->
            <div
              v-if="activeContentTab === 'App banners'"
              class="p-6 md:p-8 space-y-6"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h2 class="text-lg font-bold text-gray-900">
                    App banners
                  </h2>
                  <p class="text-sm text-gray-400">
                    Shown in the carousel at the top of the mobile app home screen · 2 of 3 active
                  </p>
                </div>
              </div>

              <div class="space-y-4">
                <div
                  v-for="(banner, idx) in appBanners"
                  :key="banner.id"
                  class="p-6 border border-gray-100 rounded-2xl flex flex-col md:flex-row gap-6 relative group overflow-hidden"
                >
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-[#003357] transition-colors" />

                  <div class="w-full md:w-48 aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2 shrink-0">
                    <UIcon
                      name="i-lucide-image"
                      class="w-8 h-8"
                    />
                    <span class="text-xs font-medium">Upload image</span>
                  </div>

                  <div class="flex-1 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <p class="text-sm font-medium text-gray-400">
                        Title
                      </p>
                      <UInput
                        v-model="banner.title"
                        class="md:col-span-2 rounded-lg"
                      />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <p class="text-sm font-medium text-gray-400">
                        Subtitle
                      </p>
                      <UInput
                        v-model="banner.subtitle"
                        class="md:col-span-2 rounded-lg"
                      />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <p class="text-sm font-medium text-gray-400">
                        Link
                      </p>
                      <UInput
                        v-model="banner.link"
                        class="md:col-span-2 rounded-lg"
                      />
                    </div>

                    <div class="flex items-center justify-between pt-2">
                      <div class="flex items-center gap-3">
                        <UToggle
                          :model-value="banner.status === 'Live'"
                          color="primary"
                        />
                        <span
                          class="text-xs font-bold"
                          :class="banner.status === 'Live' ? 'text-[#003357]' : 'text-gray-400'"
                        >
                          {{ banner.status }}
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <UButton
                          icon="i-lucide-arrow-up"
                          size="xs"
                          color="neutral"
                          variant="ghost"
                          class="border border-gray-200"
                        />
                        <UButton
                          icon="i-lucide-arrow-down"
                          size="xs"
                          color="neutral"
                          variant="ghost"
                          class="border border-gray-200"
                        />
                        <UButton
                          color="error"
                          variant="subtle"
                          size="sm"
                          class="px-4 font-bold"
                        >
                          Remove
                        </UButton>
                      </div>
                    </div>
                  </div>

                  <div class="absolute top-4 left-4 w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                    {{ idx + 1 }}
                  </div>
                </div>

                <button class="w-full py-6 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all flex items-center justify-center gap-2 font-bold text-sm">
                  <UIcon
                    name="i-lucide-plus"
                    class="w-5 h-5"
                  />
                  Add banner
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Tab -->
        <div
          v-else-if="activeTab === 'Security'"
          class="p-6 md:p-8 space-y-8 bg-white rounded-xl border border-gray-100"
        >
          <div>
            <h2 class="text-lg font-bold text-gray-900">
              Authentication
            </h2>
            <p class="text-sm text-gray-500">
              Login and session security
            </p>
          </div>

          <div class="space-y-6">
            <div class="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <h3 class="font-medium text-gray-900">
                  Enable 2FA
                </h3>
                <p class="text-sm text-gray-500">
                  Secure your account with 2FA
                </p>
              </div>
              <UToggle
                v-model="enable2FA"
                color="primary"
              />
            </div>

            <div class="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <h3 class="font-medium text-gray-900">
                  Session timeout
                </h3>
                <p class="text-sm text-gray-500">
                  Edit your session timeout
                </p>
              </div>
              <USelect
                v-model="sessionTimeout"
                :options="['15 minutes', '30 minutes', '1 hour', 'Never']"
                class="w-40"
              />
            </div>

            <div class="flex items-center justify-between py-4">
              <div>
                <h3 class="font-medium text-gray-900">
                  Change password
                </h3>
              </div>
              <UButton
                color="neutral"
                variant="solid"
                class="shadow-sm border border-gray-200"
              >
                Change
              </UButton>
            </div>
          </div>
        </div>

        <!-- Admin accounts Tab -->
        <div
          v-if="activeTab === 'Admin accounts'"
          class="p-6 md:p-8 space-y-8"
        >
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900">
                Admin accounts
              </h2>
              <p class="text-sm text-gray-500">
                Manage roles and access levels
              </p>
            </div>
            <UButton
              icon="i-lucide-plus"
              color="primary"
              class="bg-[#003357] hover:bg-[#002244]"
            >
              Create admin
            </UButton>
          </div>

          <div class="space-y-4">
            <div
              v-for="admin in adminAccounts"
              :key="admin.email"
              class="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
            >
              <div class="flex items-center gap-4">
                <UAvatar
                  :alt="admin.name"
                  size="md"
                  class="bg-gray-100 text-gray-500"
                />
                <div>
                  <h3 class="font-medium text-gray-900">
                    {{ admin.name }}
                  </h3>
                  <p class="text-sm text-gray-400">
                    {{ admin.email }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <UBadge
                  :color="admin.color"
                  variant="subtle"
                  class="rounded-full px-3 py-1 font-medium hidden sm:block"
                >
                  {{ admin.role }}
                </UBadge>
                <UButton
                  color="neutral"
                  variant="solid"
                  size="sm"
                  class="shadow-sm border border-gray-200"
                >
                  Edit
                </UButton>
              </div>
            </div>
          </div>

          <div class="pt-6">
            <h2 class="text-lg font-bold text-gray-900">
              Role permissions
            </h2>
            <p class="text-sm text-gray-500 mb-6">
              What each role can access and do
            </p>

            <div class="space-y-4">
              <div
                v-for="(permission, idx) in permissions"
                :key="idx"
                class="py-4 border-t border-gray-100"
              >
                <h3 class="font-medium text-gray-900">
                  {{ permission.title }}
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                  {{ permission.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- General Tab -->
        <div
          v-if="activeTab === 'General'"
          class="p-6 md:p-8 space-y-8"
        >
          <div>
            <h2 class="text-lg font-bold text-gray-900">
              App Settings
            </h2>
            <p class="text-sm text-gray-500">
              Core platform configuration
            </p>
          </div>

          <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 gap-4">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">
                  Platform name
                </h3>
                <p class="text-sm text-gray-500">
                  Displayed across the app and email communications
                </p>
              </div>
              <UInput
                model-value="Lawyers & Clients"
                class="w-full sm:w-64"
                readonly
              />
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 gap-4">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">
                  Support email
                </h3>
                <p class="text-sm text-gray-500">
                  Where user support requests are directed
                </p>
              </div>
              <UInput
                model-value="support@lawyerclients.ng"
                class="w-full sm:w-64"
                readonly
              />
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 gap-4">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">
                  Default country
                </h3>
                <p class="text-sm text-gray-500">
                  Used for phone formatting and location defaults
                </p>
              </div>
              <UInput
                model-value="Nigeria (NG)"
                class="w-full sm:w-64"
                readonly
              />
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">
                  Default language
                </h3>
                <p class="text-sm text-gray-500">
                  Platform interface language
                </p>
              </div>
              <UInput
                model-value="English"
                class="w-full sm:w-64"
                readonly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
