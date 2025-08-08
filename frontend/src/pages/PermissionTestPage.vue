<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-2xl font-bold mb-8">Permission System Test</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Permission Test Component -->
        <div>
          <PermissionTestComponent />
        </div>

        <!-- Route Navigation Test -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-bold mb-4">Route Navigation Test</h3>
          <p class="text-sm text-gray-600 mb-4">
            Click these links to test permission refresh on route changes:
          </p>
          <div class="space-y-2">
            <router-link
              to="/projects"
              class="block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
            >
              Go to Projects
            </router-link>
            <router-link
              to="/worklogs"
              class="block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-center"
            >
              Go to Worklogs
            </router-link>
            <router-link
              to="/user-management"
              class="block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-center"
            >
              Go to User Management
            </router-link>
            <button
              @click="refreshPage"
              class="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Refresh Page (F5)
            </button>
          </div>
        </div>
      </div>

      <!-- Quotation Permission Example -->
      <div class="mt-6">
        <QuotationPermissionExample />
      </div>

      <!-- Add Project Permission Demo -->
      <div class="mt-6">
        <AddProjectPermissionDemo />
      </div>

      <!-- Validation Permission Demo -->
      <div class="mt-6">
        <ValidationPermissionDemo />
      </div>

      <!-- API Request Demo -->
      <div class="mt-6">
        <ApiRequestDemo />
      </div>

      <!-- Global Permission Demo -->
      <div class="mt-6">
        <GlobalPermissionDemo />
      </div>

      <!-- Console Log Instructions -->
      <div class="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-yellow-800 mb-2">
          Testing Instructions:
        </h3>
        <ol class="list-decimal list-inside space-y-1 text-yellow-700">
          <li>Open browser Developer Tools (F12) and go to Console tab</li>
          <li>
            Watch for permission-related logs with 🔄, ✅, ❌, and 📋 emojis
          </li>
          <li>Navigate between routes using the buttons above</li>
          <li>Refresh the page to test initialization</li>
          <li>
            Check that API calls to
            <code>/system-config/users/combined-roles/me</code> are made
            <strong>BEFORE</strong> route access
          </li>
          <li>Notice 📋 logs when using cached permissions (no API call)</li>
        </ol>
      </div>

      <!-- Expected Behavior -->
      <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-blue-800 mb-2">
          Expected Behavior:
        </h3>
        <ul class="list-disc list-inside space-y-1 text-blue-700">
          <li>
            <strong>First route access:</strong> API call made before entering
            route + Loading screen
          </li>
          <li>
            <strong>Same route refresh:</strong> API call made (cache expired or
            forced) + Loading screen
          </li>
          <li>
            <strong>Different route:</strong> API call made (route changed) +
            Loading screen
          </li>
          <li>
            <strong>Quick navigation:</strong> May use cache if within 2 minutes
            (no loading)
          </li>
          <li>
            <strong>Permission check:</strong> Happens BEFORE route access, not
            after
          </li>
          <li>
            <strong>Loading screen:</strong> Shows during API calls for smooth
            UX
          </li>
        </ul>
      </div>

      <!-- Loading Test -->
      <div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-green-800 mb-2">
          Loading Screen Test:
        </h3>
        <ul class="list-disc list-inside space-y-1 text-green-700">
          <li>
            Use "Force Refresh (with Loading)" button to see loading screen
          </li>
          <li>
            Navigate between routes to see loading during permission checks
          </li>
          <li>Refresh page (F5) to see loading during app initialization</li>
          <li>Loading screen should appear/disappear smoothly</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import PermissionTestComponent from "@/components/test/PermissionTestComponent.vue";
import QuotationPermissionExample from "@/components/examples/QuotationPermissionExample.vue";
import AddProjectPermissionDemo from "@/components/examples/AddProjectPermissionDemo.vue";
import ValidationPermissionDemo from "@/components/examples/ValidationPermissionDemo.vue";
import ApiRequestDemo from "@/components/examples/ApiRequestDemo.vue";
import GlobalPermissionDemo from "@/components/examples/GlobalPermissionDemo.vue";

const refreshPage = () => {
  window.location.reload();
};
</script>
