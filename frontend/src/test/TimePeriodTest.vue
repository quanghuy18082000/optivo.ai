<template>
  <div class="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">Time Period Detection Test</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Test Controls -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">Test Controls</h3>

        <!-- Manual Date Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Test Date Range
          </label>
          <div class="flex gap-2">
            <input
              type="date"
              v-model="testStartDate"
              class="border rounded px-3 py-2"
              placeholder="Start Date"
            />
            <input
              type="date"
              v-model="testEndDate"
              class="border rounded px-3 py-2"
              placeholder="End Date"
            />
            <button
              @click="testDetection"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test
            </button>
          </div>
        </div>

        <!-- Predefined Period Tests -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Test Predefined Periods
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="period in testPeriods"
              :key="period.value"
              @click="testPredefinedPeriod(period.value)"
              class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm"
            >
              {{ period.label }}
            </button>
          </div>
        </div>

        <!-- Current Time Info -->
        <div class="bg-gray-50 p-4 rounded">
          <h4 class="font-semibold mb-2">Current Time Info</h4>
          <div class="text-sm space-y-1">
            <div>Now: {{ formatDateTime(now) }}</div>
            <div>Today: {{ formatDate(now) }}</div>
            <div>This Week Start: {{ formatDate(thisWeekStart) }}</div>
            <div>This Month Start: {{ formatDate(thisMonthStart) }}</div>
          </div>
        </div>
      </div>

      <!-- Test Results -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">Test Results</h3>

        <div class="bg-blue-50 p-4 rounded">
          <h4 class="font-semibold mb-2">Detection Result</h4>
          <div class="text-sm space-y-1">
            <div>
              <strong>Detected Period:</strong> {{ detectedPeriod || "None" }}
            </div>
            <div>
              <strong>Expected Period:</strong> {{ expectedPeriod || "None" }}
            </div>
            <div>
              <strong>Match:</strong>
              <span :class="isMatch ? 'text-green-600' : 'text-red-600'">
                {{ isMatch ? "✅ Correct" : "❌ Incorrect" }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 p-4 rounded">
          <h4 class="font-semibold mb-2">Date Range Details</h4>
          <div class="text-sm space-y-1">
            <div><strong>Start Date:</strong> {{ testStartDate }}</div>
            <div><strong>End Date:</strong> {{ testEndDate }}</div>
            <div>
              <strong>Start DateTime:</strong>
              {{ formatDateTime(new Date(testStartDate + "T00:00:00")) }}
            </div>
            <div>
              <strong>End DateTime:</strong>
              {{ formatDateTime(new Date(testEndDate + "T23:59:59")) }}
            </div>
          </div>
        </div>

        <!-- Test History -->
        <div class="bg-white border rounded p-4 max-h-64 overflow-y-auto">
          <h4 class="font-semibold mb-2">Test History</h4>
          <div class="space-y-2">
            <div
              v-for="(test, index) in testHistory"
              :key="index"
              class="text-sm p-2 rounded"
              :class="
                test.isMatch
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              "
            >
              <div class="flex justify-between items-center">
                <span class="font-medium">{{ test.expected }}</span>
                <span :class="test.isMatch ? 'text-green-600' : 'text-red-600'">
                  {{ test.isMatch ? "✅" : "❌" }}
                </span>
              </div>
              <div class="text-xs text-gray-600">
                {{ test.startDate }} → {{ test.endDate }}
              </div>
              <div class="text-xs text-gray-500">
                Detected: {{ test.detected }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Auto Test All -->
    <div class="mt-6 pt-6 border-t">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Automated Tests</h3>
        <button
          @click="runAllTests"
          class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Run All Tests
        </button>
      </div>

      <div v-if="autoTestResults.length > 0" class="mt-4">
        <div class="text-sm text-gray-600 mb-2">
          Results: {{ autoTestResults.filter((r) => r.isMatch).length }}/{{
            autoTestResults.length
          }}
          passed
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <div
            v-for="(result, index) in autoTestResults"
            :key="index"
            class="text-xs p-2 rounded border"
            :class="
              result.isMatch
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            "
          >
            <div class="font-medium">{{ result.expected }}</div>
            <div class="text-gray-600">{{ result.detected }}</div>
            <div class="text-gray-500">
              {{ result.startDate }} → {{ result.endDate }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
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

// Test state
const testStartDate = ref("");
const testEndDate = ref("");
const detectedPeriod = ref("");
const expectedPeriod = ref("");
const testHistory = ref([]);
const autoTestResults = ref([]);

// Current time references
const now = new Date();
const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
const thisMonthStart = startOfMonth(now);

// Test periods
const testPeriods = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "Last Week", value: "last_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "this_year" },
  { label: "Last Year", value: "last_year" },
];

// Computed
const isMatch = computed(() => {
  return detectedPeriod.value === expectedPeriod.value;
});

// Detection function (copied from WorklogFilters.vue)
const detectTimePeriod = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return null;

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const now = new Date();

  // Helper function to compare dates (ignoring time)
  const isSameDate = (date1, date2) => {
    return format(date1, "yyyy-MM-dd") === format(date2, "yyyy-MM-dd");
  };

  // Helper function to check if end date is end of day
  const isEndOfDay = (date) => {
    return (
      date.getHours() === 23 &&
      date.getMinutes() === 59 &&
      date.getSeconds() === 59
    );
  };

  // Today
  if (
    isSameDate(startDate, startOfDay(now)) &&
    (isSameDate(endDate, endOfDay(now)) || isEndOfDay(endDate))
  ) {
    return "today";
  }

  // Yesterday
  const yesterday = subDays(now, 1);
  if (
    isSameDate(startDate, startOfDay(yesterday)) &&
    (isSameDate(endDate, endOfDay(yesterday)) || isEndOfDay(endDate))
  ) {
    return "yesterday";
  }

  // This Week (Monday to current day)
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  if (
    isSameDate(startDate, thisWeekStart) &&
    (isSameDate(endDate, endOfDay(now)) || isEndOfDay(endDate))
  ) {
    return "this_week";
  }

  // Last Week (Monday to Sunday of previous week)
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  if (
    isSameDate(startDate, lastWeekStart) &&
    (isSameDate(endDate, lastWeekEnd) || isEndOfDay(endDate))
  ) {
    return "last_week";
  }

  // This Month (1st to current day)
  const thisMonthStart = startOfMonth(now);
  if (
    isSameDate(startDate, thisMonthStart) &&
    (isSameDate(endDate, endOfDay(now)) || isEndOfDay(endDate))
  ) {
    return "this_month";
  }

  // Last Month (1st to last day of previous month)
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  if (
    isSameDate(startDate, lastMonthStart) &&
    (isSameDate(endDate, lastMonthEnd) || isEndOfDay(endDate))
  ) {
    return "last_month";
  }

  // This Year (Jan 1st to current day)
  const thisYearStart = startOfYear(now);
  if (
    isSameDate(startDate, thisYearStart) &&
    (isSameDate(endDate, endOfDay(now)) || isEndOfDay(endDate))
  ) {
    return "this_year";
  }

  // Last Year (Jan 1st to Dec 31st of previous year)
  const lastYearStart = startOfYear(subYears(now, 1));
  const lastYearEnd = endOfYear(subYears(now, 1));
  if (
    isSameDate(startDate, lastYearStart) &&
    (isSameDate(endDate, lastYearEnd) || isEndOfDay(endDate))
  ) {
    return "last_year";
  }

  // If no predefined period matches, it's custom
  return "custom";
};

// Methods
const formatDate = (date) => {
  return format(date, "yyyy-MM-dd");
};

const formatDateTime = (date) => {
  return format(date, "yyyy-MM-dd HH:mm:ss");
};

const testDetection = () => {
  if (!testStartDate.value || !testEndDate.value) {
    alert("Please select both start and end dates");
    return;
  }

  const detected = detectTimePeriod(testStartDate.value, testEndDate.value);
  detectedPeriod.value = detected;

  // Add to history
  testHistory.value.unshift({
    startDate: testStartDate.value,
    endDate: testEndDate.value,
    detected: detected,
    expected: expectedPeriod.value,
    isMatch: detected === expectedPeriod.value,
  });

  // Keep only last 10 tests
  if (testHistory.value.length > 10) {
    testHistory.value = testHistory.value.slice(0, 10);
  }
};

const testPredefinedPeriod = (period) => {
  expectedPeriod.value = period;

  // Generate the expected date range for this period
  const now = new Date();
  let startDate, endDate;

  switch (period) {
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
    case "this_year":
      startDate = startOfYear(now);
      endDate = endOfDay(now);
      break;
    case "last_year":
      startDate = startOfYear(subYears(now, 1));
      endDate = endOfYear(subYears(now, 1));
      break;
  }

  testStartDate.value = format(startDate, "yyyy-MM-dd");
  testEndDate.value = format(endDate, "yyyy-MM-dd");

  // Auto test
  testDetection();
};

const runAllTests = () => {
  autoTestResults.value = [];

  testPeriods.forEach((period) => {
    const now = new Date();
    let startDate, endDate;

    switch (period.value) {
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
      case "this_year":
        startDate = startOfYear(now);
        endDate = endOfDay(now);
        break;
      case "last_year":
        startDate = startOfYear(subYears(now, 1));
        endDate = endOfYear(subYears(now, 1));
        break;
    }

    const startDateStr = format(startDate, "yyyy-MM-dd");
    const endDateStr = format(endDate, "yyyy-MM-dd");
    const detected = detectTimePeriod(startDateStr, endDateStr);

    autoTestResults.value.push({
      expected: period.value,
      detected: detected,
      startDate: startDateStr,
      endDate: endDateStr,
      isMatch: detected === period.value,
    });
  });
};

// Initialize
onMounted(() => {
  // Set today as default
  testStartDate.value = format(now, "yyyy-MM-dd");
  testEndDate.value = format(now, "yyyy-MM-dd");
});
</script>

<style scoped>
.grid {
  gap: 1rem;
}
</style>
