<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ $t("project_permission.title") }}
          </h1>
          <p class="text-sm text-gray-600" v-if="currentProject">
            Managing permissions for <strong>{{ currentProject.name }}</strong>
          </p>
          <p class="text-sm text-gray-600" v-else>
            {{ $t("project_permission.description") }}
          </p>
        </div>
      </div>
    </template>

    <!-- Permission Error -->
    <div
      v-if="permissionError"
      class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
    >
      <svg
        class="mx-auto h-12 w-12 text-red-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <h3 class="text-lg font-medium text-red-800 mb-2">Permission Error</h3>
      <p class="text-red-600">{{ permissionError }}</p>
    </div>

    <!-- No Permission -->
    <div
      v-else-if="
        selectedProjectId &&
        !isLoadingPermissions &&
        !canManageRoles &&
        !canAssignRoles &&
        !canAddUsers
      "
      class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center"
    >
      <svg
        class="mx-auto h-12 w-12 text-yellow-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <h3 class="text-lg font-medium text-yellow-800 mb-2">
        Access Restricted
      </h3>
      <p class="text-yellow-600">
        You don't have permission to manage project permissions.
      </p>
    </div>

    <!-- Main Content -->
    <div v-else-if="selectedProjectId" class="space-y-6">
      <!-- Tab Navigation -->
      <TabNavigation
        :active-tab="activeTab"
        @update:active-tab="activeTab = $event"
      />

      <!-- Role Permissions Tab -->
      <div v-if="activeTab === 'permissions'" class="space-y-6">
        <!-- Two Column Layout: Roles List + Permissions -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Project Roles List -->
          <div class="lg:col-span-1">
            <ProjectRolesList
              :roles="projectRoles"
              :selected-role="selectedRole"
              :loading="loadingRoles"
              :can-add-role="canManageRoles"
              :can-delete-role="canManageRoles"
              @add-role="handleAddRoleClick"
              @select-role="selectRole"
              @delete-role="confirmDeleteRole"
            />
          </div>

          <!-- Role Permissions Content -->
          <div class="lg:col-span-3">
            <RolePermissionsEditor
              :selected-role="selectedRole"
              :permission-modules="permissionModules"
              :has-permission="hasPermission"
              :loading="loadingRoleDetails"
              :saving="saving"
              :can-edit="canCreateRole"
              @save="savePermissions"
              @select-all-permissions="selectAllPermissions"
              @toggle-permission="togglePermission"
            />
          </div>
        </div>
      </div>

      <!-- User Assignments Tab -->
      <UserAssignmentsTab
        v-else-if="activeTab === 'assignments'"
        :selected-user-for-assignment="selectedUserForAssignment"
        :selected-role-for-assignment="selectedRoleForAssignment"
        :available-users-options="availableUsersOptions"
        :project-roles-options="projectRolesOptions"
        :loading-users="loadingUsers"
        :loading-roles="loadingRoles"
        :assigning-role="assigningRole"
        :can-assign-role="canAssignRole"
        :can-add-user="canAddUser"
        :can-delete-user="canDeleteUser"
        :loading-user-assignments="loadingUserAssignments"
        :user-assignment-columns="userAssignmentColumns"
        :project-users-with-roles="projectUsersWithRoles"
        @assign-role="handleAssignUserRole"
        @update:selected-user-for-assignment="
          selectedUserForAssignment = $event
        "
        @update:selected-role-for-assignment="
          selectedRoleForAssignment = $event
        "
      />
    </div>

    <!-- No Project Selected -->
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
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        ></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{ $t("project_permission.select_project_to_manage") }}
      </h3>
      <p class="text-gray-500">
        {{ $t("project_permission.select_project_description") }}
      </p>
    </div>

    <!-- Add Project Role Modal -->
    <AddProjectRoleModal
      :show="showAddRoleModal"
      :project-id="selectedProjectId"
      @close="showAddRoleModal = false"
      @success="handleCreateRole"
    />

    <!-- Assign Project Role Modal -->
    <AssignProjectRoleModal
      :show="showAssignRoleModal"
      :project-id="selectedProjectId"
      :project-roles="projectRoles"
      @close="showAssignRoleModal = false"
      @success="handleAssignRole"
    />

    <!-- Delete Role Confirmation Modal -->
    <ConfirmModal
      v-model="showDeleteConfirm"
      :title="$t('project_permission.delete_role')"
      :message="deleteConfirmMessage"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      confirm-variant="danger"
      :loading="deletingRole"
      @confirm="handleDeleteRole"
    />
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";
import { usePermissions } from "@/composables/usePermissions";
import { useProjectPermissions } from "../composables/useProjectPermissions.js";
import { PROJECT_PERMISSIONS } from "../constants/projectPermissions.js";
import { debugRouteParams } from "../utils/debugPermissions.js";
import MainLayout from "@/layouts/MainLayout.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import TabNavigation from "../components/TabNavigation.vue";
import ProjectRolesList from "../components/ProjectRolesList.vue";
import RolePermissionsEditor from "../components/RolePermissionsEditor.vue";
import UserAssignmentsTab from "../components/UserAssignmentsTab.vue";
import { getUsers } from "@/services/userService";
import {
  createProjectRole,
  getProjectRoleById,
  updateProjectRolePermissions,
  assignProjectRolesToUser,
  getPermissions,
  deleteProjectRole,
  getProjectsForDropdown,
  unassignProjectRoleFromUser,
} from "../services/projectPermissionService";
import { getProjectRoles } from "../services/projectService";
import { useAuthStore } from "@/modules/auth/store";
import {
  getPermissionDisplayName,
  getScopeDisplayName,
} from "@/constants/permissions.js";
import AddProjectRoleModal from "../components/AddProjectRoleModal.vue";
import AssignProjectRoleModal from "../components/AssignProjectRoleModal.vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const authStore = useAuthStore();
const { hasGlobalPermission, PERMISSIONS } = usePermissions();
const selectedProjectId = ref(route.params.projectId);

