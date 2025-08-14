<template>
  <div class="p-4 bg-gray-100 rounded-lg">
    <h3 class="text-lg font-bold mb-4">Permission Test Component</h3>

    <!-- Permission Status -->
    <div class="mb-4">
      <h4 class="font-semibold mb-2">Permission Status:</h4>
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <span
            class="w-3 h-3 rounded-full"
            :class="isReady ? 'bg-green-500' : 'bg-red-500'"
          ></span>
          <span>Permissions Ready: {{ isReady }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span
            class="w-3 h-3 rounded-full"
            :class="isLoading ? 'bg-yellow-500' : 'bg-gray-300'"
          ></span>
          <span>Loading: {{ isLoading }}</span>
        </div>
        <div v-if="error" class="text-red-600">Error: {{ error }}</div>
      </div>
    </div>

    <!-- Permissions Cache Info -->
    <div class="mb-4">
      <h4 class="font-semibold mb-2">Cache Info:</h4>
      <div class="text-sm space-y-1">
        <div>Global Roles: {{ globalRoles.length }}</div>
        <div>Project Access: {{ projectAccess.length }}</div>
        <div>All Permissions: {{ allPermissions.length }}</div>
        <div>
          Last Fetched:
          {{
            lastFetched ? new Date(lastFetched).toLocaleTimeString() : "Never"
          }}
        </div>
      </div>
    </div>

    <!-- Manual Refresh Button -->
    <div class="mb-4 space-y-2">
      <button
        @click="handleRefresh"
        :disabled="isLoading"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isLoading ? "Refreshing..." : "Manual Refresh Permissions" }}
      </button>

      <button
        @click="handleForceRefresh"
        :disabled="isLoading"
        class="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
      >
        {{ isLoading ? "Force Refreshing..." : "Force Refresh (with Loading)" }}
      </button>
    </div>

    <!-- Permission Details -->
    <div class="space-y-4">
      <div>
        <h4 class="font-semibold mb-2">Global Roles:</h4>
        <pre class="text-xs bg-white p-2 rounded overflow-auto max-h-32">{{
          JSON.stringify(globalRoles, null, 2)
        }}</pre>
      </div>

      <div>
        <h4 class="font-semibold mb-2">Project Access:</h4>
        <pre class="text-xs bg-white p-2 rounded overflow-auto max-h-32">{{
          JSON.stringify(projectAccess, null, 2)
        }}</pre>
      </div>

      <div>
        <h4 class="font-semibold mb-2">All Permissions:</h4>
        <pre class="text-xs bg-white p-2 rounded overflow-auto max-h-32">{{
          JSON.stringify(allPermissions, null, 2)
        }}</pre>
      </div>
    </div>

    <!-- Permission Check Examples -->
    <div class="mt-6 bg-gray-50 p-4 rounded-lg">
      <h4 class="font-semibold mb-3">Permission Check Examples:</h4>
      <div class="space-y-2 text-sm">
        <!-- Global Permission Check -->
        <div class="flex items-center space-x-2">
          <span
            class="w-3 h-3 rounded-full"
            :class="canCreateQuotation ? 'bg-green-500' : 'bg-red-500'"
          ></span>
          <span>Can Create Quotation (Global): {{ canCreateQuotation }}</span>
        </div>

        <!-- Project Permission Check (example with project ID 1) -->
        <div class="flex items-center space-x-2">
          <span
            class="w-3 h-3 rounded-full"
            :class="canUpdateQuotationProject1 ? 'bg-green-500' : 'bg-red-500'"
          ></span>
          <span
            >Can Update Quotation in Project 1:
            {{ canUpdateQuotationProject1 }}</span
          >
        </div>

        <!-- Show usage examples -->
        <div class="mt-3 p-2 bg-blue-50 rounded text-xs">
          <strong>Usage Examples:</strong><br />
          <code>hasGlobalPermission(PERMISSIONS.CREATE_QUOTATION)</code><br />
          <code
            >hasProjectPermission(projectId, PERMISSIONS.UPDATE_QUOTATION)</code
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  usePermissions,
  fetchUserPermissions,
} from "@/composables/usePermissions.js";
import { useGlobalLoading } from "@/composables/useGlobalLoading.js";

const {
  permissions,
  isLoading,
  error,
  isReady,
  globalRoles,
  projectAccess,
  allPermissions,
  refetchPermissions,
  hasGlobalPermission,
  hasProjectPermission,
  PERMISSIONS,
} = usePermissions();

const { setLoading } = useGlobalLoading();

const lastFetched = computed(() => permissions.value.lastFetched);

// Permission check examples
const canCreateQuotation = computed(() => {
  return hasGlobalPermission(PERMISSIONS.CREATE_QUOTATION);
});

const canUpdateQuotationProject1 = computed(() => {
  return hasProjectPermission(1, PERMISSIONS.UPDATE_QUOTATION);
});

const handleRefresh = async () => {
  await refetchPermissions(true);
};

const handleForceRefresh = async () => {
  const loadingKey = "manual-force-refresh";

  try {
    setLoading(loadingKey, true);

    await fetchUserPermissions(true);
  } catch (error) {
    console.error("❌ Force refresh failed:", error);
  } finally {
    setLoading(loadingKey, false);
  }
};
</script>
