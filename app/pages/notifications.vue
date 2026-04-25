<script setup lang="ts">
import { ref } from 'vue'

const notificationTarget = ref('All users')
const notificationType = ref('Announcement')
const notificationTitle = ref('')
const notificationMessage = ref('')

const recentNotifications = [
  { title: 'Your event has been denied.', sub: '23 task was returned from the workflow', target: 'All users', type: 'Announcement', view: '4,320', time: '6 hours ago' },
  { title: 'Your event has been paused.', sub: '54 products was accepted by the Amazon', target: 'All users', type: 'Announcement', view: '4,320', time: '6 hours ago' },
  { title: 'Ticket sales of your event has ended.', sub: '243 products was returned from THD', target: 'All users', type: 'Announcement', view: '4,320', time: '6 hours ago' },
  { title: 'Your event has already finished.', sub: 'SANJ replied to your comment', target: 'All users', type: 'Announcement', view: '4,320', time: '6 hours ago' }
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 leading-tight">Notification Management</h1>
      <p class="text-sm text-gray-500">Send and track push notifications & broadcasts</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Left Column: Compose & Recent -->
      <div class="space-y-6">
        <!-- Compose Notification -->
        <UCard>
          <div class="space-y-6">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Compose notification</h2>
              <p class="text-sm text-gray-500">Reported by Tunde Bakare • against Emeka Nwachukwu</p>
            </div>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-gray-700">Title</label>
                <UInput v-model="notificationTitle" placeholder="e.g Platform update - new search filters" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-gray-700">Message</label>
                <UTextarea v-model="notificationMessage" placeholder="e.g Platform update - new search filters" :rows="5" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-gray-700">Type</label>
                <USelect v-model="notificationType" :options="['Announcement', 'Update', 'Promotion']" />
              </div>

              <div class="space-y-3 pt-2">
                <label class="text-sm font-medium text-gray-700">Target</label>
                <div class="flex flex-wrap gap-2">
                  <button 
                    @click="notificationTarget = 'All users'"
                    class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
                    :class="notificationTarget === 'All users' ? 'bg-[#EFF6FF] text-[#003357] border-[#003357]/20' : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50'"
                  >
                    All users
                  </button>
                  <button 
                    @click="notificationTarget = 'Clients only'"
                    class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-transparent hover:bg-gray-50 text-gray-600"
                    :class="notificationTarget === 'Clients only' ? 'bg-[#EFF6FF] text-[#003357] border-[#003357]/20' : ''"
                  >
                    Clients only
                  </button>
                  <button 
                    @click="notificationTarget = 'Lawyers only'"
                    class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-transparent hover:bg-gray-50 text-gray-600"
                    :class="notificationTarget === 'Lawyers only' ? 'bg-[#EFF6FF] text-[#003357] border-[#003357]/20' : ''"
                  >
                    Lawyers only
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
              <span class="text-sm text-gray-500 font-medium">4,821 recipients</span>
              <UButton color="primary" class="bg-[#003357] hover:bg-[#002244]">
                Send notification
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Recent Notifications -->
        <UCard :ui="{ body: { padding: 'p-0 sm:p-0' } }">
          <div class="p-4 sm:p-6 pb-2">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Notifications</h3>
          </div>
          
          <div class="space-y-0 pb-4">
            <div v-for="(notif, idx) in recentNotifications" :key="idx" class="px-4 sm:px-6 py-4 border-t border-gray-100/60 first:border-t-0 hover:bg-gray-50 transition-colors">
              <div class="flex justify-between items-start mb-1">
                <h4 class="font-bold text-sm text-gray-900">{{ notif.title }}</h4>
                <span class="text-xs text-gray-400 whitespace-nowrap ml-4">{{ notif.time }}</span>
              </div>
              <p class="text-xs text-gray-500 mb-3">{{ notif.sub }}</p>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UBadge color="gray" variant="solid" class="rounded-full bg-[#EFF6FF] text-[#003357] font-medium text-xs px-2.5 py-0.5">{{ notif.target }}</UBadge>
                  <UBadge color="gray" variant="subtle" class="rounded-full text-xs px-2.5 py-0.5 text-gray-500 bg-gray-100 border-none">{{ notif.type }}</UBadge>
                </div>
                
                <div class="flex items-center gap-1.5 text-gray-400">
                  <UIcon name="i-lucide-eye" class="w-3.5 h-3.5" />
                  <span class="text-xs font-medium">{{ notif.view }}</span>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right Column: Performance Stats -->
      <div class="space-y-6">
        <UCard>
          <div class="space-y-8">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Performance</h2>
              <p class="text-sm text-gray-500">Here's how your notifications have performed</p>
            </div>
            
            <div class="space-y-4">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Last Broadcast Performance</h3>
              
              <div class="space-y-5">
                <div class="space-y-2">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-600 font-medium">Delivered</span>
                    <span class="font-bold text-gray-900">4,677</span>
                  </div>
                  <UProgress :value="85" color="primary" class="h-2" :ui="{ progress: { color: 'text-[#003357]' } }" />
                </div>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-600 font-medium">Opened</span>
                    <span class="font-bold text-gray-900">2,522</span>
                  </div>
                  <UProgress :value="50" color="primary" class="h-2" :ui="{ progress: { color: 'text-green-600' } }" />
                </div>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-600 font-medium">Open Rate</span>
                    <span class="font-bold text-gray-900">50.4%</span>
                  </div>
                  <UProgress :value="50" color="primary" class="h-2" :ui="{ progress: { color: 'text-green-600' } }" />
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-gray-100">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Sent By Type — This Month</h3>
              
              <div class="space-y-4">
                <div class="flex justify-between items-center text-sm py-1 border-b border-gray-50 pb-3">
                  <span class="text-gray-900 font-medium">Announcements</span>
                  <span class="text-gray-500">8 sent</span>
                </div>
                
                <div class="flex justify-between items-center text-sm py-1 border-b border-gray-50 pb-3">
                  <span class="text-gray-900 font-medium">Platform updates</span>
                  <span class="text-gray-500">5 sent</span>
                </div>
                
                <div class="flex justify-between items-center text-sm py-1 border-b border-gray-50 pb-3">
                  <span class="text-gray-900 font-medium">Promotions</span>
                  <span class="text-gray-500">4 sent</span>
                </div>
                
                <div class="flex justify-between items-center text-sm py-1">
                  <span class="text-gray-900 font-medium">Security alerts</span>
                  <span class="text-gray-500">10 sent</span>
                </div>
              </div>
            </div>
            
          </div>
        </UCard>
      </div>

    </div>
  </div>
</template>