// Project-specific permission management
const {
  fetchUserPermissions,
  hasProjectPermission,
  canManageRoles,
  canAssignRoles,
  canAddUsers,
  canDeleteUsers,
  isLoadingPermissions,
  permissionError,
} = useProjectPermissions(selectedProjectId);

// State
const loading = ref(false);
const loadingProjects = ref(false);
const loadingRoles = ref(false);
const loadingRoleDetails = ref(false);
const loadingUserAssignments = ref(false);
const saving = ref(false);
const selectedRole = ref(null);
const activeTab = ref("permissions");
const showAddRoleModal = ref(false);
const showAssignRoleModal = ref(false);

// Delete role states
const showDeleteConfirm = ref(false);
const deletingRole = ref(false);
const roleToDelete = ref(null);
const deleteConfirmMessage = computed(() => {
  if (!roleToDelete.value) return "";
  return t("project_permission.delete_role_confirm", {
    role: roleToDelete.value.name,
  });
});

// Data from API
const projects = ref([]);
const currentProject = ref(null);
const projectRoles = ref([]);
const permissions = ref([]);
const projectUsersWithRoles = ref([]);

// User assignment form data
const availableUsers = ref([]);
const selectedUserForAssignment = ref(null);
const selectedRoleForAssignment = ref(null);
const loadingUsers = ref(false);
const assigningRole = ref(false);

// Computed
const projectOptions = computed(() => {
  return projects.value.map((project) => ({
    value: project.id,
    label: project.name,
    description: project.description,
  }));
});

// Permission modules based on API data - filtered for Project scope only
const permissionModules = computed(() => {
  if (!permissions.value.length) return [];

  // Filter permissions to only include Project scope
  const projectPermissions = permissions.value.filter(
    (permission) => permission.scope === "Project"
  );

  if (!projectPermissions.length) return [];

  // Group permissions by scope
  const modules = {};
  projectPermissions.forEach((permission) => {
    const scope = permission.scope || "general";
    if (!modules[scope]) {
      modules[scope] = {
        key: scope,
        name: getScopeDisplayName(scope),
        description: `Permissions for ${scope} module`,
        permissions: [],
      };
    }
    modules[scope].permissions.push({
      ...permission,
      displayName: getPermissionDisplayName(permission.name),
    });
  });

  return Object.values(modules);
});

// Selected role permissions
const selectedRolePermissions = ref([]);

// Dropdown options for user assignment
const availableUsersOptions = computed(() => {
  return availableUsers.value.map((user) => ({
    value: user.id,
    label: user.name,
    description: user.email,
  }));
});

const projectRolesOptions = computed(() => {
  return projectRoles.value.map((role) => ({
    value: role.id,
    label: role.name,
    description: role.description,
  }));
});

// Permission checks using project permissions
const canCreateRole = computed(() => canManageRoles.value);
const canAssignRole = computed(() => canAssignRoles.value);
const canAddUser = computed(() => canAddUsers.value);
const canDeleteUser = computed(() => canDeleteUsers.value);

