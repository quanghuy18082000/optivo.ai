<template>
  <div class="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">Custom Range Test</h2>

    <div class="space-y-6">
      <!-- Test Controls -->
      <div class="bg-gray-50 p-4 rounded">
        <h3 class="text-lg font-semibold mb-4">Test Custom Range Behavior</h3>

        <!-- Time Period Selector -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <select
            v-model="selectedTimePeriod"
            @change="handleTimePeriodChange"
            class="border rounded px-3 py-2 w-full"
          >
            <option value="">Select time period</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <!-- Custom Date Range (shown only when Custom is selected) -->
        <div v-if="selectedTimePeriod === 'custom'" class="space-y-3">
          <h4 class="font-medium">Custom Date Range</h4>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                v-model="customStartDate"
                @change="handleCustomDateChange"
                class="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                v-model="customEndDate"
                @change="handleCustomDateChange"
                class="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>
        </div>

        <!-- Test Buttons -->
        <div class="flex gap-2 mt-4">
          <button
            @click="testCustomRange"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Custom Range
          </button>
          <button
            @click="resetTest"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Reset
          </button>
          <button
            @click="simulateReopen"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Simulate Reopen
          </button>
        </div>
      </div>

      <!-- Current State Display -->
      <div class="bg-blue-50 p-4 rounded">
        <h3 class="text-lg font-semibold mb-4">Current State</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Selected Period:</strong> {{ selectedTimePeriod || "None" }}
          </div>
          <div>
            <strong>Start Date:</strong> {{ customStartDate || "None" }}
          </div>
          <div><strong>End Date:</strong> {{ customEndDate || "None" }}</div>
          <div>
            <strong>Is Custom Mode:</strong>
            {{ selectedTimePeriod === "custom" ? "Yes" : "No" }}
          </div>
        </div>
      </div>

      <!-- Test Results -->
      <div class="bg-white border rounded p-4">
        <h3 class="text-lg font-semibold mb-4">Test Results</h3>
        <div class="space-y-2">
          <div
            v-for="(result, index) in testResults"
            :key="index"
            class="text-sm p-2 rounded"
            :class="
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            "
          >
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ result.test }}</span>
              <span :class="result.success ? 'text-green-600' : 'text-red-600'">
                {{ result.success ? "✅" : "❌" }}
              </span>
            </div>
            <div class="text-xs text-gray-600 mt-1">
              {{ result.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Info -->
      <div class="bg-gray-100 p-4 rounded">
        <h3 class="text-lg font-semibold mb-4">Debug Info</h3>
        <pre class="text-xs overflow-auto">{{ debugInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";

// Test state
const selectedTimePeriod = ref("");
const customStartDate = ref("");
const customEndDate = ref("");
const testResults = ref([]);

// Saved custom range (simulating the component behavior)
const savedCustomRange = ref({
  from: "",
  to: "",
});

// Flags (simulating the component behavior)
const isUpdatingProgrammatically = ref(false);
const isEditingCustomDates = ref(false);

// Debug info
const debugInfo = computed(() => ({
  selectedTimePeriod: selectedTimePeriod.value,
  customStartDate: customStartDate.value,
  customEndDate: customEndDate.value,
  savedCustomRange: savedCustomRange.value,
  isUpdatingProgrammatically: isUpdatingProgrammatically.value,
  isEditingCustomDates: isEditingCustomDates.value,
}));

// Methods
const handleTimePeriodChange = () => {
  console.log("Time period changed to:", selectedTimePeriod.value);

  if (selectedTimePeriod.value === "custom") {
    // Restore saved custom dates if available
    if (savedCustomRange.value.from && savedCustomRange.value.to) {
      customStartDate.value = savedCustomRange.value.from;
      customEndDate.value = savedCustomRange.value.to;
      console.log("Restored custom dates:", savedCustomRange.value);
    } else {
      // Clear dates
      customStartDate.value = "";
      customEndDate.value = "";
      console.log("No saved custom dates, clearing");
    }
  } else if (selectedTimePeriod.value) {
    // Generate predefined period dates
    const now = new Date();
    let startDate, endDate;

    switch (selectedTimePeriod.value) {
      case "today":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "yesterday":
        startDate = startOfDay(subDays(now, 1));
        endDate = endOfDay(subDays(now, 1));
        break;
      case "this_week":
        startDate = startOfWeek(now, { weekStartsOn: 1 });
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
    }

    if (startDate && endDate) {
      customStartDate.value = format(startDate, "yyyy-MM-dd");
      customEndDate.value = format(endDate, "yyyy-MM-dd");

      // Clear saved custom range for predefined periods
      savedCustomRange.value = { from: "", to: "" };
    }
  }
};

const handleCustomDateChange = () => {
  console.log("Custom date changed:", {
    start: customStartDate.value,
    end: customEndDate.value,
  });

  // Set editing flag
  isEditingCustomDates.value = true;

  // Save custom dates
  if (customStartDate.value && customEndDate.value) {
    savedCustomRange.value.from = customStartDate.value;
    savedCustomRange.value.to = customEndDate.value;
    console.log("Saved custom range:", savedCustomRange.value);
  }

  // Reset flag after delay
  setTimeout(() => {
    isEditingCustomDates.value = false;
  }, 100);
};

const testCustomRange = () => {
  testResults.value = [];

  // Test 1: Select custom range
  selectedTimePeriod.value = "custom";
  const test1Success = selectedTimePeriod.value === "custom";
  testResults.value.push({
    test: "Select Custom Range",
    success: test1Success,
    message: test1Success
      ? "Custom range selected successfully"
      : "Failed to select custom range",
  });

  // Test 2: Set custom dates
  customStartDate.value = "2024-01-01";
  customEndDate.value = "2024-01-31";
  handleCustomDateChange();

  const test2Success =
    savedCustomRange.value.from === "2024-01-01" &&
    savedCustomRange.value.to === "2024-01-31";
  testResults.value.push({
    test: "Set Custom Dates",
    success: test2Success,
    message: test2Success
      ? "Custom dates saved successfully"
      : "Failed to save custom dates",
  });

  // Test 3: Switch to predefined period and back
  selectedTimePeriod.value = "today";
  handleTimePeriodChange();

  selectedTimePeriod.value = "custom";
  handleTimePeriodChange();

  const test3Success =
    customStartDate.value === "2024-01-01" &&
    customEndDate.value === "2024-01-31";
  testResults.value.push({
    test: "Restore Custom Dates",
    success: test3Success,
    message: test3Success
      ? "Custom dates restored successfully"
      : "Failed to restore custom dates",
  });
};

const simulateReopen = () => {
  // Simulate closing and reopening the filter panel
  const currentPeriod = selectedTimePeriod.value;
  const currentStart = customStartDate.value;
  const currentEnd = customEndDate.value;

  // "Close" - clear display state
  selectedTimePeriod.value = "";
  customStartDate.value = "";
  customEndDate.value = "";

  // "Reopen" - restore state
  setTimeout(() => {
    selectedTimePeriod.value = currentPeriod;
    if (currentPeriod === "custom") {
      customStartDate.value = savedCustomRange.value.from || currentStart;
      customEndDate.value = savedCustomRange.value.to || currentEnd;
    } else {
      handleTimePeriodChange();
    }

    const success = selectedTimePeriod.value === currentPeriod;
    testResults.value.push({
      test: "Simulate Reopen",
      success: success,
      message: success
        ? "State restored correctly after reopen"
        : "State not restored correctly",
    });
  }, 500);
};

const resetTest = () => {
  selectedTimePeriod.value = "";
  customStartDate.value = "";
  customEndDate.value = "";
  savedCustomRange.value = { from: "", to: "" };
  testResults.value = [];
  isUpdatingProgrammatically.value = false;
  isEditingCustomDates.value = false;
};

// Watch for changes (simulating component behavior)
watch(
  () => [customStartDate.value, customEndDate.value],
  ([newStart, newEnd], [oldStart, oldEnd]) => {
    if (isUpdatingProgrammatically.value) return;

    if (selectedTimePeriod.value === "custom" && isEditingCustomDates.value) {
      console.log("Skipping detection - user editing custom dates");
      return;
    }

    if (newStart !== oldStart || newEnd !== oldEnd) {
      console.log("Date change detected:", {
        newStart,
        newEnd,
        oldStart,
        oldEnd,
      });
    }
  }
);
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
