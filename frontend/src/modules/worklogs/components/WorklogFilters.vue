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
            >Projects</label
          >
          <MultiSelect
            v-model="localFilters.projectIds"
            :options="projectOptions"
            placeholder="Select projects..."
            searchable
            show-select-all
          />
          <div class="text-xs text-gray-500 mt-1">
            Selected: {{ localFilters.projectIds?.length || 0 }} projects
          </div>
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
              searchable
              search-placeholder="Search time periods..."
              @change="handleTimePeriodChange"
            />
          </div>
        </div>

        <!-- Custom Date Range (shown only when Custom is selected) -->
        <div v-if="selectedTimePeriod === 'custom'" class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-3"
            >Custom Date Range</label
          >
          <div class="flex flex-col gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Start Date</label>
              <DatePicker
                v-model="localFilters.createdAfter"
                placeholder="yyyy-mm-dd"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">End Date</label>
              <DatePicker
                v-model="localFilters.createdBefore"
                placeholder="yyyy-mm-dd"
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
            <div
              v-if="
                localFilters.projectIds && localFilters.projectIds.length > 0
              "
              class="flex items-center gap-1"
            >
              <span>Projects:</span>
              <span v-if="localFilters.projectIds.length === 1">
                <TruncateText
                  :name="getProjectName(localFilters.projectIds[0])"
                  text-class="text-xs text-blue-700"
                  :max-length="20"
                />
              </span>
              <span v-else>
                {{ localFilters.projectIds.length }} projects selected
              </span>
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
import TruncateText from "@/components/ui/TruncateText.vue";
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
  projectIds: props.filters.projectIds || [],
  category: props.filters.category || null,
  createdAfter: props.filters.createdAfter || "",
  createdBefore: props.filters.createdBefore || "",
});

// Time period selection
const selectedTimePeriod = ref(null);

// Fetch projects from API
const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
  queryKey: ["projects"],
  queryFn: getProjects,
});

const projects = computed(() => projectsData.value?.data || []);

const projectOptions = computed(() => {
  return projects.value.map((project) => ({
    label: project.name,
    value: project.id,
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
const handleTimePeriodChange = (option) => {
  const value = option?.value || option;

  if (value === "custom") {
    // For custom range, just clear the dates and let user input them
    localFilters.value.createdAfter = "";
    localFilters.value.createdBefore = "";
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

    default:
      return;
  }

  // Format dates for DatePicker in YYYY-MM-DD format
  localFilters.value.createdAfter = format(startDate, "yyyy-MM-dd");
  localFilters.value.createdBefore = format(endDate, "yyyy-MM-dd");
};

const hasActiveFilters = computed(() => {
  return (
    (localFilters.value.projectIds &&
      localFilters.value.projectIds.length > 0) ||
    localFilters.value.category ||
    (localFilters.value.createdAfter && localFilters.value.createdBefore)
  );
});

// Function to get the label for the selected time period
const getTimePeriodLabel = () => {
  if (!selectedTimePeriod.value) {
    return "Select time period";
  }
  if (selectedTimePeriod.value === "custom") {
    return `${formatDate(localFilters.value.createdAfter)} to ${formatDate(
      localFilters.value.createdBefore
    )}`;
  } else {
    const option = timePeriodOptions.find(
      (opt) => opt.value === selectedTimePeriod.value
    );
    return option?.label || selectedTimePeriod.value;
  }
};

const getProjectName = (projectId) => {
  const project = projects.value.find((p) => p.id === projectId);
  return project ? project.name : projectId;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return format(date, "MMM d, yyyy");
};

// Function to detect time period from date range
const detectTimePeriod = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return null;

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const now = new Date();

  // Helper function to compare dates (ignoring time)
  const isSameDate = (date1, date2) => {
    return format(date1, "yyyy-MM-dd") === format(date2, "yyyy-MM-dd");
  };

  // Today
  if (
    isSameDate(startDate, startOfDay(now)) &&
    isSameDate(endDate, endOfDay(now))
  ) {
    return "today";
  }

  // Yesterday
  const yesterday = subDays(now, 1);
  if (
    isSameDate(startDate, startOfDay(yesterday)) &&
    isSameDate(endDate, endOfDay(yesterday))
  ) {
    return "yesterday";
  }

  // This Week (Monday to current day)
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  if (
    isSameDate(startDate, thisWeekStart) &&
    isSameDate(endDate, endOfDay(now))
  ) {
    return "this_week";
  }

  // Last Week (Monday to Sunday of previous week)
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  if (
    isSameDate(startDate, lastWeekStart) &&
    isSameDate(endDate, lastWeekEnd)
  ) {
    return "last_week";
  }

  // This Month (1st to current day)
  const thisMonthStart = startOfMonth(now);
  if (
    isSameDate(startDate, thisMonthStart) &&
    isSameDate(endDate, endOfDay(now))
  ) {
    return "this_month";
  }

  // Last Month (1st to last day of previous month)
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  if (
    isSameDate(startDate, lastMonthStart) &&
    isSameDate(endDate, lastMonthEnd)
  ) {
    return "last_month";
  }

  // This Year (Jan 1st to current day)
  const thisYearStart = startOfYear(now);
  if (
    isSameDate(startDate, thisYearStart) &&
    isSameDate(endDate, endOfDay(now))
  ) {
    return "this_year";
  }

  // Last Year (Jan 1st to Dec 31st of previous year)
  const lastYearStart = startOfYear(subYears(now, 1));
  const lastYearEnd = endOfYear(subYears(now, 1));
  if (
    isSameDate(startDate, lastYearStart) &&
    isSameDate(endDate, lastYearEnd)
  ) {
    return "last_year";
  }

  // If no predefined period matches, it's custom
  return "custom";
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
  localFilters.value = {
    projectIds: [],
    category: null,
    createdAfter: "",
    createdBefore: "",
  };

  selectedTimePeriod.value = null;

  emit("reset");
};

// Watch for external filter changes
watch(
  () => props.filters,
  (newFilters) => {
    if (!newFilters) return;

    // Create a copy of the new filters with proper defaults
    const processedFilters = {
      projectIds: newFilters.projectIds || [],
      category: newFilters.category || null,
      createdAfter: newFilters.createdAfter || "",
      createdBefore: newFilters.createdBefore || "",
    };

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

    // Replace localFilters completely instead of merging
    localFilters.value = processedFilters;

    // Try to determine the time period based on the dates
    if (processedFilters.createdAfter && processedFilters.createdBefore) {
      const detectedPeriod = detectTimePeriod(
        processedFilters.createdAfter,
        processedFilters.createdBefore
      );
      selectedTimePeriod.value = detectedPeriod;
    } else {
      selectedTimePeriod.value = null;
    }
  },
  { deep: true, immediate: true }
);
</script>
