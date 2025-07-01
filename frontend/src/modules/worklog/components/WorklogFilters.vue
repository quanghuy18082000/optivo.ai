<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-hidden"
    @click="closePanel"
  >
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>

    <div
      class="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
      @click.stop
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200"
      >
        <h2 class="text-lg font-semibold text-gray-900">Filters & Settings</h2>
        <button
          @click="closePanel"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Filter Content -->
      <div class="p-6 space-y-6 overflow-y-auto h-full pb-24">
        <!-- Time Period -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Time Period</label
          >
          <Select
            v-model="localFilters.timePeriod"
            :options="timePeriodOptions"
            placeholder="Select time period"
          />
        </div>

        <!-- Projects (MultiSelect) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Projects</label
          >
          <MultiSelect
            v-model="localFilters.projectIds"
            :options="projectOptions"
            placeholder="Select projects"
            :searchable="true"
            :show-select-all="true"
            :max-display-items="2"
          />
        </div>

        <!-- Categories (MultiSelect) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Categories</label
          >
          <MultiSelect
            v-model="localFilters.categories"
            :options="categoryOptions"
            placeholder="Select categories"
            :searchable="true"
            :show-select-all="true"
            :max-display-items="2"
          />
        </div>

        <!-- Status (MultiSelect) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Status</label
          >
          <MultiSelect
            v-model="localFilters.statuses"
            :options="statusOptions"
            placeholder="Select status"
            :searchable="false"
            :show-select-all="true"
            :max-display-items="2"
          />
        </div>

        <!-- Custom Date Range -->
        <div v-if="localFilters.timePeriod === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Custom Date Range</label
          >
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">From</label>
              <DatePicker
                v-model="localFilters.dateFrom"
                placeholder="dd/mm/yyyy"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">To</label>
              <DatePicker
                v-model="localFilters.dateTo"
                placeholder="dd/mm/yyyy"
              />
            </div>
          </div>
        </div>

        <!-- Active Filters Summary -->
        <div
          v-if="hasActiveFilters"
          class="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h4 class="text-sm font-medium text-blue-900 mb-2">Active Filters</h4>
          <div class="space-y-1 text-xs text-blue-700">
            <div v-if="localFilters.projectIds.length > 0">
              Projects: {{ getSelectedProjectNames().join(", ") }}
            </div>
            <div v-if="localFilters.categories.length > 0">
              Categories: {{ localFilters.categories.join(", ") }}
            </div>
            <div v-if="localFilters.statuses.length > 0">
              Status: {{ getSelectedStatusNames().join(", ") }}
            </div>
            <div
              v-if="
                localFilters.timePeriod && localFilters.timePeriod !== 'all'
              "
            >
              Time: {{ getTimePeriodLabel() }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        class="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200"
      >
        <div class="flex gap-3">
          <Button variant="secondary" class="flex-1" @click="resetFilters">
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset All
          </Button>
          <Button variant="primary" class="flex-1" @click="applyFilters">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Select from "@/components/ui/Select.vue";
import MultiSelect from "@/components/ui/MultiSelect.vue";
import DatePicker from "@/components/ui/DatePicker.vue";
import Button from "@/components/ui/Button.vue";
import { mockProjects, mockCategories } from "../data/mockData";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "apply", "reset"]);

const localFilters = ref({
  timePeriod: "all", // Changed default to 'all' to show all data initially
  projectIds: [],
  categories: [],
  statuses: [],
  dateFrom: "",
  dateTo: "",
  ...props.filters,
});

const timePeriodOptions = [
  { label: "All time", value: "all" }, // Added 'All time' option as default
  { label: "Last week", value: "last_week" },
  { label: "Last month", value: "last_month" },
  { label: "Last 3 months", value: "last_3_months" },
  { label: "This year", value: "this_year" },
  { label: "Custom range", value: "custom" },
];

const projectOptions = computed(() =>
  mockProjects.map((project) => ({
    label: project.name,
    value: project.id,
  }))
);

const categoryOptions = computed(() =>
  mockCategories.map((category) => ({
    label: category.name,
    value: category.name,
  }))
);

const statusOptions = [
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
];

const hasActiveFilters = computed(() => {
  return (
    localFilters.value.projectIds.length > 0 ||
    localFilters.value.categories.length > 0 ||
    localFilters.value.statuses.length > 0 ||
    (localFilters.value.timePeriod &&
      localFilters.value.timePeriod !== "all") ||
    (localFilters.value.dateFrom && localFilters.value.dateTo)
  );
});

const getSelectedProjectNames = () => {
  return mockProjects
    .filter((project) => localFilters.value.projectIds.includes(project.id))
    .map((project) => project.name);
};

const getSelectedStatusNames = () => {
  return statusOptions
    .filter((status) => localFilters.value.statuses.includes(status.value))
    .map((status) => status.label);
};

const getTimePeriodLabel = () => {
  const option = timePeriodOptions.find(
    (opt) => opt.value === localFilters.value.timePeriod
  );
  if (
    localFilters.value.timePeriod === "custom" &&
    localFilters.value.dateFrom &&
    localFilters.value.dateTo
  ) {
    return `${localFilters.value.dateFrom} to ${localFilters.value.dateTo}`;
  }
  return option ? option.label : "";
};

const closePanel = () => {
  emit("close");
};

const applyFilters = () => {
  emit("apply", { ...localFilters.value });
  closePanel();
};

const resetFilters = () => {
  localFilters.value = {
    timePeriod: "all", // Reset to 'all' to show all data
    projectIds: [],
    categories: [],
    statuses: [],
    dateFrom: "",
    dateTo: "",
  };
  emit("reset");
};

// Watch for external filter changes
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...localFilters.value, ...newFilters };
  },
  { deep: true }
);
</script>
