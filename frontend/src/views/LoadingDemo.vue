<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Loading Demo</h1>
        <span class="text-sm text-gray-500">Test all loading integrations</span>
      </div>
    </template>

    <div class="space-y-8">
      <!-- Navigation Test -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">🧭 Navigation Loading Tests</h2>
        <p class="text-gray-600 mb-4">
          These links will trigger loading screens when navigating to pages with init APIs:
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <router-link
            to="/"
            class="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-blue-600">📊 Worklog Dashboard</div>
            <div class="text-sm text-gray-500">Loads worklogs via useWorklog</div>
          </router-link>
          
          <router-link
            to="/projects"
            class="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-green-600">📁 Project Dashboard</div>
            <div class="text-sm text-gray-500">Loads projects via useProjects</div>
          </router-link>
          
          <router-link
            to="/worklogs/create"
            class="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-purple-600">➕ Create Worklog</div>
            <div class="text-sm text-gray-500">Loads projects for dropdown</div>
          </router-link>
          
          <router-link
            to="/projects/add"
            class="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="font-medium text-orange-600">🏗️ Add Project</div>
            <div class="text-sm text-gray-500">Loads positions for dropdown</div>
          </router-link>
        </div>
      </div>

      <!-- Manual Test -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">🧪 Manual Loading Tests</h2>
        <p class="text-gray-600 mb-4">
          Test individual loading states manually:
        </p>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            @click="testWorklogs"
            class="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div class="font-medium text-blue-700">🔄 Worklogs</div>
            <div class="text-sm text-blue-600">2s test</div>
          </button>
          
          <button
            @click="testProjects"
            class="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div class="font-medium text-green-700">📁 Projects</div>
            <div class="text-sm text-green-600">2s test</div>
          </button>
          
          <button
            @click="testPermissions"
            class="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div class="font-medium text-purple-700">🔐 Permissions</div>
            <div class="text-sm text-purple-600">2s test</div>
          </button>
          
          <button
            @click="testPositions"
            class="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <div class="font-medium text-orange-700">👥 Positions</div>
            <div class="text-sm text-orange-600">2s test</div>
          </button>
        </div>
      </div>

      <!-- Status -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">📊 Loading Status</h2>
        
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div 
              class="w-3 h-3 rounded-full"
              :class="isGlobalLoading ? 'bg-green-500 animate-pulse' : 'bg-gray-300'"
            ></div>
            <span class="text-sm">
              Global Loading: {{ isGlobalLoading ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Integration Info -->
      <div class="bg-gray-50 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">ℹ️ Integration Info</h2>
        
        <div class="space-y-3 text-sm">
          <div>
            <strong>✅ Integrated Pages:</strong>
            <ul class="mt-1 ml-4 space-y-1 text-gray-600">
              <li>• Worklog Dashboard - useWorklog composable</li>
              <li>• Project Dashboard - useProjects composable</li>
              <li>• Create/Edit Worklog - project dropdown loading</li>
              <li>• Add Project - position dropdown loading</li>
              <li>• User Permissions - global permission loading</li>
              <li>• Route Guards - navigation permission checks</li>
            </ul>
          </div>
          
          <div>
            <strong>🎯 Features:</strong>
            <ul class="mt-1 ml-4 space-y-1 text-gray-600">
              <li>• Simple spinner overlay - no text or complex UI</li>
              <li>• Automatic integration with useQuery/API calls</li>
              <li>• No manual loading states in components</li>
              <li>• Centralized loading management</li>
              <li>• Multiple concurrent loadings handled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import { useGlobalLoading } from '@/composables/useGlobalLoading.js'
import { LOADING_KEYS } from '@/composables/useLoadingIntegration.js'

const { setLoading, isGlobalLoading } = useGlobalLoading()

const testWorklogs = () => {
  setLoading(LOADING_KEYS.WORKLOGS, true)
  setTimeout(() => setLoading(LOADING_KEYS.WORKLOGS, false), 2000)
}

const testProjects = () => {
  setLoading(LOADING_KEYS.PROJECTS, true)
  setTimeout(() => setLoading(LOADING_KEYS.PROJECTS, false), 2000)
}

const testPermissions = () => {
  setLoading(LOADING_KEYS.PERMISSIONS, true)
  setTimeout(() => setLoading(LOADING_KEYS.PERMISSIONS, false), 2000)
}

const testPositions = () => {
  setLoading(LOADING_KEYS.POSITIONS, true)
  setTimeout(() => setLoading(LOADING_KEYS.POSITIONS, false), 2000)
}
</script>
</template>