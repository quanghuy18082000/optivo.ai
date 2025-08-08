<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-bold mb-4">Quotation Permission Example</h3>

    <!-- Create Quotation Section (Global Permission) -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">
        Create New Quotation (Global Permission)
      </h4>
      <div class="flex items-center space-x-4">
        <button
          v-if="canCreateQuotation"
          @click="handleCreateQuotation"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          ✅ Create Quotation
        </button>
        <div
          v-else
          class="px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
        >
          ❌ No Permission to Create Quotation
        </div>
        <span class="text-sm text-gray-600">
          (Requires: <code>{{ PERMISSIONS.CREATE_QUOTATION }}</code
          >)
        </span>
      </div>
    </div>

    <!-- Update Quotation Section (Project Permission) -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Update Quotation (Project Permission)</h4>

      <!-- Project Selection -->
      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Select Project:
        </label>
        <select
          v-model="selectedProjectId"
          class="border border-gray-300 rounded px-3 py-2 w-48"
        >
          <option value="">-- Select Project --</option>
          <option
            v-for="projectId in accessibleProjects"
            :key="projectId"
            :value="projectId"
          >
            Project {{ projectId }}
          </option>
        </select>
      </div>

      <!-- Update Button -->
      <div class="flex items-center space-x-4">
        <button
          v-if="selectedProjectId && canUpdateQuotationInSelectedProject"
          @click="handleUpdateQuotation"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ✅ Update Quotation in Project {{ selectedProjectId }}
        </button>
        <div
          v-else-if="selectedProjectId"
          class="px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
        >
          ❌ No Permission to Update Quotation in Project
          {{ selectedProjectId }}
        </div>
        <div
          v-else
          class="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed"
        >
          Please select a project first
        </div>
        <span class="text-sm text-gray-600">
          (Requires: <code>{{ PERMISSIONS.UPDATE_QUOTATION }}</code
          >)
        </span>
      </div>
    </div>

    <!-- Permission Status -->
    <div class="bg-gray-50 p-4 rounded">
      <h4 class="font-semibold mb-2">Current Permission Status:</h4>
      <div class="space-y-1 text-sm">
        <div class="flex items-center space-x-2">
          <span
            class="w-3 h-3 rounded-full"
            :class="canCreateQuotation ? 'bg-green-500' : 'bg-red-500'"
          ></span>
          <span>Global CREATE_QUOTATION: {{ canCreateQuotation }}</span>
        </div>
        <div v-if="selectedProjectId" class="flex items-center space-x-2">
          <span
            class="w-3 h-3 rounded-full"
            :class="
              canUpdateQuotationInSelectedProject
                ? 'bg-green-500'
                : 'bg-red-500'
            "
          ></span>
          <span
            >Project {{ selectedProjectId }} UPDATE_QUOTATION:
            {{ canUpdateQuotationInSelectedProject }}</span
          >
        </div>
        <div class="text-xs text-gray-500 mt-2">
          Accessible Projects: {{ accessibleProjects.join(", ") || "None" }}
        </div>
      </div>
    </div>

    <!-- Code Example -->
    <div class="mt-4 bg-blue-50 p-3 rounded text-xs">
      <strong>Code Example:</strong>
      <pre class="mt-1 text-gray-700">
// Import permissions
import { usePermissions } from '@/composables/usePermissions.js'

const { hasGlobalPermission, hasProjectPermission, PERMISSIONS } = usePermissions()

// Check global permission
const canCreate = hasGlobalPermission(PERMISSIONS.CREATE_QUOTATION)

// Check project permission  
const canUpdate = hasProjectPermission(projectId, PERMISSIONS.UPDATE_QUOTATION)
      </pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePermissions } from "@/composables/usePermissions.js";

const {
  hasGlobalPermission,
  hasProjectPermission,
  accessibleProjects,
  PERMISSIONS,
} = usePermissions();

// Selected project for testing
const selectedProjectId = ref("");

// Permission checks
const canCreateQuotation = computed(() => {
  return hasGlobalPermission(PERMISSIONS.CREATE_QUOTATION);
});

const canUpdateQuotationInSelectedProject = computed(() => {
  if (!selectedProjectId.value) return false;
  return hasProjectPermission(
    selectedProjectId.value,
    PERMISSIONS.UPDATE_QUOTATION
  );
});

// Action handlers
const handleCreateQuotation = () => {
  console.log("🎯 Creating new quotation...");
  alert("Creating new quotation! (This is just a demo)");
};

const handleUpdateQuotation = () => {
  console.log(`🎯 Updating quotation in project ${selectedProjectId.value}...`);
  alert(
    `Updating quotation in project ${selectedProjectId.value}! (This is just a demo)`
  );
};
</script>
