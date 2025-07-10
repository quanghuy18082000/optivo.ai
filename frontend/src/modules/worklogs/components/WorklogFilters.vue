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
        <!-- <div>
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Category</label
          >
          <Select
            v-model="localFilters.category"
            :options="categoryOptions"
            placeholder="Select category"
          />
        </div> -->

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
              @change="(option) => handleTimePeriodChange(option.value)"
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
                @update:modelValue="saveCustomDateFrom"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">To</label>
              <DatePicker
                v-model="localFilters.createdBefore"
                placeholder="yyyy-mm-dd"
                type="date"
                @update:modelValue="saveCustomDateTo"
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

// Separate storage for custom date range
const customDateRange = ref({
  from: "",
  to: "",
});

// Fetch projects from API
const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
  queryKey: ["projects"],
  queryFn: getProjects,
});

// Fetch categories from API
// const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
//   queryKey: ["categories"],
//   queryFn: getCategories,
// });

const projects = computed(() => projectsData.value?.data || []);
// const categories = computed(() => categoriesData.value?.data || []);

const projectOptions = computed(() => {
  return projects.value.map((project) => ({
    label: project.name,
    value: project.id,
  }));
});

// const categoryOptions = computed(() => {
//   return categories.value.map((category) => ({
//     label: category.name,
//     value: category.name,
//   }));
// });

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
  // Update the selected time period
  selectedTimePeriod.value = value;

  if (value === "custom") {
    // For custom, restore any saved custom dates or leave empty
    if (customDateRange.value.from && customDateRange.value.to) {
      localFilters.value.createdAfter = customDateRange.value.from;
      localFilters.value.createdBefore = customDateRange.value.to;
    }
    return;
  }

  // For predefined periods, clear any custom date range
  customDateRange.value.from = "";
  customDateRange.value.to = "";

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

  // Format dates for DatePicker in YYYY-MM-DD format
  localFilters.value.createdAfter = format(startDate, "yyyy-MM-dd");
  localFilters.value.createdBefore = format(endDate, "yyyy-MM-dd");
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
  // Set the default time period
  selectedTimePeriod.value = "today";
  // Apply the date range for today
  handleTimePeriodChange("today");
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return format(date, "MMM d, yyyy");
};

// Save custom date range values
const saveCustomDateFrom = (value) => {
  customDateRange.value.from = value;
};

const saveCustomDateTo = (value) => {
  customDateRange.value.to = value;
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
    // For API submission, convert to ISO format
    filtersToApply.createdAfter =
      startOfDay(startDate).toISOString().split(".")[0] + "Z";
  }

  if (filtersToApply.createdBefore) {
    const endDate = new Date(filtersToApply.createdBefore);
    // For API submission, convert to ISO format
    filtersToApply.createdBefore =
      endOfDay(endDate).toISOString().split(".")[0] + "Z";
  }

  emit("apply", filtersToApply);
  closePanel();
};

const resetFilters = () => {
  // First reset the filters
  localFilters.value = {
    projectId: null,
    category: null,
    createdAfter: "",
    createdBefore: "",
  };

  // Reset custom date range
  customDateRange.value = {
    from: "",
    to: "",
  };

  // Then set the time period to today
  selectedTimePeriod.value = "today";

  // Apply the date range for today
  const now = new Date();
  localFilters.value.createdAfter = format(startOfDay(now), "yyyy-MM-dd");
  localFilters.value.createdBefore = format(endOfDay(now), "yyyy-MM-dd");

  emit("reset");
};

// Watch for external filter changes
watch(
  () => props.filters,
  (newFilters) => {
    // Create a copy of the new filters
    const processedFilters = { ...newFilters };

    // Convert ISO date strings to YYYY-MM-DD format for DatePicker
    if (
      processedFilters.createdAfter &&
      processedFilters.createdAfter.includes("T")
    ) {
      const date = new Date(processedFilters.createdAfter);
      processedFilters.createdAfter = format(date, "yyyy-MM-dd");
    }

    if (
      processedFilters.createdBefore &&
      processedFilters.createdBefore.includes("T")
    ) {
      const date = new Date(processedFilters.createdBefore);
      processedFilters.createdBefore = format(date, "yyyy-MM-dd");
    }

    localFilters.value = { ...localFilters.value, ...processedFilters };

    // Try to determine the time period based on the dates
    if (newFilters.createdAfter && newFilters.createdBefore) {
      // Check if the date range matches any predefined period
      const startDate = new Date(newFilters.createdAfter);
      const endDate = new Date(newFilters.createdBefore);
      const now = new Date();

      // Default to custom
      let detectedPeriod = "custom";

      // Check if the date range matches any predefined period
      if (
        format(startDate, "yyyy-MM-dd") ===
          format(startOfDay(now), "yyyy-MM-dd") &&
        format(endDate, "yyyy-MM-dd") === format(endOfDay(now), "yyyy-MM-dd")
      ) {
        detectedPeriod = "today";
      } else if (
        format(startDate, "yyyy-MM-dd") ===
          format(startOfDay(subDays(now, 1)), "yyyy-MM-dd") &&
        format(endDate, "yyyy-MM-dd") ===
          format(endOfDay(subDays(now, 1)), "yyyy-MM-dd")
      ) {
        detectedPeriod = "yesterday";
      } else if (
        format(startDate, "yyyy-MM-dd") ===
          format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd") &&
        format(endDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
      ) {
        detectedPeriod = "this_week";
      } else if (
        format(startDate, "yyyy-MM-dd") ===
          format(startOfMonth(now), "yyyy-MM-dd") &&
        format(endDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
      ) {
        detectedPeriod = "this_month";
      }

      selectedTimePeriod.value = detectedPeriod;
    }
  },
  { deep: true }
);

// Watch for changes in the date filters to update the time period
watch(
  () => [localFilters.value.createdAfter, localFilters.value.createdBefore],
  ([newAfter, newBefore], [oldAfter, oldBefore]) => {
    // Only process if we're in custom mode or if the dates were manually changed
    if (
      selectedTimePeriod.value === "custom" &&
      (newAfter !== oldAfter || newBefore !== oldBefore)
    ) {
      // Save the custom date range
      if (newAfter) customDateRange.value.from = newAfter;
      if (newBefore) customDateRange.value.to = newBefore;
    }
  }
);

// Watch for changes in the selected time period
watch(
  () => selectedTimePeriod.value,
  (newValue, oldValue) => {
    // Only process if this is an actual change (not from our own code)
    if (newValue && newValue !== oldValue) {
      if (newValue === "custom") {
        // If switching to custom, we don't need to call handleTimePeriodChange
        // as it will be handled by the function itself
      } else {
        // For predefined periods, update the date range
        handleTimePeriodChange(newValue);
      }
    }
  }
);
</script>
