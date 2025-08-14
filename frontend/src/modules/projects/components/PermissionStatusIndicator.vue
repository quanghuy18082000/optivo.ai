<template>
  <div class="bg-white rounded-lg shadow p-4 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900 flex items-center">
        <svg
          class="w-5 h-5 mr-2 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        Your Permissions
      </h3>
      <button
        @click="showDetails = !showDetails"
        class="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        {{ showDetails ? "Hide Details" : "Show Details" }}
      </button>
    </div>

    <!-- Permission Summary -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">
          {{ totalPermissions }}
        </div>
        <div class="text-sm text-gray-600">Total Permissions</div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-green-600">
          {{ availableActions }}
        </div>
        <div class="text-sm text-gray-600">Available Actions</div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-yellow-600">
          {{ restrictedActions }}
        </div>
        <div class="text-sm text-gray-600">Restricted Actions</div>
      </div>
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-purple-600">
          {{ userRoles.length }}
        </div>
        <div class="text-sm text-gray-600">Active Roles</div>
      </div>
    </div>

    <!-- Quick Action Status -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="space-y-2">
        <h4 class="font-medium text-gray-900">Project Editing</h4>
        <div class="space-y-1">
          <PermissionItem
            :allowed="canEditProject"
            label="Edit Basic Information"
            permission="project.update"
          />
          <PermissionItem
            :allowed="canEditQuotation"
            label="Edit Quotation"
            permission="project.update_quotation"
          />
          <PermissionItem
            :allowed="canEditPlan"
            label="Edit Project Plan"
            permission="project.update"
          />
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="font-medium text-gray-900">User Management</h4>
        <div class="space-y-1">
          <PermissionItem
            :allowed="canManageRoles"
            label="Manage Roles"
            permission="project.create_role"
          />
          <PermissionItem
            :allowed="canAssignRoles"
            label="Assign Roles"
            permission="project.assign_role"
          />
          <PermissionItem
            :allowed="canAddUsers"
            label="Add Users"
            permission="project.add_user"
          />
          <PermissionItem
            :allowed="canDeleteUsers"
            label="Remove Users"
            permission="project.delete_user"
          />
        </div>
      </div>
    </div>

    <!-- Detailed View -->
    <div v-if="showDetails" class="border-t pt-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Direct Permissions -->
        <div>
          <h4 class="font-medium text-gray-900 mb-3">Direct Permissions</h4>
          <div
            v-if="userPermissions.length === 0"
            class="text-sm text-gray-500 italic"
          >
            No direct permissions assigned
          </div>
          <div v-else class="space-y-1">
            <div
              v-for="permission in userPermissions"
              :key="permission"
              class="flex items-center text-sm"
            >
              <svg
                class="w-4 h-4 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{
                permission
              }}</code>
            </div>
          </div>
        </div>

        <!-- Role-based Permissions -->
        <div>
          <h4 class="font-medium text-gray-900 mb-3">Role-based Permissions</h4>
          <div
            v-if="userRoles.length === 0"
            class="text-sm text-gray-500 italic"
          >
            No roles assigned
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="role in userRoles"
              :key="role.id"
              class="border rounded-lg p-3"
            >
              <div class="font-medium text-sm text-gray-900 mb-2">
                {{ role.name }}
              </div>
              <div
                v-if="role.permissions && role.permissions.length > 0"
                class="space-y-1"
              >
                <div
                  v-for="permission in role.permissions"
                  :key="permission"
                  class="flex items-center text-xs"
                >
                  <svg
                    class="w-3 h-3 text-blue-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <code class="bg-blue-50 px-2 py-1 rounded">{{
                    permission
                  }}</code>
                </div>
              </div>
              <div v-else class="text-xs text-gray-500 italic">
                No permissions in this role
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Missing Permissions Warning -->
      <div
        v-if="missingCriticalPermissions.length > 0"
        class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
      >
        <div class="flex items-center mb-2">
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
          <h5 class="font-medium text-yellow-800">Limited Access</h5>
        </div>
        <p class="text-sm text-yellow-700 mb-2">
          You're missing some permissions that may limit your ability to use
          certain features:
        </p>
        <ul class="text-sm text-yellow-700 space-y-1">
          <li
            v-for="permission in missingCriticalPermissions"
            :key="permission"
            class="flex items-center"
          >
            <svg
              class="w-4 h-4 text-yellow-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <code class="text-xs">{{ permission }}</code>
          </li>
        </ul>
        <p class="text-sm text-yellow-700 mt-2">
          Contact your project administrator if you need access to these
          features.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  userPermissions: {
    type: Array,
    default: () => [],
  },
  userRoles: {
    type: Array,
    default: () => [],
  },
  canEditProject: {
    type: Boolean,
    default: false,
  },
  canEditQuotation: {
    type: Boolean,
    default: false,
  },
  canEditPlan: {
    type: Boolean,
    default: false,
  },
  canManageRoles: {
    type: Boolean,
    default: false,
  },
  canAssignRoles: {
    type: Boolean,
    default: false,
  },
  canAddUsers: {
    type: Boolean,
    default: false,
  },
  canDeleteUsers: {
    type: Boolean,
    default: false,
  },
});

const showDetails = ref(false);

// Computed properties
const totalPermissions = computed(() => {
  const directPermissions = props.userPermissions.length;
  const rolePermissions = props.userRoles.reduce((total, role) => {
    return total + (role.permissions ? role.permissions.length : 0);
  }, 0);
  return directPermissions + rolePermissions;
});

const availableActions = computed(() => {
  const actions = [
    props.canEditProject,
    props.canEditQuotation,
    props.canEditPlan,
    props.canManageRoles,
    props.canAssignRoles,
    props.canAddUsers,
    props.canDeleteUsers,
  ];
  return actions.filter(Boolean).length;
});

const restrictedActions = computed(() => {
  return 7 - availableActions.value; // Total possible actions minus available
});

const missingCriticalPermissions = computed(() => {
  const criticalPermissions = [
    "project.view",
    "project.update",
    "project.update_quotation",
  ];

  const allUserPermissions = [
    ...props.userPermissions,
    ...props.userRoles.flatMap((role) => role.permissions || []),
  ];

  return criticalPermissions.filter(
    (permission) => !allUserPermissions.includes(permission)
  );
});
</script>

<script>
// Permission Item Component
const PermissionItem = {
  props: {
    allowed: Boolean,
    label: String,
    permission: String,
  },
  template: `
    <div class="flex items-center justify-between text-sm">
      <span class="text-gray-700">{{ label }}</span>
      <div class="flex items-center">
        <svg v-if="allowed" class="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <svg v-else class="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        <span :class="allowed ? 'text-green-600' : 'text-red-600'" class="font-medium">
          {{ allowed ? 'Allowed' : 'Restricted' }}
        </span>
      </div>
    </div>
  `,
};

export default {
  components: {
    PermissionItem,
  },
};
</script>
