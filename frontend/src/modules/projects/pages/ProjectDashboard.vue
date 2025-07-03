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

      <!-- Project Table -->
      <ProjectTable v-else :projects="projects" />
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
import { ref } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import Button from "@/components/ui/Button.vue";
import ProjectTable from "../components/ProjectTable.vue";
import ProjectFilters from "../components/ProjectFilters.vue";
import { useProjects } from "../composables/useProjects";
import { useRouter } from "vue-router";

const router = useRouter();

const { projects, filters, isLoading, error, updateFilters, resetFilters } =
  useProjects();

const showFilters = ref(false);

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
</script>