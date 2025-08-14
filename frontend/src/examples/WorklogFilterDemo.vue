<template>
  <div class="worklog-filter-demo p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6">Worklog Filter Demo</h2>

    <!-- Filter Controls -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <!-- Project Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Projects
        </label>
        <div class="space-y-2">
          <label
            v-for="project in availableProjects"
            :key="project.id"
            class="flex items-center"
          >
            <input
              type="checkbox"
              :value="project.id"
              v-model="selectedProjectIds"
              class="mr-2"
            />
            {{ project.name }}
          </label>
        </div>
      </div>

      <!-- Category Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          v-model="selectedCategory"
          class="w-full border rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          <option value="development">Development</option>
          <option value="bug-fix">Bug Fix</option>
          <option value="testing">Testing</option>
          <option value="documentation">Documentation</option>
        </select>
      </div>

      <!-- Date Range -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Date Range
        </label>
        <div class="space-y-2">
          <input
            type="date"
            v-model="startDate"
            placeholder="Start Date"
            class="w-full border rounded px-3 py-2"
          />
          <input
            type="date"
            v-model="endDate"
            placeholder="End Date"
            class="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-4 mb-6">
      <button
        @click="fetchWorklogs"
        :disabled="isLoading"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isLoading ? "Loading..." : "Fetch Worklogs" }}
      </button>

      <button
        @click="clearFilters"
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Clear Filters
      </button>
    </div>

    <!-- Generated URL Display -->
    <div class="mb-6 p-4 bg-gray-100 rounded">
      <h3 class="font-semibold mb-2">Generated API URL:</h3>
      <code class="text-sm break-all">{{ generatedUrl }}</code>
    </div>

    <!-- Query Parameters Display -->
    <div class="mb-6 p-4 bg-blue-50 rounded">
      <h3 class="font-semibold mb-2">Query Parameters:</h3>
      <pre class="text-sm">{{ JSON.stringify(queryParams, null, 2) }}</pre>
    </div>

    <!-- Results -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded">
      <h3 class="font-semibold text-red-800 mb-2">Error:</h3>
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-if="worklogs.length > 0" class="mb-6">
      <h3 class="font-semibold mb-4">Results ({{ worklogs.length }} items):</h3>
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="worklog in worklogs"
          :key="worklog.id"
          class="p-3 border rounded bg-gray-50"
        >
          <div class="font-medium">{{ worklog.project_name }}</div>
          <div class="text-sm text-gray-600">{{ worklog.description }}</div>
          <div class="text-xs text-gray-500">
            {{ worklog.hours }}h {{ worklog.minutes }}m - {{ worklog.date }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!isLoading && hasSearched"
      class="text-gray-500 text-center py-8"
    >
      No worklogs found with current filters.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { getWorklogs } from "@/modules/worklogs/services/worklogService";
import { buildApiQueryString } from "@/utils/urlQueryParams";

// Demo data
const availableProjects = ref([
  { id: 1, name: "Project Alpha" },
  { id: 2, name: "Project Beta" },
  { id: 3, name: "Project Gamma" },
  { id: 4, name: "Project Delta" },
  { id: 5, name: "Project Epsilon" },
]);

// Filter state
const selectedProjectIds = ref([]);
const selectedCategory = ref("");
const startDate = ref("");
const endDate = ref("");

// API state
const isLoading = ref(false);
const error = ref(null);
const worklogs = ref([]);
const hasSearched = ref(false);

// Computed query parameters
const queryParams = computed(() => {
  const params = {};

  // Add user_id (simulated)
  params.user_id = 123;

  // Add project_ids if selected
  if (selectedProjectIds.value.length > 0) {
    params.project_ids = selectedProjectIds.value;
  }

  // Add category if selected
  if (selectedCategory.value) {
    params.category = selectedCategory.value;
  }

  // Add date filters
  if (startDate.value) {
    params.created_after = startDate.value;
  }

  if (endDate.value) {
    params.created_before = endDate.value;
  }

  // Add default sorting and pagination
  params.sort_by = "created_at";
  params.sort_order = "desc";
  params.page = 1;
  params.size = 20;

  return params;
});

// Generated URL for display
const generatedUrl = computed(() => {
  const baseUrl =
    "https://api.optivo.ai.stg.madlab.tech/api/worklogs/list/grouped-by-date";
  const queryString = buildApiQueryString(queryParams.value);
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
});

// Fetch worklogs function
const fetchWorklogs = async () => {
  isLoading.value = true;
  error.value = null;
  hasSearched.value = true;

  try {
    console.log("Fetching worklogs with params:", queryParams.value);
    console.log("Generated URL:", generatedUrl.value);

    const response = await getWorklogs(queryParams.value);

    // Handle the response structure
    if (response.data && Array.isArray(response.data)) {
      worklogs.value = response.data.flat(); // Flatten grouped data
    } else if (response.data && response.data.data) {
      worklogs.value = Array.isArray(response.data.data)
        ? response.data.data.flat()
        : [];
    } else {
      worklogs.value = [];
    }

    console.log("Fetched worklogs:", worklogs.value.length, "items");
  } catch (err) {
    console.error("Error fetching worklogs:", err);
    error.value = err.message || "Failed to fetch worklogs";
    worklogs.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Clear filters function
const clearFilters = () => {
  selectedProjectIds.value = [];
  selectedCategory.value = "";
  startDate.value = "";
  endDate.value = "";
  worklogs.value = [];
  error.value = null;
  hasSearched.value = false;
};

// Watch for filter changes and log the generated URL
watch(
  queryParams,
  (newParams) => {
    console.log("Query params changed:", newParams);
    console.log("Generated URL:", generatedUrl.value);
  },
  { deep: true }
);

// Auto-select some projects for demo
selectedProjectIds.value = [1, 2];
selectedCategory.value = "development";
startDate.value = "2024-01-01";
endDate.value = "2024-01-31";
</script>

<style scoped>
.worklog-filter-demo {
  max-width: 1200px;
  margin: 0 auto;
}

code {
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: "Courier New", monospace;
}

pre {
  background-color: #f8fafc;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: "Courier New", monospace;
}
</style>
