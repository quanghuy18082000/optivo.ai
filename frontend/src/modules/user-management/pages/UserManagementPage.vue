<template>
  <UserManagementLayout>
    <!-- Filters Button -->
    <div class="flex justify-end mb-6">
      <button
        @click="showFilters = true"
        class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        {{ $t("common.filter") }}
      </button>
    </div>

    <div class="space-y-6">
      <!-- Users Table -->
      <Table
        :loading="loading"
        :show-empty="filteredUsers.length === 0 && !loading"
        :empty-message="$t('user_management.no_users_found')"
        :column-count="8"
      >
        <template #header>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {{ $t("user_management.columns.user") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {{ $t("user_management.columns.role") }}
          </th>
          <!-- <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {{ $t("user_management.columns.department") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {{ $t("user_management.columns.workload") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {{ $t("user_management.columns.total_hours") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {{ $t("user_management.columns.projects") }}
          </th>-->
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {{ $t("user_management.columns.status") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48"
          >
            {{ $t("user_management.columns.actions") }}
          </th>
        </template>

        <template #body>
          <tr
            v-for="user in filteredUsers"
            :key="user.id"
            class="hover:bg-gray-50"
          >
            <!-- User Info -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <Avatar
                  :name="user.name"
                  :src="user.avatar"
                  size="md"
                  class="mr-3"
                />
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.name }}
                  </div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>

            <!-- Role -->
            <td class="px-6 py-4 whitespace-nowrap">
              <MultiRoleDisplay
                :roles="user.role || []"
                :can-manage="true"
                @manage-roles="openManageRolesModal(user)"
              />
            </td>
            <!-- 
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.department }}
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div class="w-24">
                <span class="text-xs text-gray-500 mt-1"
                  >{{ user.workload }}%</span
                >
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.totalHours }}h
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.projects }}
            </td>-->

            <td class="px-6 py-4 whitespace-nowrap">
              <Badge
                :variant="user.status === 'Active' ? 'success' : 'default'"
              >
                {{
                  user.status === "Active"
                    ? $t("user_management.status_active")
                    : $t("user_management.status_inactive")
                }}
              </Badge>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex flex-col space-y-1">
                <!-- Manage Roles Button -->
                <button
                  @click="openManageRolesModal(user)"
                  class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                  :title="$t('user_management.manage_roles')"
                >
                  <svg
                    class="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {{ $t("user_management.manage_roles") }}
                </button>

                <!-- Legacy Assign Role Button (for backward compatibility) -->
              </div>
            </td>
          </tr>
        </template>
      </Table>

      <!-- Pagination Controls -->
      <div class="flex items-center justify-between">
        <PageSizeSelector
          :page-size="pageSize"
          @page-size-change="handlePageSizeChange"
        />
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total="total"
          :page-size="pageSize"
          :has-next="hasNext"
          :has-previous="hasPrevious"
          :show-border="false"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Filter Panel -->
    <UserFilters
      :is-open="showFilters"
      :filters="filters"
      :available-roles="availableRoles"
      :available-departments="availableDepartments"
      @close="showFilters = false"
      @apply="applyFilters"
      @reset="handleResetFilters"
    />

    <!-- Assign Role Modal -->
    <AssignRoleModal
      :show="showAssignRoleModal"
      :user="selectedUserForRole"
      :roles="roles"
      @close="closeAssignRoleModal"
      @success="handleRoleAssignment"
    />

    <!-- Manage Roles Modal -->
    <ManageRolesModal
      :show="showManageRolesModal"
      :user="selectedUserForRoleManagement"
      :roles="roles"
      @close="closeManageRolesModal"
      @success="handleRoleManagementSuccess"
    />

    <!-- Remove Role Confirmation Modal -->
    <ConfirmModal
      v-model="showRemoveRoleModal"
      :title="removeRoleModalData.title"
      :message="removeRoleModalData.message"
      confirm-text="Remove Role"
      cancel-text="Cancel"
      @confirm="confirmRemoveRole"
    />
  </UserManagementLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "@/composables/useToast";
