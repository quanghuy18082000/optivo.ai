<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-900">
          {{ $t("project_permission.user_role_assignments") }}
        </h3>
      </div>

      <!-- User Role Assignment Form -->
      <div
        :class="[
          'rounded-lg p-4 mb-6 transition-colors',
          isEditingUser
            ? 'bg-blue-50 border-2 border-blue-200'
            : 'bg-gray-50 border border-gray-200',
        ]"
      >
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-sm font-medium text-gray-900">
            {{
              isEditingUser
                ? $t("project_permission.update_user_roles")
                : $t("project_permission.assign_user_role")
            }}
          </h4>
          <button
            v-if="isEditingUser"
            @click="$emit('cancel-editing')"
            class="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {{ $t("common.cancel") }}
          </button>
        </div>

        <!-- Editing Info -->
        <div
          v-if="isEditingUser && currentEditingUser"
          class="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4"
        >
          <div class="flex items-center">
            <svg
              class="w-4 h-4 text-blue-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm text-blue-800">
              {{ $t("project_permission.editing_roles_for") }}:
              <strong>{{ currentEditingUser.user_name }}</strong>
            </span>
          </div>
        </div>
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
              :disabled="isEditingUser"
              class="w-full"
            />
          </div>

          <!-- Role Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t("project_permission.select_roles") }}
            </label>
            <MultiSelect
              :model-value="selectedRolesForAssignment"
              @update:model-value="
                $emit('update:selectedRolesForAssignment', $event)
              "
              :options="projectRolesOptions"
              :placeholder="$t('project_permission.choose_roles')"
              :loading="loadingRoles"
              class="w-full"
              :max-display="2"
              :searchable="true"
              :search-placeholder="$t('project_permission.search_roles')"
              :show-select-all="true"
              :max-height="200"
            />
          </div>

          <!-- Assign Button -->
          <div v-if="canAssignRole" class="flex w-fit items-end">
            <button
              @click="$emit('assign-role')"
              :disabled="
                !selectedUserForAssignment ||
                !selectedRolesForAssignment ||
                selectedRolesForAssignment.length === 0 ||
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
                  ? isEditingUser
                    ? $t("common.saving")
                    : $t("common.assigning")
                  : isEditingUser
                  ? $t("project_permission.update_roles")
                  : $t("project_permission.assign_roles")
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
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <!-- Header -->
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ $t("common.user") }}
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ $t("project_permission.assigned_roles") }}
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ $t("common.status") }}
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ $t("common.actions") }}
                </th>
              </tr>
            </thead>

            <!-- Body -->
            <tbody class="bg-white divide-y divide-gray-200">
              <!-- Loading state -->
              <tr v-if="loadingUserAssignments">
                <td colspan="4" class="px-6 py-12 text-center">
                  <div class="flex items-center justify-center">
                    <div
                      class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                    ></div>
                    <span class="ml-2 text-gray-600"
                      >{{ $t("common.loading") }}...</span
                    >
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-else-if="!userAssignments.length">
                <td colspan="4" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center">
                    <svg
                      class="w-12 h-12 mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <p class="text-sm font-medium text-gray-900">
                      {{ $t("project_permission.no_user_assignments") }}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Data rows -->
              <tr
                v-else
                v-for="user in userAssignments"
                :key="user.user_id"
                :class="[
                  'hover:bg-gray-50',
                  isEditingUser && currentEditingUser?.user_id === user.user_id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : '',
                ]"
              >
                <!-- User Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img
                        v-if="user.avatar"
                        class="h-10 w-10 rounded-full"
                        :src="user.avatar"
                        :alt="user.user_name"
                      />
                      <div
                        v-else
                        class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center"
                      >
                        <span class="text-sm font-medium text-gray-700">
                          {{ getInitials(user.user_name) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.user_name }}
                      </div>
                      <div class="text-sm text-gray-500" v-if="user.email">
                        {{ user.email }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Roles -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="roleItem in user.list_role"
                      :key="roleItem.id"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      :title="`Role ID: ${roleItem.project_role_id}`"
                    >
                      {{ roleItem.project_role_name }}
                    </span>
                    <span
                      v-if="!user.list_role || user.list_role.length === 0"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {{ $t("project_permission.no_roles_assigned") }}
                    </span>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800', // default to active if no status
                    ]"
                  >
                    {{
                      user.status
                        ? $t(`common.${user.status}`)
                        : $t("common.active")
                    }}
                  </span>
                </td>

                <!-- Actions -->
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <button
                    v-if="canAssignRole"
                    @click="$emit('manage-roles', user)"
                    :disabled="
                      isEditingUser &&
                      currentEditingUser?.user_id === user.user_id
                    "
                    :class="[
                      'mr-3 transition-colors',
                      isEditingUser &&
                      currentEditingUser?.user_id === user.user_id
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:text-blue-900',
                    ]"
                  >
                    {{
                      isEditingUser &&
                      currentEditingUser?.user_id === user.user_id
                        ? $t("project_permission.editing")
                        : $t("project_permission.manage_roles")
                    }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <Pagination
          v-if="paginationData.total_pages > 1"
          :current-page="paginationData.current_page"
          :total-pages="paginationData.total_pages"
          :total="paginationData.total_count"
          :page-size="paginationData.per_page"
          :has-next="paginationData.current_page < paginationData.total_pages"
          :has-previous="paginationData.current_page > 1"
          @page-change="$emit('page-change', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Pagination from "@/components/ui/Pagination.vue";
import Select from "@/components/ui/Select.vue";
import MultiSelect from "@/components/ui/MultiSelect.vue";

const props = defineProps({
  selectedUserForAssignment: {
    type: [String, Number],
    default: null,
  },
  selectedRolesForAssignment: {
    type: Array,
    default: () => [],
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
  // New props for pagination support
  userAssignments: {
    type: Array,
    default: () => [],
  },
  paginationData: {
    type: Object,
    default: () => ({
      current_page: 1,
      total_pages: 0,
      total_count: 0,
      per_page: 10,
    }),
  },
  // Editing state props
  isEditingUser: {
    type: Boolean,
    default: false,
  },
  currentEditingUser: {
    type: Object,
    default: null,
  },
});

// Helper method to get user initials
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

defineEmits([
  "assign-role",
  "update:selectedUserForAssignment",
  "update:selectedRolesForAssignment",
  "page-change",
  "edit-user-roles",
  "manage-roles",
  "remove-user",
  "cancel-editing",
]);
</script>
