<template>
  <div v-if="selectedRole" class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">
      {{
        $t("project_permission.role_permissions_for", {
          role: selectedRole.name,
        })
      }}
    </h3>

    <!-- Loading Role Details -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
      <span class="ml-2 text-gray-600">{{ $t("common.loading") }}...</span>
    </div>

    <template v-else>
      <!-- No Permission Warning -->
      <div
        v-if="!canEdit"
        class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
      >
        <div class="flex items-center">
          <svg
            class="w-5 h-5 text-yellow-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <h4 class="text-sm font-medium text-yellow-800">Limited Access</h4>
            <p class="text-sm text-yellow-700 mt-1">
              You don't have permission to create or modify role permissions.
              You can only view existing permissions.
            </p>
          </div>
        </div>
      </div>

      <!-- Permission Modules -->
      <div
        class="space-y-6"
        :class="{ 'opacity-50 pointer-events-none': !canEdit }"
      >
        <PermissionModule
          v-for="module in permissionModules"
          :key="module.key"
          :module="module"
          :has-permission="hasPermission"
          @select-all="handleSelectAll"
          @toggle-permission="handleTogglePermission"
        />
      </div>

      <div class="mt-6 flex justify-end">
        <button
          @click="$emit('save')"
          :disabled="saving || !canEdit"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            v-if="saving"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ saving ? $t("common.saving") : $t("common.save") }}
        </button>
      </div>
    </template>
  </div>

  <!-- No Role Selected -->
  <div v-else class="bg-white rounded-lg shadow p-12 text-center">
    <svg
      class="mx-auto h-12 w-12 text-gray-400 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      ></path>
    </svg>
    <h3 class="text-lg font-medium text-gray-900 mb-2">
      {{ $t("project_permission.select_role_to_manage") }}
    </h3>
    <p class="text-gray-500">
      {{ $t("project_permission.select_role_description") }}
    </p>
  </div>
</template>

<script setup>
import PermissionModule from "./PermissionModule.vue";

defineProps({
  selectedRole: {
    type: Object,
    default: null,
  },
  permissionModules: {
    type: Array,
    default: () => [],
  },
  hasPermission: {
    type: Function,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  canEdit: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "save",
  "select-all-permissions",
  "toggle-permission",
]);

const handleSelectAll = (moduleKey, selected) => {
  emit("select-all-permissions", moduleKey, selected);
};

const handleTogglePermission = (permission, checked) => {
  emit("toggle-permission", permission, checked);
};
</script>
