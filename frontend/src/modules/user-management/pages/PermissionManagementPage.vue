<template>
  <UserManagementLayout>
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Roles Sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium text-gray-900 flex items-center">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
              {{ $t("permission_management.roles") }}
            </h2>
            <button
              @click="showAddRoleModal = true"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                class="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              {{ $t("permission_management.add_role") }}
            </button>
          </div>

          <!-- Loading State for Roles -->
          <div
            v-if="loadingRoles"
            class="flex items-center justify-center py-8"
          >
            <div class="flex items-center gap-3">
              <svg
                class="animate-spin h-5 w-5 text-blue-600"
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
              <span class="text-sm text-gray-600">Loading roles...</span>
            </div>
          </div>

          <!-- Roles List -->
          <div v-else class="space-y-2">
            <div
              v-for="role in roles"
              :key="role.id"
              @click="selectRole(role)"
              class="p-3 rounded-lg cursor-pointer transition-colors"
              :class="
                selectedRole?.id === role.id
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              "
            >
              <div class="font-medium text-gray-900">{{ role.name }}</div>
              <div class="text-sm text-gray-500">{{ role.description }}</div>
            </div>

            <!-- Empty State -->
            <div v-if="roles.length === 0" class="text-center py-8">
              <div class="text-gray-500 text-sm">No roles found</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-3">
        <div v-if="selectedRole" class="space-y-6">
          <!-- Role Permissions -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{
                $t("permission_management.role_permissions", {
                  role: selectedRole.name,
                })
              }}
            </h3>

            <!-- Loading Role Details -->
            <div
              v-if="loadingRoleDetails"
              class="flex items-center justify-center py-8"
            >
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
              ></div>
              <span class="ml-2 text-gray-600"
                >Loading role permissions...</span
              >
            </div>

            <!-- Permission Modules -->
            <div v-else class="space-y-6">
              <div
                v-for="module in permissionModules"
                :key="module.key"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h4 class="text-lg font-medium text-gray-900">
                      {{ module.name }}
                    </h4>
                    <p class="text-sm text-gray-500">
                      {{ module.description }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="selectAllPermissions(module.key, true)"
                      class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      @click="selectAllPermissions(module.key, false)"
                      class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                  <div
                    v-for="permission in module.permissions"
                    :key="permission.id"
                    class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <input
                      :id="`permission-${permission.id}`"
                      type="checkbox"
                      :checked="hasPermission(permission)"
                      @change="
                        togglePermission(permission, $event.target.checked)
                      "
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label
                      :for="`permission-${permission.id}`"
                      class="flex-1 cursor-pointer"
                    >
                      <div class="text-sm font-medium text-gray-700">
                        {{ permission.displayName }}
                      </div>
                      <div
                        v-if="permission.description"
                        class="text-xs text-gray-500 mt-1"
                      >
                        {{ permission.description }}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button
                @click="savePermissions"
                :disabled="saving"
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
                {{ saving ? $t("common.loading") : $t("common.save") }}
              </button>
            </div>
          </div>

          <!-- Assign Role to User -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              {{ $t("permission_management.assign_role_to_user") }}
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t("permission_management.select_user") }}
                </label>
                <Select
                  v-model="selectedUserId"
                  :options="userOptions"
                  :placeholder="$t('permission_management.choose_user')"
                  searchable
                  search-placeholder="Search users..."
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t("permission_management.select_roles") }}
                </label>
                <MultiSelect
                  v-model="selectedRoleIds"
                  :options="roleOptions"
                  :placeholder="$t('permission_management.choose_roles')"
                  searchable
                  search-placeholder="Search roles..."
                  show-select-all
                />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                @click="assignRoles"
                :disabled="
                  !selectedUserId || selectedRoleIds.length === 0 || assigning
                "
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  v-if="assigning"
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
                  assigning
                    ? $t("common.loading")
                    : $t("permission_management.assign_roles")
                }}
              </button>
            </div>
          </div>
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
            {{ $t("permission_management.select_role_to_manage") }}
          </h3>
          <p class="text-gray-500">
            {{ $t("permission_management.select_role_description") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Add Role Modal -->
    <AddRoleModal
      :show="showAddRoleModal"
      @close="showAddRoleModal = false"
      @success="handleCreateRole"
    />
  </UserManagementLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";
import UserManagementLayout from "../layouts/UserManagementLayout.vue";
import Table from "@/components/ui/Table.vue";
import Avatar from "@/components/ui/Avatar.vue";
import Badge from "@/components/ui/Badge.vue";
import Select from "@/components/ui/Select.vue";
import MultiSelect from "@/components/ui/MultiSelect.vue";
import { getUsers } from "@/services/userService";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRolePermissions,
  assignRolesToUser,
  getPermissions,
} from "@/services/roleService";
import { useAuthStore } from "@/modules/auth/store";
import {
  getPermissionDisplayName,
  getScopeDisplayName,
} from "@/constants/permissions.js";
import AddRoleModal from "../components/AddRoleModal.vue";

const toast = useToast();
const { t } = useI18n();
const authStore = useAuthStore();

// State
const loading = ref(false);
const loadingRoles = ref(false);
const loadingRoleDetails = ref(false);
const saving = ref(false);
const assigning = ref(false);
const loadingAssignments = ref(false);
const selectedRole = ref(null);
const selectedUserId = ref("");
const selectedRoleIds = ref([]);
const showAddRoleModal = ref(false);

// Data from API
const roles = ref([]);
const permissions = ref([]);

// Permission modules based on API data
const permissionModules = computed(() => {
  if (!permissions.value.length) return [];

  // Group permissions by scope
  const groupedPermissions = permissions.value.reduce((acc, permission) => {
    const scope = permission.scope || "general";
    if (!acc[scope]) {
      acc[scope] = [];
    }
    // Add display name to permission object
    const permissionWithDisplayName = {
      ...permission,
      displayName: getPermissionDisplayName(permission.name),
    };
    acc[scope].push(permissionWithDisplayName);
    return acc;
  }, {});

  // Convert grouped permissions to modules format
  return Object.entries(groupedPermissions).map(([scope, perms]) => ({
    name: getScopeDisplayName(scope),
    key: scope,
    permissions: perms,
    description: `${getScopeDisplayName(scope)} permissions`,
  }));
});

const users = ref([]);
const userRoleAssignments = ref([
  { userId: 1, userName: "Nguyễn Văn A", roleId: 1, roleName: "Admin" },
  { userId: 2, userName: "Trần Thị B", roleId: 2, roleName: "Manager" },
  { userId: 3, userName: "Lê Văn C", roleId: 3, roleName: "User" },
]);

// Computed
const availableUsers = computed(() => {
  return users.value.filter(
    (user) =>
      !userRoleAssignments.value.some(
        (assignment) => assignment.userId === user.id
      )
  );
});

const userOptions = computed(() => {
  return users.value.map((user) => ({
    label: user.name,
    value: user.id,
  }));
});

const roleOptions = computed(() => {
  return roles.value.map((role) => ({
    label: role.name,
    value: role.id,
  }));
});

// Methods
const selectRole = async (role) => {
  try {
    loadingRoleDetails.value = true;

    // Fetch detailed role information with permissions
    const response = await getRoleById(role.id, {
      include_permissions: true,
    });

    // Update selected role with detailed permissions
    selectedRole.value = {
      ...role,
      permissions: response.data.permissions || [],
    };
  } catch (error) {
    console.error("Error fetching role details:", error);
    toast.error("Failed to load role details", "error");
    // Fallback to basic role data
    selectedRole.value = role;
  } finally {
    loadingRoleDetails.value = false;
  }
};

// Permission methods using permission objects
const hasPermission = (permission) => {
  if (!selectedRole.value || !selectedRole.value.permissions) return false;
  // Check if role has this permission by ID or name
  return selectedRole.value.permissions.some(
    (p) => p.id === permission.id || p.name === permission.name
  );
};

const togglePermission = (permission, checked) => {
  if (!selectedRole.value) return;

  let permissions = [...(selectedRole.value.permissions || [])];

  if (checked) {
    // Add permission if not already present
    const hasPermissionAlready = permissions.some(
      (p) => p.id === permission.id || p.name === permission.name
    );
    if (!hasPermissionAlready) {
      permissions.push(permission);
    }
  } else {
    // Remove permission
    permissions = permissions.filter(
      (p) => !(p.id === permission.id || p.name === permission.name)
    );
  }

  selectedRole.value.permissions = permissions;
};

const selectAllPermissions = (moduleKey, selectAll) => {
  if (!selectedRole.value) return;

  const module = permissionModules.value.find((m) => m.key === moduleKey);
  if (!module) return;

  let permissions = [...(selectedRole.value.permissions || [])];

  if (selectAll) {
    // Add all module permissions
    module.permissions.forEach((permission) => {
      const hasPermissionAlready = permissions.some(
        (p) => p.id === permission.id || p.name === permission.name
      );
      if (!hasPermissionAlready) {
        permissions.push(permission);
      }
    });
  } else {
    // Remove all module permissions
    permissions = permissions.filter((p) => {
      return !module.permissions.some(
        (permission) => p.id === permission.id || p.name === permission.name
      );
    });
  }

  selectedRole.value.permissions = permissions;
};

const savePermissions = async () => {
  if (!selectedRole.value) {
    toast.error("No role selected", "error");
    return;
  }

  try {
    saving.value = true;

    // Extract permission IDs from selected role permissions
    const permissionIds = selectedRole.value.permissions
      .map((permission) => permission.id)
      .filter((id) => id !== undefined && id !== null);

    // Call API to update role permissions
    await updateRolePermissions(selectedRole.value.id, permissionIds);

    toast.success("Permissions saved successfully", "success");
  } catch (error) {
    console.error("Error saving permissions:", error);
    toast.error(error?.message || "Failed to save permissions", "error");
  } finally {
    saving.value = false;
  }
};

const assignRoles = async () => {
  try {
    assigning.value = true;

    if (!selectedUserId.value || selectedRoleIds.value.length === 0) {
      toast.error("Please select a user and at least one role", "error");
      return;
    }

    // Call API to assign roles to user
    await assignRolesToUser(selectedUserId.value, selectedRoleIds.value);

    // Find user and roles for display
    const user = users.value.find((u) => u.id === selectedUserId.value);
    const selectedRoles = roles.value.filter((role) =>
      selectedRoleIds.value.includes(role.id)
    );

    // Add to local assignments for immediate UI update
    selectedRoles.forEach((role) => {
      // Check if assignment already exists
      const existingAssignment = userRoleAssignments.value.find(
        (assignment) =>
          assignment.userId === user.id && assignment.roleId === role.id
      );

      if (!existingAssignment) {
        userRoleAssignments.value.push({
          userId: user.id,
          userName: user.name,
          roleId: role.id,
          roleName: role.name,
        });
      }
    });

    // Clear selections
    selectedUserId.value = "";
    selectedRoleIds.value = [];

    toast.success(
      `Successfully assigned ${selectedRoles.length} role(s) to ${user.name}`,
      "success"
    );
  } catch (error) {
    console.error("Error assigning roles:", error);
    toast.error(error.message || "Failed to assign roles to user", "error");
  } finally {
    assigning.value = false;
  }
};

const removeRoleAssignment = (assignment) => {
  const index = userRoleAssignments.value.findIndex(
    (a) => a.userId === assignment.userId && a.roleId === assignment.roleId
  );
  if (index > -1) {
    userRoleAssignments.value.splice(index, 1);
    toast.success("Role assignment removed", "success");
  }
};

const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await getUsers();
    users.value = response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("Failed to fetch users", "error");
  } finally {
    loading.value = false;
  }
};

