<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Daily Input</h1>
        <span class="text-sm text-gray-500">Log your work</span>
      </div>
    </template>
    <!-- Main Content -->
    <div class="space-y-6">
      <!-- Action Buttons -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">Your Worklogs</h2>

        <div class="flex items-center gap-3">
          <!-- Filters Button -->
          <button
            @click="showFilters = true"
            class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            :class="{
              'bg-blue-50 border-blue-300 text-blue-700': hasActiveFilters,
            }"
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
            Filters
            <span
              v-if="activeFilterCount > 0"
              class="ml-1 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5"
            >
              {{ activeFilterCount }}
            </span>
          </button>

          <!-- Log Work Today Button -->
          <Button
            variant="primary"
            class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            @click="logWorkToday"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Log Work Today
          </Button>
        </div>
      </div>
      <!-- Stats Cards -->
      <!-- <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Hours</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.totalHours }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Projects</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.totalProjects }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Categories</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.totalCategories }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Avg Progress</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.avgProgress }}%
              </p>
            </div>
          </div>
        </div>
      </div> -->

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
          <span class="text-gray-600">Loading worklogs...</span>
        </div>
      </div>
      <!-- Worklog Table -->
      <WorklogTable v-else :worklogs="worklogs" />

      <!-- Pagination -->
      <div
        v-if="pagination.total_pages > 1 && !isLoading"
        class="flex items-center justify-between"
      >
        <div class="text-sm text-gray-700">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
          of {{ pagination.total }} results
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="secondary"
            :disabled="pagination.page <= 1"
            @click="handleChangePage(pagination.page - 1)"
          >
            Previous
          </Button>

          <div class="flex items-center gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="handleChangePage(page)"
              class="px-3 py-2 text-sm rounded-md transition-colors"
              :class="[
                page === pagination.page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100',
              ]"
            >
              {{ page }}
            </button>
          </div>

          <Button
            variant="secondary"
            :disabled="pagination.page >= pagination.total_pages"
            @click="handleChangePage(pagination.page + 1)"
          >
            Next
          </Button>
        </div>
      </div>
    </div>

    <!-- Filter Panel -->
    <WorklogFilters
      :is-open="showFilters"
      :filters="filters"
      @close="showFilters = false"
      @apply="applyFilters"
      @reset="handleResetFilters"
    />
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import WorklogTable from "../components/WorklogTable.vue";
import WorklogFilters from "../components/WorklogFilters.vue";
import Button from "@/components/ui/Button.vue";
import { useWorklog } from "../composables/useWorklog";
import { useRouter } from "vue-router";

const router = useRouter();

// Use the worklog composable with fetchWorklogs explicitly set to true
const {
  worklogs,
  pagination,
  filters,
  isLoading,
  error,
  updateFilters,
  resetFilters,
  changePage,
  refetch,
} = useWorklog({ fetchWorklogs: true });

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

// Computed
const visiblePages = computed(() => {
  const current = pagination.value.page;
  const total = pagination.value.total_pages;
  const pages = [];

  // Show up to 5 pages around current page
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const hasActiveFilters = computed(() => {
  return (
    (filters.value.projectIds && filters.value.projectIds.length > 0) ||
    filters.value.category ||
    (filters.value.createdAfter && filters.value.createdBefore) ||
    (filters.value.sortBy && filters.value.sortBy !== "created_at") ||
    (filters.value.sortOrder && filters.value.sortOrder !== "desc")
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.projectIds && filters.value.projectIds.length > 0) count++;
  if (filters.value.category) count++;
  if (filters.value.createdAfter && filters.value.createdBefore) count++;
  if (filters.value.sortBy && filters.value.sortBy !== "created_at") count++;
  if (filters.value.sortOrder && filters.value.sortOrder !== "desc") count++;
  return count;
});

// Methods
const applyFilters = (newFilters) => {
  updateFilters(newFilters);
};

const handleResetFilters = () => {
  resetFilters();
};

const handleChangePage = (page) => {
  changePage(page);
};

const logWorkToday = () => {
  router.push("/worklog/create");
};

const handleEscKey = (e) => {
  if (e.key === "Escape" && showProfileMenu.value) {
    showProfileMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscKey);
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleEscKey);
  document.removeEventListener("click", handleClickOutside);
});
</script>