import { usePagination } from "@/composables/usePagination";
import UserManagementLayout from "../layouts/UserManagementLayout.vue";
import Table from "@/components/ui/Table.vue";
import Avatar from "@/components/ui/Avatar.vue";
import Badge from "@/components/ui/Badge.vue";
import Pagination from "@/components/ui/Pagination.vue";
import PageSizeSelector from "@/components/ui/PageSizeSelector.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import UserFilters from "../components/UserFilters.vue";
import AssignRoleModal from "../components/AssignRoleModal.vue";
import ManageRolesModal from "../components/ManageRolesModal.vue";
import MultiRoleDisplay from "../components/MultiRoleDisplay.vue";
import { getUsers } from "@/services/userService";
import {
  unassignRoleFromUser,
  assignRolesToUser,
  getRoles,
} from "@/services/roleService";
import { useAuthStore } from "@/modules/auth/store";

const toast = useToast();
const authStore = useAuthStore();
const loading = ref(false);
const users = ref([]);
const roles = ref([]);
const showFilters = ref(false);
const removingRole = ref(null);
const showRemoveRoleModal = ref(false);
const removeRoleModalData = ref({
  title: "",
  message: "",
  user: null,
});

// Assign role modal state
const showAssignRoleModal = ref(false);
const selectedUserForRole = ref(null);

// Manage roles modal state
const showManageRolesModal = ref(false);
const selectedUserForRoleManagement = ref(null);
const filters = ref({
  search: "",
  // Other filters are temporarily disabled
  // status: "",
  // roles: [],
  // departments: [],
  // minWorkload: null,
  // maxWorkload: null,
});

// Initialize pagination with fetchUsers function
const {
  pagination,
  currentPage,
  totalPages,
  total,
  pageSize,
  hasNext,
  hasPrevious,
  updatePagination,
  goToPage,
  resetToFirstPage,
  getPaginationParams,
  setPageSize,
} = usePagination({
  defaultPageSize: 10,
  fetchFunction: () => fetchUsers(),
});

const availableRoles = computed(() => {
  const roles = [...new Set(users.value.map((user) => user.role))];
  return roles.filter(Boolean);
});

const availableDepartments = computed(() => {
  const departments = [...new Set(users.value.map((user) => user.department))];
  return departments.filter(Boolean);
});

// Since we're using API-based search, we don't need client-side filtering
// Just return users directly from API
const filteredUsers = computed(() => {
  return users.value;
});

