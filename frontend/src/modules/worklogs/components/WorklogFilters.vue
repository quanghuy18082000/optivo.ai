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
        <!-- Project -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Project</label
          >
          <Select
            v-model="localFilters.projectId"
            :options="projectOptions"
            placeholder="Select project"
          />
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Category</label
          >
          <Select
            v-model="localFilters.category"
            :options="categoryOptions"
            placeholder="Select category"
          />
        </div>

        <!-- Time Period -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Time Period</label
          >
          <div class="grid grid-cols-1 gap-3">
            <Select
              v-model="selectedTimePeriod"
              :options="timePeriodOptions"
              placeholder="Select time period"
              @update:modelValue="handleTimePeriodChange"
            />
          </div>
        </div>

        <!-- Custom Date Range (shown only when Custom is selected) -->
        <div v-if="selectedTimePeriod === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Custom Date Range</label
          >
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">From</label>
              <DatePicker
                v-model="localFilters.createdAfter"
                placeholder="yyyy-mm-dd"
                type="date"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">To</label>
              <DatePicker
                v-model="localFilters.createdBefore"
                placeholder="yyyy-mm-dd"
                type="date"
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
            <div v-if="localFilters.projectId">
              Project: {{ getProjectName(localFilters.projectId) }}
            </div>
            <div v-if="localFilters.category">
              Category: {{ localFilters.category }}
            </div>
            <div v-if="localFilters.createdAfter && localFilters.createdBefore">
              Time Period: {{ getTimePeriodLabel() }}
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
import { ref, computed, watch, onMounted } from "vue";
import { useQuery } from "@tanstack/vue-query";
import Select from "@/components/ui/Select.vue";
import MultiSelect from "@/components/ui/MultiSelect.vue";
import DatePicker from "@/components/ui/DatePicker.vue";
import Button from "@/components/ui/Button.vue";
import { getProjects, getCategories } from "../services/worklogService";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";

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
  projectId: null,
  category: null,
  createdAfter: "",
  createdBefore: "",
  ...props.filters,
});

// Time period selection
const selectedTimePeriod = ref("today");

// Fetch projects from API
const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
  queryKey: ["projects"],
  queryFn: getProjects,
});

// Fetch categories from API
const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
  queryKey: ["categories"],
  queryFn: getCategories,
});

const projects = computed(() => projectsData.value?.data || []);
const categories = computed(() => categoriesData.value?.data || []);

const projectOptions = computed(() => {
  return projects.value.map((project) => ({
    label: project.name,
    value: project.id,
  }));
});

const categoryOptions = computed(() => {
  return categories.value.map((category) => ({
    label: category.name,
    value: category.name,
  }));
});

const timePeriodOptions = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "Last Week", value: "last_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "this_year" },
  { label: "Last Year", value: "last_year" },
  { label: "Custom Range", value: "custom" },
];

// Function to handle time period changes
const handleTimePeriodChange = (value) => {
  if (value === "custom") {
    // For custom, we don't set dates automatically
    return;
  }

  const now = new Date();
  let startDate;
  let endDate;

  switch (value) {
    case "today":
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;

    case "yesterday":
      startDate = startOfDay(subDays(now, 1));
      endDate = endOfDay(subDays(now, 1));
      break;

    case "this_week":
      startDate = startOfWeek(now, { weekStartsOn: 1 }); // Week starts on Monday
      endDate = endOfDay(now);
      break;

    case "last_week":
      startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      break;

    case "this_month":
      startDate = startOfMonth(now);
      endDate = endOfDay(now);
      break;

    case "last_month":
      startDate = startOfMonth(subMonths(now, 1));
      endDate = endOfMonth(subMonths(now, 1));
      break;

    case "this_year":
      startDate = startOfYear(now);
      endDate = endOfDay(now);
      break;

    case "last_year":
      startDate = startOfYear(subYears(now, 1));
      endDate = endOfYear(subYears(now, 1));
      break;
  }

  // Format dates for API in UTC ISO format: YYYY-MM-DDTHH:MM:SSZ
  localFilters.value.createdAfter = startDate.toISOString().split(".")[0] + "Z";
  localFilters.value.createdBefore = endDate.toISOString().split(".")[0] + "Z";
};

const hasActiveFilters = computed(() => {
  return (
    localFilters.value.projectId ||
    localFilters.value.category ||
    (localFilters.value.createdAfter && localFilters.value.createdBefore)
  );
});

// Function to get the label for the selected time period
const getTimePeriodLabel = () => {
  if (selectedTimePeriod.value === "custom") {
    return `${formatDate(localFilters.value.createdAfter)} to ${formatDate(
      localFilters.value.createdBefore
    )}`;
  } else {
    const option = timePeriodOptions.find(
      (opt) => opt.value === selectedTimePeriod.value
    );
    return option ? option.label : "Custom Range";
  }
};

const getProjectName = (projectId) => {
  const project = projects.value.find((p) => p.id === projectId);
  return project ? project.name : projectId;
};

// Initialize with today's date range
onMounted(() => {
  handleTimePeriodChange("today");
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return format(date, "MMM d, yyyy");
};

const closePanel = () => {
  emit("close");
};

const applyFilters = () => {
  // Create a copy of the filters
  const filtersToApply = { ...localFilters.value };

  // Format dates to UTC format if they exist
  if (filtersToApply.createdAfter) {
    const startDate = new Date(filtersToApply.createdAfter);
    filtersToApply.createdAfter = startDate.toISOString().split(".")[0] + "Z";
  }

  if (filtersToApply.createdBefore) {
    const endDate = new Date(filtersToApply.createdBefore);
    filtersToApply.createdBefore = endDate.toISOString().split(".")[0] + "Z";
  }

  emit("apply", filtersToApply);
  closePanel();
};

const resetFilters = () => {
  localFilters.value = {
    projectId: null,
    category: null,
    createdAfter: "",
    createdBefore: "",
  };
  selectedTimePeriod.value = "today";
  handleTimePeriodChange("today");
  emit("reset");
};

// Watch for external filter changes
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...localFilters.value, ...newFilters };

    // Try to determine the time period based on the dates
    if (newFilters.createdAfter && newFilters.createdBefore) {
      selectedTimePeriod.value = "custom";

      // You could add logic here to detect if the date range matches any of the predefined periods
      // and set selectedTimePeriod accordingly
    }
  },
  { deep: true }
);

// Watch for changes in the date filters to update the time period
watch(
  () => [localFilters.value.createdAfter, localFilters.value.createdBefore],
  () => {
    // If dates are manually changed, set to custom
    if (localFilters.value.createdAfter && localFilters.value.createdBefore) {
      selectedTimePeriod.value = "custom";

      // Convert date strings to UTC ISO format if they're not already
      if (
        localFilters.value.createdAfter &&
        !localFilters.value.createdAfter.includes("T")
      ) {
        const startDate = new Date(localFilters.value.createdAfter);
        // Set to start of day in UTC
        const utcStartDate = startOfDay(startDate);
        localFilters.value.createdAfter =
          utcStartDate.toISOString().split(".")[0] + "Z";
      }

      if (
        localFilters.value.createdBefore &&
        !localFilters.value.createdBefore.includes("T")
      ) {
        const endDate = new Date(localFilters.value.createdBefore);
        // Set to end of day in UTC
        const utcEndDate = endOfDay(endDate);
        localFilters.value.createdBefore =
          utcEndDate.toISOString().split(".")[0] + "Z";
      }
    }
  }
);
</script>
