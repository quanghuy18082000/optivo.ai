<template>
  <div
    class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border z-40"
  >
    <h3 class="text-sm font-semibold mb-3 text-gray-800">
      🧪 Loading Test Panel
    </h3>

    <div class="space-y-2 text-xs">
      <div class="flex items-center justify-between">
        <span>Global Loading:</span>
        <span :class="isGlobalLoading ? 'text-green-600' : 'text-gray-400'">
          {{ isGlobalLoading ? "✅ Active" : "❌ Inactive" }}
        </span>
      </div>

      <div class="border-t pt-2">
        <div class="text-xs text-gray-600 mb-1">Test Loading States:</div>

        <button
          @click="testWorklogsLoading"
          class="block w-full text-left px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 rounded mb-1"
        >
          🔄 Test Worklogs Loading
        </button>

        <button
          @click="testProjectsLoading"
          class="block w-full text-left px-2 py-1 text-xs bg-green-50 hover:bg-green-100 rounded mb-1"
        >
          📁 Test Projects Loading
        </button>

        <button
          @click="testPermissionsLoading"
          class="block w-full text-left px-2 py-1 text-xs bg-purple-50 hover:bg-purple-100 rounded mb-1"
        >
          🔐 Test Permissions Loading
        </button>

        <button
          @click="testPositionsLoading"
          class="block w-full text-left px-2 py-1 text-xs bg-orange-50 hover:bg-orange-100 rounded mb-1"
        >
          👥 Test Positions Loading
        </button>

        <button
          @click="clearAllLoading"
          class="block w-full text-left px-2 py-1 text-xs bg-red-50 hover:bg-red-100 rounded"
        >
          🗑️ Clear All Loading
        </button>
      </div>

      <div class="border-t pt-2 text-xs text-gray-500">
        <div>Active Keys: {{ activeLoadingKeys.length }}</div>
        <div v-if="activeLoadingKeys.length > 0" class="text-xs">
          {{ activeLoadingKeys.join(", ") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useGlobalLoading } from "@/composables/useGlobalLoading.js";
import { LOADING_KEYS } from "@/composables/useLoadingIntegration.js";

const { setLoading, clearAllLoading, isGlobalLoading } = useGlobalLoading();

// For debugging - show active loading keys
const activeLoadingKeys = computed(() => {
  // This is a simplified version - in real implementation you'd need to expose the Map
  const keys = [];
  if (isGlobalLoading.value) {
    keys.push("some-active-key");
  }
  return keys;
});

const testWorklogsLoading = () => {
  setLoading(LOADING_KEYS.WORKLOGS, true);
  setTimeout(() => {
    setLoading(LOADING_KEYS.WORKLOGS, false);
  }, 2000);
};

const testProjectsLoading = () => {
  setLoading(LOADING_KEYS.PROJECTS, true);
  setTimeout(() => {
    setLoading(LOADING_KEYS.PROJECTS, false);
  }, 2000);
};

const testPermissionsLoading = () => {
  setLoading(LOADING_KEYS.PERMISSIONS, true);
  setTimeout(() => {
    setLoading(LOADING_KEYS.PERMISSIONS, false);
  }, 2000);
};

const testPositionsLoading = () => {
  setLoading(LOADING_KEYS.POSITIONS, true);
  setTimeout(() => {
    setLoading(LOADING_KEYS.POSITIONS, false);
  }, 2000);
};
</script>