const fetchUsers = async (resetPage = false) => {
  try {
    loading.value = true;

    // Reset to page 1 if filters changed
    if (resetPage) {
      resetToFirstPage();
    }

    // Prepare API parameters - include pagination and search
    const params = {
      ...getPaginationParams(),
      // Add search parameter if exists
      ...(filters.value.search && { search: filters.value.search }),
    };

    console.log("fetchUsers - filters.value:", filters.value);
    console.log("fetchUsers - params being sent to API:", params);

    const response = await getUsers(params);

    // Update users and pagination from API response
    if (response.data) {
      // Transform API data and add mock data for missing fields
      users.value = response.data.map((user, index) => {
        // Mock multi-role data structure
        const mockRoles = [
          {
            id: 1,
            name: "Admin",
            description: "Full system access",
            company_id: 1,
            permissions: null,
          },
          {
            id: 2,
            name: "Manager",
            description: "Team management access",
            company_id: 1,
            permissions: null,
          },
          {
            id: 3,
            name: "Developer",
            description: "Development access",
            company_id: 1,
            permissions: null,
          },
          {
            id: 4,
            name: "QA",
            description: "Quality assurance access",
            company_id: 1,
            permissions: null,
          },
          {
            id: 5,
            name: "Designer",
            description: "Design access",
            company_id: 1,
            permissions: null,
          },
          {
            id: 6,
            name: "Employee",
            description: "Default Role",
            company_id: 1,
            permissions: null,
          },
          {
            id: 7,
            name: "Test",
            description: null,
            company_id: 1,
            permissions: null,
          },
        ];

        // Assign 1-3 random roles to each user
        const numRoles = Math.floor(Math.random() * 3) + 1;
        const userRoles = [];
        const usedRoleIds = new Set();

        for (let i = 0; i < numRoles; i++) {
          let roleIndex;
          do {
            roleIndex = Math.floor(Math.random() * mockRoles.length);
          } while (usedRoleIds.has(roleIndex));

          usedRoleIds.add(roleIndex);
          userRoles.push(mockRoles[roleIndex]);
        }

        return {
          ...user,
          role: userRoles, // Multi-role array
          role_id: userRoles[0]?.id, // Keep for backward compatibility
          department: ["IT", "Sales", "Marketing", "Design", "HR"][index % 5],
          workload: Math.floor(Math.random() * 40) + 60, // 60-100%
          totalHours: Math.floor(Math.random() * 80) + 120, // 120-200h
          projects: Math.floor(Math.random() * 5) + 1, // 1-5 projects
          avatar: null, // Will use initials from Avatar component
        };
      });
    }

    if (response.pagination) {
      updatePagination(response.pagination);
    }

    // If no users found and we're not on page 1, go back to page 1
    if (users.value.length === 0 && currentPage.value > 1) {
      resetToFirstPage();
      await fetchUsers();
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("user_management.fetch_error", "error");

    // Fallback to mock data for development/testing
    const mockRoles = [
      {
        id: 1,
        name: "Admin",
        description: "Full system access",
        company_id: 1,
        permissions: null,
      },
      {
        id: 2,
        name: "Manager",
        description: "Team management access",
        company_id: 1,
        permissions: null,
      },
      {
        id: 3,
        name: "Developer",
        description: "Development access",
        company_id: 1,
        permissions: null,
      },
      {
        id: 4,
        name: "QA",
        description: "Quality assurance access",
        company_id: 1,
        permissions: null,
      },
      {
        id: 5,
        name: "Designer",
        description: "Design access",
        company_id: 1,
        permissions: null,
      },
      {
        id: 6,
        name: "Employee",
        description: "Default Role",
        company_id: 1,
        permissions: null,
      },
      {
        id: 7,
        name: "Test",
        description: null,
        company_id: 1,
        permissions: null,
      },
    ];

    const mockUsers = Array.from({ length: 25 }, (_, index) => {
      // Assign 1-3 random roles to each user
      const numRoles = Math.floor(Math.random() * 3) + 1;
      const userRoles = [];
      const usedRoleIds = new Set();

      for (let i = 0; i < numRoles; i++) {
        let roleIndex;
        do {
          roleIndex = Math.floor(Math.random() * mockRoles.length);
        } while (usedRoleIds.has(roleIndex));

        usedRoleIds.add(roleIndex);
        userRoles.push(mockRoles[roleIndex]);
      }

      return {
        id: index + 1,
        user_id: index + 1,
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
        role: userRoles, // Multi-role array
        role_id: userRoles[0]?.id, // Keep for backward compatibility
        department: ["IT", "Sales", "Marketing", "Design", "HR"][index % 5],
        status: index % 3 === 0 ? "inactive" : "active",
        workload: Math.floor(Math.random() * 40) + 60,
        totalHours: Math.floor(Math.random() * 80) + 120,
        projects: Math.floor(Math.random() * 5) + 1,
        avatar: null,
      };
    });

    // Simulate pagination
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    users.value = mockUsers.slice(startIndex, endIndex);

    // Mock pagination response
    updatePagination({
      page: currentPage.value,
      size: pageSize.value,
      total: mockUsers.length,
      total_pages: Math.ceil(mockUsers.length / pageSize.value),
      has_next: endIndex < mockUsers.length,
      has_previous: currentPage.value > 1,
    });
  } finally {
    loading.value = false;
  }
};

// Removed color variants - using default gray for all roles

const getWorkloadVariant = (workload) => {
  if (workload >= 90) return "error";
  if (workload >= 80) return "warning";
  if (workload >= 70) return "primary";
  return "success";
};

const removeUserRole = (user) => {
  // Check if user has a role to remove
  if (!user.role || !user.role_id) {
    toast.error("This user has no role assigned to remove.", "error");
    return;
  }

  // Set modal data and show confirmation modal
  removeRoleModalData.value = {
    title: "Remove Role",
    message: `Are you sure you want to remove the role "${user.role}" from user "${user.name}"? This action cannot be undone.`,
    user: user,
  };
  showRemoveRoleModal.value = true;
};

const confirmRemoveRole = async () => {
  const user = removeRoleModalData.value.user;
  if (!user) return;

  try {
    removingRole.value = user.id;

    // Call API to unassign role from user
    await unassignRoleFromUser(user.user_id || user.id, user.role_id);

    toast.success(
      `Role "${user.role}" has been successfully removed from user "${user.name}".`,
      "success"
    );

    // Refresh the users list to reflect changes
    await fetchUsers();
  } catch (error) {
    console.error("Error removing role from user:", error);
    const errorMessage =
      error.message ||
      `Failed to remove role from user "${user.name}". Please try again.`;
    toast.error(errorMessage, "error");
  } finally {
    removingRole.value = null;
    // Reset modal data
    removeRoleModalData.value = {
      title: "",
      message: "",
      user: null,
    };
  }
};

// Filter methods
const applyFilters = (newFilters) => {
  console.log("applyFilters - newFilters received:", newFilters);
  filters.value = { ...newFilters };
  console.log("applyFilters - filters.value after update:", filters.value);
  // Fetch data with new filters, reset to page 1
  fetchUsers(true);
};

const handleResetFilters = () => {
  filters.value = {
    search: "",
    // Other filters are temporarily disabled
    // status: "",
    // roles: [],
    // departments: [],
    // minWorkload: null,
    // maxWorkload: null,
  };
  // Fetch data with reset filters, reset to page 1
  fetchUsers(true);
};

// Pagination methods
const handlePageChange = (page) => {
  goToPage(page);
};

const handlePageSizeChange = (size) => {
  setPageSize(size);
};

// Assign role methods
const openAssignRoleModal = (user) => {
  selectedUserForRole.value = user;
  showAssignRoleModal.value = true;
};

const closeAssignRoleModal = () => {
  showAssignRoleModal.value = false;
  selectedUserForRole.value = null;
};

const handleRoleAssignment = async (assignmentData) => {
  try {
    // Call API to assign role to user
    await assignRolesToUser(assignmentData.userId, [assignmentData.roleId]);

    toast.success(
      `Role "${assignmentData.roleName}" has been successfully assigned to user "${selectedUserForRole.value.name}".`,
      "success"
    );

    // Refresh the users list to reflect changes
    await fetchUsers();
  } catch (error) {
    console.error("Error assigning role to user:", error);
    const errorMessage =
      error.message ||
      `Failed to assign role to user "${selectedUserForRole.value.name}". Please try again.`;
    toast.error(errorMessage, "error");
  }
};

// Manage roles methods
const openManageRolesModal = (user) => {
  selectedUserForRoleManagement.value = user;
  showManageRolesModal.value = true;
};

const closeManageRolesModal = () => {
  showManageRolesModal.value = false;
  selectedUserForRoleManagement.value = null;
};

const handleRoleManagementSuccess = async () => {
  // Refresh the users list to reflect changes
  await fetchUsers();
};

// Fetch roles for the assign role modal
const fetchRoles = async () => {
  try {
    const companyId = authStore?.user?.company_id;
    const params = companyId ? { company_id: companyId } : {};
    const response = await getRoles(params);
    if (response.data) {
      roles.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
    // Fallback to mock roles for development
    roles.value = [
      { id: 1, name: "Admin", description: "Full system access" },
      { id: 2, name: "Manager", description: "Team management access" },
      { id: 3, name: "Developer", description: "Development access" },
      { id: 4, name: "QA", description: "Quality assurance access" },
      { id: 5, name: "Designer", description: "Design access" },
      { id: 6, name: "Employee", description: "Default Role" },
      { id: 7, name: "Test", description: null },
    ];
  }
};

onMounted(() => {
  fetchUsers();
  fetchRoles();
});
</script>
