<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-bold mb-4">Validation Permission Demo</h3>

    <!-- Permission Status -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="font-semibold mb-2">Current Permission Status:</h4>
      <div class="flex items-center space-x-2">
        <span
          class="w-3 h-3 rounded-full"
          :class="canCreateQuotation ? 'bg-green-500' : 'bg-red-500'"
        ></span>
        <span>CREATE_QUOTATION Permission: {{ canCreateQuotation }}</span>
      </div>
    </div>

    <!-- Validation Behavior -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Validation Behavior:</h4>
      <div class="space-y-3">
        <!-- Step 1 Validation -->
        <div class="p-3 bg-blue-50 rounded">
          <div class="flex items-center space-x-2 mb-2">
            <span
              class="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs"
              >1</span
            >
            <strong>Step 1: Basic Information</strong>
          </div>
          <ul class="text-sm space-y-1 ml-7">
            <li>✅ Always validates project name, dates, description</li>
            <li>✅ Required regardless of permissions</li>
          </ul>
        </div>

        <!-- Step 2 Validation -->
        <div
          class="p-3 rounded"
          :class="canCreateQuotation ? 'bg-green-50' : 'bg-gray-50'"
        >
          <div class="flex items-center space-x-2 mb-2">
            <span
              class="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
              :class="canCreateQuotation ? 'bg-green-500' : 'bg-gray-400'"
              >2</span
            >
            <strong>Step 2: Quotation Input</strong>
          </div>
          <ul class="text-sm space-y-1 ml-7">
            <li v-if="canCreateQuotation">
              <span class="text-green-600">✅</span> Validates quotation fields
              (position, quantity, dates)
            </li>
            <li v-if="canCreateQuotation">
              <span class="text-green-600">✅</span> Requires at least one
              quotation
            </li>
            <li v-if="canCreateQuotation">
              <span class="text-green-600">✅</span> Checks for overlapping
              allocations
            </li>
            <li v-if="!canCreateQuotation">
              <span class="text-orange-600">⚠️</span> <strong>SKIPPED</strong> -
              No validation performed
            </li>
            <li v-if="!canCreateQuotation">
              <span class="text-blue-600">ℹ️</span> Returns true immediately
            </li>
          </ul>
        </div>

        <!-- Step 3 Validation -->
        <div class="p-3 bg-purple-50 rounded">
          <div class="flex items-center space-x-2 mb-2">
            <span
              class="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs"
            >
              {{ canCreateQuotation ? "3" : "2" }}
            </span>
            <strong
              >Step {{ canCreateQuotation ? "3" : "2" }}: Team
              Allocation</strong
            >
          </div>
          <ul class="text-sm space-y-1 ml-7">
            <li>
              ✅ Always validates plan fields (member, position, allocation)
            </li>
            <li>✅ Can be skipped with "Skip Input & Submit"</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Submit Behavior -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Submit Behavior:</h4>
      <div class="space-y-2 text-sm">
        <div class="flex items-start space-x-2">
          <span class="text-blue-600 mt-0.5">📝</span>
          <div>
            <strong>Normal Submit:</strong>
            <ul class="ml-4 mt-1 space-y-1">
              <li>• Validates Step 1 (always)</li>
              <li v-if="canCreateQuotation">• Validates Step 2 (quotation)</li>
              <li v-else>
                • <span class="text-orange-600">Skips Step 2 validation</span>
              </li>
              <li>
                • Validates Step {{ canCreateQuotation ? "3" : "2" }} (plan)
              </li>
            </ul>
          </div>
        </div>

        <div class="flex items-start space-x-2">
          <span class="text-red-600 mt-0.5">⚡</span>
          <div>
            <strong>Skip & Submit:</strong>
            <ul class="ml-4 mt-1 space-y-1">
              <li>• Validates Step 1 (always)</li>
              <li v-if="canCreateQuotation">• Validates Step 2 (quotation)</li>
              <li v-else>
                • <span class="text-orange-600">Skips Step 2 validation</span>
              </li>
              <li>
                •
                <span class="text-red-600"
                  >Skips Step
                  {{ canCreateQuotation ? "3" : "2" }} validation</span
                >
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- API Data -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">API Data Sent:</h4>
      <div class="p-3 bg-gray-100 rounded text-xs">
        <pre>{{
          {
            name: "Project Name",
            description: "Project Description",
            start_date: "2024-01-01",
            end_date: "2024-12-31",
            quotation: canCreateQuotation
              ? [
                  {
                    position_id: "1",
                    quantity: 1,
                    start_date: "2024-01-01",
                    end_date: "2024-12-31",
                  },
                ]
              : "null (no quotation data)",
            plan: [
              {
                user_id: 1,
                position_id: "1",
                allocation_rate: 1,
                start_date: "2024-01-01",
                end_date: "2024-12-31",
              },
            ],
          }
        }}</pre>
      </div>
    </div>

    <!-- Test Scenarios -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Test Scenarios (Add Project Only):</h4>
      <div class="space-y-2 text-sm">
        <div class="p-2 border-l-4 border-green-500 bg-green-50">
          <strong>✅ With CREATE_QUOTATION permission:</strong>
          <br />User must fill quotation data to proceed to plan step
        </div>
        <div class="p-2 border-l-4 border-orange-500 bg-orange-50">
          <strong>⚠️ Without CREATE_QUOTATION permission:</strong>
          <br />User can submit project with only basic info + plan (no
          quotation required)
        </div>
        <div class="p-2 border-l-4 border-blue-500 bg-blue-50">
          <strong>ℹ️ Edit Project:</strong>
          <br />Permission handling will be implemented later
        </div>
      </div>
    </div>

    <!-- Test Button -->
    <div class="flex space-x-4">
      <router-link
        to="/projects/add"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Test Add Project Validation
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { usePermissions } from "@/composables/usePermissions.js";

const { hasGlobalPermission, PERMISSIONS } = usePermissions();

// Permission check
const canCreateQuotation = computed(() => {
  return hasGlobalPermission(PERMISSIONS.CREATE_QUOTATION);
});
</script>