// User assignment table columns
const userAssignmentColumns = computed(() => [
  {
    key: "user",
    label: t("common.user"),
    render: (row) => ({
      component: "div",
      class: "flex items-center",
      children: [
        {
          component: Avatar,
          props: {
            src: row.avatar,
            name: row.name,
            size: "sm",
            class: "mr-3",
          },
        },
        {
          component: "div",
          children: [
            {
              component: "div",
              class: "text-sm font-medium text-gray-900",
              text: row.name,
            },
            {
              component: "div",
              class: "text-sm text-gray-500",
              text: row.email,
            },
          ],
        },
      ],
    }),
  },
  {
    key: "roles",
    label: t("project_permission.assigned_roles"),
    render: (row) => ({
      component: "div",
      class: "flex flex-wrap gap-1",
      children:
        row.roles?.map((role) => ({
          component: Badge,
          props: {
            variant: "blue",
            text: role.name,
          },
        })) || [],
    }),
  },
  {
    key: "actions",
    label: t("common.actions"),
    render: (row) => ({
      component: "div",
      class: "flex items-center gap-2",
      children: [
        ...(canAssignRole.value
          ? [
              {
                component: "button",
                class: "text-blue-600 hover:text-blue-900 text-sm font-medium",
                text: t("common.edit"),
                onClick: () => editUserRoles(row),
              },
            ]
          : []),
        ...(canDeleteUser.value
          ? [
              {
                component: "button",
                class:
                  "text-red-600 hover:text-red-900 text-sm font-medium ml-4",
                text: t("common.remove"),
                onClick: () => removeUserFromProject(row),
              },
            ]
          : []),
      ],
    }),
  },
]);

// Methods
const goBack = () => {
  router.push("/projects");
};

const handleAddRoleClick = () => {
  console.log("🔘 Add Role button clicked");
  console.log("📊 showAddRoleModal before:", showAddRoleModal.value);
  showAddRoleModal.value = true;
  console.log("📊 showAddRoleModal after:", showAddRoleModal.value);
};

// const loadProjects = async () => {
//   try {
//     loadingProjects.value = true;
//     const response = await getProjectsForDropdown(selectedProjectId.value);
//     projects.value = response.data || [];

//     // Find current project
//     if (selectedProjectId.value) {
//       currentProject.value = projects.value.find(
//         (p) => p.id == selectedProjectId.value
//       );
//     }
//   } catch (error) {
//     console.error("Error loading projects:", error);
//     toast.error(t("project_permission.error_loading_projects"));
//   } finally {
//     loadingProjects.value = false;
//   }
// };

const loadProjectRoles = async () => {
  if (!selectedProjectId.value) return;

  try {
    loadingRoles.value = true;
    const response = await getProjectRoles(selectedProjectId.value);
    // Handle new API response structure: { data: { roles: [...], total: number } }
    projectRoles.value = response.data?.roles || [];
    console.log("✅ Project roles loaded:", projectRoles.value);
  } catch (error) {
    toast.error(error.message || t("project_permission.error_loading_roles"));
  } finally {
    loadingRoles.value = false;
  }
};

const loadPermissions = async () => {
  try {
    const response = await getPermissions();
    permissions.value = response.data || [];
  } catch (error) {
    console.error("Error loading permissions:", error);
    toast.error(t("project_permission.error_loading_permissions"));
  }
};

const loadProjectUsersWithRoles = async () => {
  if (!selectedProjectId.value) return;

  try {
    loadingUserAssignments.value = true;
    const response = await getUsers({ size: 100 }); // Get all users instead of project-specific users
    projectUsersWithRoles.value = response.data || [];
  } catch (error) {
    console.error("Error loading users:", error);
    toast.error(t("project_permission.error_loading_user_assignments"));
  } finally {
    loadingUserAssignments.value = false;
  }
};

const loadAvailableUsers = async () => {
  try {
    loadingUsers.value = true;
    const response = await getUsers({ size: 100 }); // Get large list for dropdown
    availableUsers.value = response.data || [];
  } catch (error) {
    console.error("Error loading available users:", error);
    toast.error(t("project_permission.error_loading_users"));
  } finally {
    loadingUsers.value = false;
  }
};