const fetchRoles = async () => {
  try {
    loadingRoles.value = true;

    // Get company_id from user info
    const companyId = authStore?.user?.company_id;
    const params = companyId ? { company_id: companyId } : {};

    const response = await getRoles(params);

    // Transform API response to match component structure
    roles.value = response.data.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      company_id: role.company_id,
    }));

    // Select first role by default if available
    if (roles.value.length > 0) {
      await selectRole(roles.value[0]);
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
    toast.error("Failed to fetch roles", "error");
  } finally {
    loadingRoles.value = false;
  }
};

const fetchPermissions = async () => {
  try {
    loading.value = true;
    const response = await getPermissions();
    permissions.value = response.data;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    toast.error("Failed to fetch permissions", "error");
  } finally {
    loading.value = false;
  }
};

const handleCreateRole = async (roleData) => {
  try {
    // Get company_id from user info
    const companyId = authStore?.user?.company_id;

    if (!companyId) {
      toast.error("Company information not found", "error");
      return;
    }

    const newRoleData = {
      ...roleData,
      company_id: companyId,
    };

    await createRole(newRoleData);

    // Refresh roles list after successful creation
    await fetchRoles();

    toast.success(
      t("permission_management.role_created_success") ||
        "Role created successfully",
      "success"
    );
  } catch (error) {
    console.error("Error creating role:", error);
    toast.error(error?.message || "Failed to create role", "error");
  }
};

onMounted(() => {
  fetchUsers();
  fetchRoles();
  fetchPermissions();
});
</script>
