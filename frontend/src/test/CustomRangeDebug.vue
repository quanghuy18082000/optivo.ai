<template>
  <div class="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">Custom Range Debug</h2>

    <div class="space-y-6">
      <!-- Test Select Component -->
      <div class="bg-gray-50 p-4 rounded">
        <h3 class="text-lg font-semibold mb-4">Test Custom Range Selection</h3>

        <!-- Time Period Selector -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <Select
            v-model="selectedTimePeriod"
            :options="timePeriodOptions"
            placeholder="Select time period"
            searchable
            search-placeholder="Search time periods..."
            @change="handleSelectChange"
          />
        </div>

        <!-- Current State Display -->
        <div class="bg-blue-50 p-3 rounded mb-4">
          <h4 class="font-medium mb-2">Current State</h4>
          <div class="text-sm space-y-1">
            <div>
              <strong>selectedTimePeriod:</strong>
              {{ selectedTimePeriod || "null" }}
            </div>
            <div>
              <strong>Is Custom Mode:</strong>
              {{ selectedTimePeriod === "custom" ? "Yes" : "No" }}
            </div>
          </div>
        </div>

        <!-- Custom Date Range (shown only when Custom is selected) -->
        <div
          v-if="selectedTimePeriod === 'custom'"
          class="mt-4 p-3 bg-green-50 rounded"
        >
          <h4 class="font-medium mb-2">✅ Custom Date Range (Visible!)</h4>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                v-model="customStartDate"
                class="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                v-model="customEndDate"
                class="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>
        </div>

        <div v-else class="mt-4 p-3 bg-red-50 rounded">
          <h4 class="font-medium text-red-700">
            ❌ Custom Date Range (Hidden)
          </h4>
          <p class="text-sm text-red-600">selectedTimePeriod is not 'custom'</p>
        </div>
      </div>

      <!-- Event Log -->
      <div class="bg-white border rounded p-4 max-h-64 overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Event Log</h3>
          <button
            @click="clearLog"
            class="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        <div class="space-y-1">
          <div
            v-for="(event, index) in eventLog"
            :key="index"
            class="text-sm p-2 rounded bg-gray-50"
          >
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ event.type }}</span>
              <span class="text-xs text-gray-500">{{ event.timestamp }}</span>
            </div>
            <div class="text-xs text-gray-600 mt-1">
              {{ event.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Test Buttons -->
      <div class="flex gap-2">
        <button
          @click="testCustomSelection"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Custom Selection
        </button>
        <button
          @click="resetState"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Reset State
        </button>
        <button
          @click="forceCustom"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Force Custom
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import Select from "@/components/ui/Select.vue";

// Test state
const selectedTimePeriod = ref("");
const customStartDate = ref("");
const customEndDate = ref("");
const eventLog = ref([]);

// Time period options
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

// Methods
const addEvent = (type, message) => {
  eventLog.value.unshift({
    type,
    message,
    timestamp: new Date().toLocaleTimeString(),
  });

  // Keep only last 20 events
  if (eventLog.value.length > 20) {
    eventLog.value = eventLog.value.slice(0, 20);
  }
};

const handleSelectChange = (option) => {
  addEvent("SELECT_CHANGE", `User selected: ${option.value}`);
  console.log("handleSelectChange called with:", option);
  console.log("selectedTimePeriod before:", selectedTimePeriod.value);

  // Use nextTick to check if v-model updated
  nextTick(() => {
    console.log("selectedTimePeriod after nextTick:", selectedTimePeriod.value);
    addEvent(
      "AFTER_NEXTTICK",
      `selectedTimePeriod is now: ${selectedTimePeriod.value}`
    );

    if (selectedTimePeriod.value === "custom") {
      addEvent("CUSTOM_MODE_SUCCESS", "Custom mode activated successfully!");
    } else {
      addEvent(
        "CUSTOM_MODE_FAILED",
        `Expected 'custom', got '${selectedTimePeriod.value}'`
      );
    }
  });
};

const testCustomSelection = () => {
  addEvent("TEST_START", "Testing custom selection programmatically");

  // Try to select custom programmatically
  selectedTimePeriod.value = "custom";

  nextTick(() => {
    addEvent(
      "TEST_RESULT",
      `Programmatic set result: ${selectedTimePeriod.value}`
    );
  });
};

const forceCustom = () => {
  addEvent("FORCE_CUSTOM", "Forcing custom mode");
  selectedTimePeriod.value = "custom";
};

const clearLog = () => {
  eventLog.value = [];
};

const resetState = () => {
  selectedTimePeriod.value = "";
  customStartDate.value = "";
  customEndDate.value = "";
  eventLog.value = [];
  addEvent("RESET", "State reset");
};

// Watch selectedTimePeriod
watch(
  () => selectedTimePeriod.value,
  (newValue, oldValue) => {
    addEvent(
      "WATCH_TRIGGER",
      `selectedTimePeriod changed from "${oldValue}" to "${newValue}"`
    );
    console.log("selectedTimePeriod watch triggered:", { newValue, oldValue });
  }
);

// Initialize
addEvent("INIT", "Component initialized");
</script>

<style scoped>
/* Add any custom styles here */
</style>