const handleAssignUserRole = async () => {
  if (!selectedUserForAssignment.value || !selectedRoleForAssignment.value) {
    return;
  }

  try {
    assigningRole.value = true;

    await assignProjectRolesToUser(
      selectedProjectId.value,
      selectedUserForAssignment.value,
      [selectedRoleForAssignment.value]
    );

    // Reset form
    selectedUserForAssignment.value = null;
    selectedRoleForAssignment.value = null;

    // Reload user assignments
    await loadProjectUsersWithRoles();

    toast.success(t("project_permission.role_assigned_successfully"));
  } catch (error) {
    console.error("Error assigning role to user:", error);
    toast.error(t("project_permission.error_assigning_role"));
  } finally {
    assigningRole.value = false;
  }
};

const onProjectChange = () => {
  selectedRole.value = null;
  selectedRolePermissions.value = [];
  loadProjectRoles();
  loadAvailableUsers(); // Load users for assignment dropdown
  if (activeTab.value === "assignments") {
    loadProjectUsersWithRoles();
  }
};

const selectRole = async (role) => {
  try {
    selectedRole.value = role;
    loadingRoleDetails.value = true;

    const response = await getProjectRoleById(selectedProjectId.value, role.id);
    selectedRolePermissions.value = response.data?.permissions || [];
  } catch (error) {
    console.error("Error loading role details:", error);
    toast.error(t("project_permission.error_loading_role_details"));
  } finally {
    loadingRoleDetails.value = false;
  }
};

const hasPermission = (permission) => {
  return selectedRolePermissions.value.some((p) => p.id === permission.id);
};

const togglePermission = (permission, checked) => {
  if (checked) {
    if (!hasPermission(permission)) {
      selectedRolePermissions.value.push(permission);
    }
  } else {
    selectedRolePermissions.value = selectedRolePermissions.value.filter(
      (p) => p.id !== permission.id
    );
  }
};

const selectAllPermissions = (moduleKey, selectAll) => {
  const module = permissionModules.value.find((m) => m.key === moduleKey);
  if (!module) return;

  module.permissions.forEach((permission) => {
    togglePermission(permission, selectAll);
  });
};

const savePermissions = async () => {
  if (!selectedRole.value) return;

  try {
    saving.value = true;
    const permissionIds = selectedRolePermissions.value.map((p) => p.id);

    await updateProjectRolePermissions(
      selectedProjectId.value,
      selectedRole.value.id,
      { permission_ids: permissionIds }
    );

    toast.success(t("project_permission.permissions_updated_successfully"));
  } catch (error) {
    console.error("Error saving permissions:", error);
    toast.error(t("project_permission.error_saving_permissions"));
  } finally {
    saving.value = false;
  }
};

const confirmDeleteRole = (role) => {
  roleToDelete.value = role;
  showDeleteConfirm.value = true;
};

const handleDeleteRole = async () => {
  if (!roleToDelete.value) return;

  try {
    deletingRole.value = true;
    await deleteProjectRole(selectedProjectId.value, roleToDelete.value.id);

    toast.success(t("project_permission.role_deleted_successfully"));

    // Refresh roles list
    await loadProjectRoles();

    // Clear selection if deleted role was selected
    if (selectedRole.value?.id === roleToDelete.value.id) {
      selectedRole.value = null;
      selectedRolePermissions.value = [];
    }
  } catch (error) {
    console.error("Error deleting role:", error);
    toast.error(t("project_permission.error_deleting_role"));
  } finally {
    deletingRole.value = false;
    showDeleteConfirm.value = false;
    roleToDelete.value = null;
  }
};

const handleCreateRole = async () => {
  try {
    await loadProjectRoles();
    showAddRoleModal.value = false;
    toast.success(t("project_permission.role_created_successfully"));
  } catch (error) {
    console.error("Error handling role creation:", error);
    toast.error(t("project_permission.error_loading_roles"));
  }
};

const handleAssignRole = async () => {
  await loadProjectUsersWithRoles();
  showAssignRoleModal.value = false;
  toast.success(t("project_permission.roles_assigned_successfully"));
};

const editUserRoles = (user) => {
  // TODO: Implement edit user roles functionality
  console.log("Edit user roles:", user);
};

const removeUserFromProject = async (user) => {
  // TODO: Implement remove user from project functionality
  console.log("Remove user from project:", user);
};

// Watch for tab changes
watch(activeTab, (newTab) => {
  if (newTab === "assignments" && selectedProjectId.value) {
    loadProjectUsersWithRoles();
  }
});

// Lifecycle
onMounted(async () => {
  // Debug route params
  debugRouteParams(route);

  await Promise.all([
    loadProjectRoles(),
    loadPermissions(),
    loadAvailableUsers(),
    fetchUserPermissions(),
  ]);
});
</script>
