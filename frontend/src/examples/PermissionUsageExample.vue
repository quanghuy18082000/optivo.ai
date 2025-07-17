<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Permission System Usage Examples</h1>

    <!-- Using directives with constants -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">
        1. Using Directives with Permission Constants
      </h2>

      <!-- Single permission check -->
      <button
        v-permission="WORKLOG_PERMISSIONS.CREATE"
        class="bg-blue-500 text-white px-4 py-2 rounded mr-2 mb-2"
      >
        Create Worklog
      </button>

      <!-- Multiple permissions (any) -->
      <button
        v-any-permission="[
          WORKLOG_PERMISSIONS.UPDATE_OWN,
          WORKLOG_PERMISSIONS.UPDATE_ANY,
        ]"
        class="bg-green-500 text-white px-4 py-2 rounded mr-2 mb-2"
      >
        Update Worklog
      </button>

      <!-- All permissions required -->
      <button
        v-all-permissions="[
          PROJECT_PERMISSIONS.ADD_USER,
          PROJECT_PERMISSIONS.ASSIGN_ROLE,
        ]"
        class="bg-purple-500 text-white px-4 py-2 rounded mr-2 mb-2"
      >
        Manage Project Users
      </button>

      <!-- Role-based visibility -->
      <button
        v-role="'admin'"
        class="bg-red-500 text-white px-4 py-2 rounded mr-2 mb-2"
      >
        Admin Only Button
      </button>

      <!-- Project-specific permission -->
      <button
        v-project-permission="{
          projectId: currentProjectId,
          permission: PROJECT_PERMISSIONS.UPDATE_PROJECT,
        }"
        class="bg-yellow-500 text-white px-4 py-2 rounded mr-2 mb-2"
      >
        Update This Project
      </button>
    </div>

    <!-- Using composable helpers -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">2. Using Composable Helpers</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Worklog permissions -->
        <div class="border p-4 rounded">
          <h3 class="font-semibold mb-2">Worklog Permissions</h3>
          <ul class="text-sm space-y-1">
            <li
              :class="
                worklogPermissions.canCreate ? 'text-green-600' : 'text-red-600'
              "
            >
              ✓ Can Create: {{ worklogPermissions.canCreate }}
            </li>
            <li
              :class="
                worklogPermissions.canView ? 'text-green-600' : 'text-red-600'
              "
            >
              ✓ Can View: {{ worklogPermissions.canView }}
            </li>
            <li
              :class="
                worklogPermissions.canUpdate ? 'text-green-600' : 'text-red-600'
              "
            >
              ✓ Can Update: {{ worklogPermissions.canUpdate }}
            </li>
            <li
              :class="
                worklogPermissions.canDelete ? 'text-green-600' : 'text-red-600'
              "
            >
              ✓ Can Delete: {{ worklogPermissions.canDelete }}
            </li>
          </ul>
        </div>

        <!-- Role permissions -->
        <div class="border p-4 rounded">
          <h3 class="font-semibold mb-2">Role Permissions</h3>
          <ul class="text-sm space-y-1">
            <li
              :class="
                rolePermissions.canView ? 'text-green-600' : 'text-red-600'
              "
            >
              ✓ Can View: {{ rolePermissions.canView }}
            </li>
            <li
              :class="
                rolePermissions.canCreate ? 'text-green-600' : 'text-red-600'
              "
            >
              ✓ Can Create: {{ rolePermissions.canCreate }}
            </li>
            <li
              :class="
                rolePermissions.canManageRoles
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              ✓ Can Manage Roles: {{ rolePermissions.canManageRoles }}
            </li>
            <li
              :class="
                rolePermissions.canManageUsers
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              ✓ Can Manage Users: {{ rolePermissions.canManageUsers }}
            </li>
          </ul>
        </div>

        <!-- Project permissions -->
        <div class="border p-4 rounded">
          <h3 class="font-semibold mb-2">Project Permissions</h3>
          <ul class="text-sm space-y-1">
            <li
              :class="
                projectPermissions.canCreate ? 'text-green-600' : 'text-red-600'
              "
            >
              ✓ Can Create: {{ projectPermissions.canCreate }}
            </li>
            <li
              :class="
                projectPermissions.canViewMembers
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              ✓ Can View Members: {{ projectPermissions.canViewMembers }}
            </li>
            <li
              :class="
                projectPermissions.canManageUsers
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              ✓ Can Manage Users: {{ projectPermissions.canManageUsers }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Role level information -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">3. User Role Information</h2>

      <div class="bg-gray-100 p-4 rounded">
        <p><strong>User Role Level:</strong> {{ getUserRoleLevel() }}</p>
        <p><strong>Is Admin:</strong> {{ isAdmin }}</p>
        <p><strong>Is Project Manager:</strong> {{ isProjectManager }}</p>
        <p><strong>Is Basic User:</strong> {{ isBasicUser }}</p>
      </div>
    </div>

    <!-- Conditional rendering examples -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold mb-4">
        4. Conditional Rendering in Template
      </h2>

      <div class="space-y-4">
        <!-- Using computed properties -->
        <div
          v-if="worklogPermissions.canCreate"
          class="bg-green-100 p-4 rounded"
        >
          <p>✅ You can create worklogs!</p>
        </div>

        <div v-if="isAdmin" class="bg-red-100 p-4 rounded">
          <p>🔴 Admin panel access available</p>
        </div>

        <div
          v-if="projectPermissions.canManageUsers"
          class="bg-blue-100 p-4 rounded"
        >
          <p>👥 You can manage project users</p>
        </div>

        <!-- Using permission check functions -->
        <div
          v-if="hasPermission(ROLE_PERMISSIONS.CREATE)"
          class="bg-purple-100 p-4 rounded"
        >
          <p>🎭 You can create roles</p>
        </div>
      </div>
    </div>

    <!-- Project-specific permissions -->
    <div class="mb-8" v-if="currentProjectId">
      <h2 class="text-xl font-semibold mb-4">
        5. Project-Specific Permissions
      </h2>

      <div class="border p-4 rounded">
        <h3 class="font-semibold mb-2">
          Project {{ currentProjectId }} Permissions
        </h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div v-for="(value, key) in currentProjectPermissions" :key="key">
            <span :class="value ? 'text-green-600' : 'text-red-600'">
              {{ key }}: {{ value }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Permission debugging -->
    <div class="mb-8" v-if="isAdmin">
      <h2 class="text-xl font-semibold mb-4">
        6. Debug Information (Admin Only)
      </h2>

      <div class="bg-gray-100 p-4 rounded">
        <details>
          <summary class="cursor-pointer font-semibold">
            All User Permissions
          </summary>
          <pre class="mt-2 text-xs">{{
            JSON.stringify(permissions, null, 2)
          }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePermissionHelpers } from "@/composables/usePermissionHelpers";

// Use the permission helpers
const {
  // Permission constants
  WORKLOG_PERMISSIONS,
  ROLE_PERMISSIONS,
  PROJECT_PERMISSIONS,

  // Permission check functions
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,

  // Computed permission helpers
  worklogPermissions,
  rolePermissions,
  projectPermissions,

  // Role level helpers
  isAdmin,
  isProjectManager,
  isBasicUser,
  getUserRoleLevel,

  // Utility functions
  getProjectPermissions,

  // Raw permissions data
  permissions,
} = usePermissionHelpers();

// Example project ID (in real app, this would come from route params or props)
const currentProjectId = ref("123");

// Get project-specific permissions
const currentProjectPermissions = computed(() => {
  return currentProjectId.value
    ? getProjectPermissions(currentProjectId.value)
    : {};
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
