<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Project Dashboard</h1>
        <span class="text-sm text-gray-500">Overview of your projects</span>
      </div>
    </template>

    <!-- Main Content -->
    <div class="space-y-6">
      <!-- Action Buttons -->
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-3">
          <h2 class="text-lg font-medium text-gray-900">Your Projects</h2>

          <!-- Bulk Actions (shown when projects are selected) -->
          <div
            v-if="selectedProjects.length > 0"
            class="flex items-center gap-3 p-2 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span class="text-sm font-medium text-blue-900">
                {{ selectedProjects.length }} project{{
                  selectedProjects.length > 1 ? "s" : ""
                }}
                selected
              </span>
            </div>
            <Button
              variant="primary"
              size="small"
              @click="showChangeStatusModal = true"
              class="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Change Status
            </Button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Export CSV Button -->
          <Button
            variant="secondary"
            class="border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="handleExportCSV"
            :disabled="isExporting"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {{ isExporting ? "Exporting..." : "Export CSV" }}
          </Button>

          <!-- Filters Button -->
          <button
            @click="showFilters = true"
            class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              class="w-4 h-4 mr-2"
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
            Filter
          </button>

          <!-- Add New Project Button -->
          <Button
            v-if="hasPermission(PERMISSIONS.PROJECT_CREATE)"
            variant="primary"
            class="bg-blue-600 hover:bg-blue-700"
            @click="addNewProject"
          >
            <svg
              class="w-4 h-4 mr-2"
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
            Add a new project
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-3">
          <svg
            class="animate-spin h-6 w-6 text-blue-600"
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
          <span class="text-gray-600">Loading projects...</span>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
      >
        <svg
          class="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-red-800">
          Error loading projects
        </h3>
        <p class="mt-1 text-sm text-red-600">
          {{ error.message || "An unexpected error occurred" }}
        </p>
        <button
          @click="refetch"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!projects.length"
        class="bg-white border border-gray-200 rounded-lg p-12 text-center"
      >
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">
          No projects found
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          Get started by creating your first project or try different filter
          criteria.
        </p>
        <button
          v-if="hasPermission(PERMISSIONS.PROJECT_CREATE)"
          @click="addNewProject"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Project
        </button>
      </div>

      <!-- Project Table -->
      <ProjectTable
        v-else
        ref="projectTableRef"
        :projects="projects"
        @project-deleted="handleProjectDeleted"
        @refresh-projects="refetch"
        @selection-changed="handleSelectionChanged"
      />
    </div>

    <!-- Filter Panel -->
    <ProjectFilters
      :is-open="showFilters"
      :filters="filters"
      @close="showFilters = false"
      @apply="applyFilters"
      @reset="handleResetFilters"
    />

    <!-- Change Status Modal -->
    <ChangeStatusModal
      :is-open="showChangeStatusModal"
      :selected-projects="selectedProjects"
      :is-loading="isChangingStatus"
      @close="showChangeStatusModal = false"
      @change-status="handleChangeStatus"
    />
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import Button from "@/components/ui/Button.vue";
import ProjectTable from "../components/ProjectTable.vue";
import ProjectFilters from "../components/ProjectFilters.vue";
import ChangeStatusModal from "../components/ChangeStatusModal.vue";

import { useProjects } from "../composables/useProjects";
import { useAuthStore } from "@/modules/auth/store";
import { useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";
import { transformProjectsData } from "../utils/workloadDataTransformer";
import { usePermissions } from "@/composables/usePermissions";
import {
  updateProjectsStatus,
  exportProjectsMembersDetailCSV,
} from "../services/projectService";
import { usePageInitLoading } from "@/composables/usePageLoading";

const authStore = useAuthStore();
const router = useRouter();
const { showToast } = useToast();
const { hasPermission, PERMISSIONS } = usePermissions();

// Page loading management
const { stopLoading } = usePageInitLoading("project-dashboard");

const {
  projects: rawProjects,
  filters,
  isLoading,
  error,
  updateFilters,
  resetFilters,
  refetch,
} = useProjects();

// Stop page loading when data is loaded
watch(
  isLoading,
  (newIsLoading) => {
    if (!newIsLoading) {
      stopLoading();
    }
  },
  { immediate: true }
);

// Transform raw projects data for ProjectTable
const projects = computed(() => {
  return transformProjectsData(rawProjects.value);
});

const showFilters = ref(false);
const showProfileMenu = ref(false);
const showChangeStatusModal = ref(false);
const selectedProjects = ref([]);
const isChangingStatus = ref(false);
const isExporting = ref(false);
const projectTableRef = ref(null);

// Click outside handler for profile menu
const handleClickOutside = (event) => {
  const profileMenu = document.querySelector(".profile-menu");
  const profileButton = document.querySelector(".profile-button");

  if (
    profileMenu &&
    showProfileMenu.value &&
    !profileMenu.contains(event.target) &&
    !profileButton.contains(event.target)
  ) {
    showProfileMenu.value = false;
  }
};

// Methods
const applyFilters = (newFilters) => {
  updateFilters(newFilters);
};

const handleResetFilters = () => {
  resetFilters();
};

const addNewProject = () => {
  router.push("/projects/add");
};

const toast = useToast();

const handleProjectDeleted = (project) => {
  toast.success(`Project "${project.name}" was successfully deleted`);
};

const handleSelectionChanged = (projects) => {
  selectedProjects.value = projects;
};

const handleChangeStatus = async ({ changes }) => {
  try {
    isChangingStatus.value = true;

    // Format changes for API
    const updates = changes.map(({ projectId, newStatus }) => ({
      project_id: projectId,
      status: newStatus,
    }));

    // Send all updates in one request
    await updateProjectsStatus(updates);

    const projectCount = changes.length;
    toast.success(
      `Successfully changed status for ${projectCount} project${
        projectCount > 1 ? "s" : ""
      }`
    );

    // Close modal and clear selection
    showChangeStatusModal.value = false;
    selectedProjects.value = [];

    // Clear selection in ProjectTable component
    if (projectTableRef.value) {
      projectTableRef.value.clearSelection();
    }

    // Refresh projects
    await refetch();
  } catch (error) {
    toast.error(error.message || "Failed to change project status");
  } finally {
    isChangingStatus.value = false;
  }
};

const handleExportCSV = async () => {
  try {
    isExporting.value = true;

    // Prepare request body
    let requestBody = {};

    // If user has selected projects from table, use those project IDs
    if (selectedProjects.value.length > 0) {
      requestBody.project_ids = selectedProjects.value.map(
        (project) => project.id
      );
    } else {
      // If no projects selected, use current filters
      requestBody = { ...filters.value };
    }

    // Call export API
    const csvBlob = await exportProjectsMembersDetailCSV(requestBody);

    // Create download link
    const url = window.URL.createObjectURL(csvBlob);
    const link = document.createElement("a");
    link.href = url;

    // Generate filename with current date
    const currentDate = new Date().toISOString().split("T")[0];
    link.download = `projects-members-detail-${currentDate}.csv`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("CSV file downloaded successfully");
  } catch (error) {
    console.error("Export CSV error:", error);
    toast.error(error.message || "Failed to export CSV");
  } finally {
    isExporting.value = false;
  }
};

// Handle escape key to close profile menu
const handleEscKey = (e) => {
  if (e.key === "Escape" && showProfileMenu.value) {
    showProfileMenu.value = false;
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener("keydown", handleEscKey);
  document.addEventListener("click", handleClickOutside);
  stopLoading();
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleEscKey);
  document.removeEventListener("click", handleClickOutside);
});
</script>
