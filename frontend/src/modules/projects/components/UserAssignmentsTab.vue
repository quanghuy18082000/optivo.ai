<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-900">
          {{ $t("project_permission.user_role_assignments") }}
        </h3>
      </div>

      <!-- User Role Assignment Form -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 class="text-sm font-medium text-gray-900 mb-4">
          {{ $t("project_permission.assign_user_role") }}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- User Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t("project_permission.select_user") }}
            </label>
            <Select
              :model-value="selectedUserForAssignment"
              @update:model-value="
                $emit('update:selectedUserForAssignment', $event)
              "
              :options="availableUsersOptions"
              :placeholder="$t('project_permission.choose_user')"
              :loading="loadingUsers"
              class="w-full"
            />
          </div>

          <!-- Role Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t("project_permission.select_role") }}
            </label>
            <Select
              :model-value="selectedRoleForAssignment"
              @update:model-value="
                $emit('update:selectedRoleForAssignment', $event)
              "
              :options="projectRolesOptions"
              :placeholder="$t('project_permission.choose_role')"
              :loading="loadingRoles"
              class="w-full"
            />
          </div>

          <!-- Assign Button -->
          <div class="flex w-fit items-end">
            <button
              @click="$emit('assign-role')"
              :disabled="
                !selectedUserForAssignment ||
                !selectedRoleForAssignment ||
                assigningRole
              "
              class="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                v-if="assigningRole"
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
              {{
                assigningRole
                  ? $t("common.assigning")
                  : $t("project_permission.assign_role")
              }}
            </button>
          </div>
        </div>
      </div>

      <!-- No Permission Warning for Assignments -->
      <div
        v-if="!canAssignRole && !canAddUser && !canDeleteUser"
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
            <h4 class="text-sm font-medium text-yellow-800">
              Read-Only Access
            </h4>
            <p class="text-sm text-yellow-700 mt-1">
              You don't have permission to assign roles or manage users. You can
              only view existing assignments.
            </p>
          </div>
        </div>
      </div>

      <!-- User Assignments Table -->
      <div
        v-if="loadingUserAssignments"
        class="flex items-center justify-center py-8"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
        <span class="ml-2 text-gray-600">{{ $t("common.loading") }}...</span>
      </div>

      <div v-else>
        <Table
          :columns="userAssignmentColumns"
          :data="projectUsersWithRoles"
          :loading="loadingUserAssignments"
          :empty-message="$t('project_permission.no_user_assignments')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Table from "@/components/ui/Table.vue";
import Select from "@/components/ui/Select.vue";

const props = defineProps({
  selectedUserForAssignment: {
    type: [String, Number],
    default: null,
  },
  selectedRoleForAssignment: {
    type: [String, Number],
    default: null,
  },
  availableUsersOptions: {
    type: Array,
    default: () => [],
  },
  projectRolesOptions: {
    type: Array,
    default: () => [],
  },
  loadingUsers: {
    type: Boolean,
    default: false,
  },
  loadingRoles: {
    type: Boolean,
    default: false,
  },
  assigningRole: {
    type: Boolean,
    default: false,
  },
  canAssignRole: {
    type: Boolean,
    default: true,
  },
  canAddUser: {
    type: Boolean,
    default: true,
  },
  canDeleteUser: {
    type: Boolean,
    default: true,
  },
  loadingUserAssignments: {
    type: Boolean,
    default: false,
  },
  userAssignmentColumns: {
    type: Array,
    default: () => [],
  },
  projectUsersWithRoles: {
    type: Array,
    default: () => [],
  },
});

defineEmits([
  "assign-role",
  "update:selectedUserForAssignment",
  "update:selectedRoleForAssignment",
]);
</script>
