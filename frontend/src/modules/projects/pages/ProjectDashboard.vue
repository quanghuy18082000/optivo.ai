<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Project Dashboard</h1>
        <span class="text-sm text-gray-500">Overview of your projects</span>
      </div>
    </template>

    <template #header-right>
      <div class="relative">
        <!-- Profile Icon -->
        <button
          @click="showProfileMenu = !showProfileMenu"
          class="profile-button flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>

        <!-- Profile Dropdown Menu -->
        <div
          v-if="showProfileMenu"
          class="profile-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
        >
          <div class="px-4 py-3 border-b border-gray-100">
            <p class="text-sm font-medium text-gray-900">
              {{ authStore.user?.name || "Guest User" }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ authStore.user?.email || "No email available" }}
            </p>
          </div>
          <a
            href="#"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >Your Profile</a
          >
          <a
            href="#"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >Settings</a
          >
          <button
            @click="handleLogout"
            class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import Button from "@/components/ui/Button.vue";
import ProjectTable from "../components/ProjectTable.vue";
import ProjectFilters from "../components/ProjectFilters.vue";
import { useProjects } from "../composables/useProjects";
import { useAuthStore } from "@/modules/auth/store";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const { projects, filters, isLoading, error, updateFilters, resetFilters } =
  useProjects();

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
  // Implement navigation to a new project creation page/modal
  console.log("Add new project clicked");
};

const handleLogout = () => {
  showProfileMenu.value = false;
  authStore.logout();
  window.location.href = "/login";
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
