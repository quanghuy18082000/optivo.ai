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
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">Your Projects</h2>

        <div class="flex items-center gap-3">
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
          @click="addNewProject"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Project
        </button>
      </div>

      <!-- Project Table -->
      <ProjectTable
        v-else
        :projects="projects"
        @project-deleted="handleProjectDeleted"
        @refresh-projects="refetch"
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
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import Button from "@/components/ui/Button.vue";
import ProjectTable from "../components/ProjectTable.vue";
import ProjectFilters from "../components/ProjectFilters.vue";
import { useProjects } from "../composables/useProjects";
import { useAuthStore } from "@/modules/auth/store";
import { useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";

const authStore = useAuthStore();
const router = useRouter();

const {
  projects,
  filters,
  isLoading,
  error,
  updateFilters,
  resetFilters,
  refetch,
} = useProjects();

const showFilters = ref(false);
const showProfileMenu = ref(false);

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
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleEscKey);
  document.removeEventListener("click", handleClickOutside);
});
</script>
