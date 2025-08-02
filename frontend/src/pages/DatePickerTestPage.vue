<template>
  <MainLayout>
    <template #header-left>
      <h1 class="text-2xl font-semibold">DatePicker Test</h1>
    </template>

    <div class="p-8 space-y-8 max-w-4xl mx-auto">
      <!-- Default Format Test -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Default Format (yyyy-MM-dd)
        </h2>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Select Date:
          </label>
          <DatePicker
            v-model="defaultFormatDate"
            placeholder="Select date..."
          />
          <div class="bg-gray-50 p-3 rounded text-sm">
            <p>
              <strong>Value:</strong>
              <code>{{ defaultFormatDate || "null" }}</code>
            </p>
            <p>
              <strong>Type:</strong> <code>{{ typeof defaultFormatDate }}</code>
            </p>
            <p>
              <strong>Length:</strong>
              <code>{{ defaultFormatDate?.length || 0 }}</code>
            </p>
            <p>
              <strong>Is Valid Date:</strong>
              <code>{{ isValidDate(defaultFormatDate) }}</code>
            </p>
            <p>
              <strong>Matches ISO:</strong>
              <code>{{ matchesISOFormat(defaultFormatDate) }}</code>
            </p>
          </div>
        </div>
      </div>

      <!-- DD/MM/YYYY Format Test -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          DD/MM/YYYY Format
        </h2>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Select Date:
          </label>
          <DatePicker
            v-model="ddmmyyyyFormatDate"
            placeholder="Select date..."
            date-format="dd/MM/yyyy"
          />
          <div class="bg-gray-50 p-3 rounded text-sm">
            <p>
              <strong>Value:</strong>
              <code>{{ ddmmyyyyFormatDate || "null" }}</code>
            </p>
            <p>
              <strong>Type:</strong>
              <code>{{ typeof ddmmyyyyFormatDate }}</code>
            </p>
            <p>
              <strong>Length:</strong>
              <code>{{ ddmmyyyyFormatDate?.length || 0 }}</code>
            </p>
            <p>
              <strong>Is Valid Date:</strong>
              <code>{{ isValidDate(ddmmyyyyFormatDate) }}</code>
            </p>
            <p>
              <strong>Matches DD/MM/YYYY:</strong>
              <code>{{ matchesDDMMYYYYFormat(ddmmyyyyFormatDate) }}</code>
            </p>
          </div>
        </div>
      </div>

      <!-- Validation Test -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Validation Test
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Test Date (with validation):
            </label>
            <DatePicker
              v-model="validationTestDate"
              placeholder="Select date..."
              :error="hasValidationError"
              :error-message="validationErrorMessage"
            />
            <button
              @click="validateDate"
              class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Validate
            </button>
          </div>
          <div class="bg-gray-50 p-3 rounded text-sm">
            <p><strong>Validation Result:</strong></p>
            <p>
              <strong>Value:</strong>
              <code>{{ validationTestDate || "empty" }}</code>
            </p>
            <p>
              <strong>Is Empty:</strong>
              <code>{{ isEmpty(validationTestDate) }}</code>
            </p>
            <p>
              <strong>Matches ISO:</strong>
              <code>{{ matchesISOFormat(validationTestDate) }}</code>
            </p>
            <p>
              <strong>Matches DD/MM/YYYY:</strong>
              <code>{{ matchesDDMMYYYYFormat(validationTestDate) }}</code>
            </p>
            <p>
              <strong>Error:</strong>
              <code>{{
                hasValidationError ? validationErrorMessage : "None"
              }}</code>
            </p>
          </div>
        </div>
      </div>

      <!-- Pre-filled Test -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Pre-filled Date Test
        </h2>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Pre-filled with today's date:
          </label>
          <DatePicker
            v-model="prefilledDate"
            placeholder="Should show today's date..."
          />
          <div class="bg-gray-50 p-3 rounded text-sm">
            <p>
              <strong>Value:</strong> <code>{{ prefilledDate || "null" }}</code>
            </p>
          </div>
          <div class="space-x-2">
            <button
              @click="resetToToday"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Reset to Today
            </button>
            <button
              @click="clearDate"
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Date
            </button>
          </div>
        </div>
      </div>

      <!-- Project Form Simulation -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          Project Form Simulation
        </h2>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Start Date:
              </label>
              <DatePicker
                v-model="projectStartDate"
                placeholder="Select start date..."
                :error="!!projectErrors.start_date"
                :error-message="projectErrors.start_date"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                End Date:
              </label>
              <DatePicker
                v-model="projectEndDate"
                placeholder="Select end date..."
                :error="!!projectErrors.end_date"
                :error-message="projectErrors.end_date"
              />
            </div>
          </div>
          <button
            @click="validateProjectDates"
            class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Validate Project Dates
          </button>
          <div class="bg-gray-50 p-3 rounded text-sm">
            <p>
              <strong>Start Date:</strong>
              <code>{{ projectStartDate || "empty" }}</code>
            </p>
            <p>
              <strong>End Date:</strong>
              <code>{{ projectEndDate || "empty" }}</code>
            </p>
            <p>
              <strong>Errors:</strong>
              <code>{{ JSON.stringify(projectErrors) }}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import DatePicker from "@/components/ui/DatePicker.vue";

// Test data
const defaultFormatDate = ref("");
const ddmmyyyyFormatDate = ref("");
const validationTestDate = ref("");
const prefilledDate = ref(new Date().toISOString().split("T")[0]);

// Project form simulation
const projectStartDate = ref("");
const projectEndDate = ref("");
const projectErrors = ref({});

// Validation state
const hasValidationError = ref(false);
const validationErrorMessage = ref("");

// Helper functions
const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const isEmpty = (value) => {
  return !value || value.trim() === "";
};

const matchesISOFormat = (value) => {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

const matchesDDMMYYYYFormat = (value) => {
  if (!value) return false;
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
};

const validateDate = () => {
  hasValidationError.value = false;
  validationErrorMessage.value = "";

  if (isEmpty(validationTestDate.value)) {
    hasValidationError.value = true;
    validationErrorMessage.value = "Date is required";
    return;
  }

  const isISOFormat = matchesISOFormat(validationTestDate.value);
  const isDDMMYYYYFormat = matchesDDMMYYYYFormat(validationTestDate.value);
  const dateObj = new Date(validationTestDate.value);

  if (!(isISOFormat || isDDMMYYYYFormat) || isNaN(dateObj.getTime())) {
    hasValidationError.value = true;
    validationErrorMessage.value = "Invalid date format";
    return;
  }

  // Success
  hasValidationError.value = false;
  validationErrorMessage.value = "Valid date!";
};

const validateProjectDates = () => {
  const newErrors = {};

  // Start date validation
  if (!projectStartDate.value || projectStartDate.value.trim() === "") {
    newErrors.start_date = "Start date is required";
  } else {
    const isISOFormat = /^\d{4}-\d{2}-\d{2}$/.test(projectStartDate.value);
    const isDDMMYYYYFormat = /^\d{2}\/\d{2}\/\d{4}$/.test(
      projectStartDate.value
    );
    const dateObj = new Date(projectStartDate.value);

    if (!(isISOFormat || isDDMMYYYYFormat) || isNaN(dateObj.getTime())) {
      newErrors.start_date = "Invalid date format";
    }
  }

  // End date validation
  if (!projectEndDate.value || projectEndDate.value.trim() === "") {
    newErrors.end_date = "End date is required";
  } else {
    const isISOFormat = /^\d{4}-\d{2}-\d{2}$/.test(projectEndDate.value);
    const isDDMMYYYYFormat = /^\d{2}\/\d{2}\/\d{4}$/.test(projectEndDate.value);
    const dateObj = new Date(projectEndDate.value);

    if (!(isISOFormat || isDDMMYYYYFormat) || isNaN(dateObj.getTime())) {
      newErrors.end_date = "Invalid date format";
    }
  }

  // Date comparison
  if (
    projectStartDate.value &&
    projectEndDate.value &&
    !newErrors.start_date &&
    !newErrors.end_date
  ) {
    const startDate = new Date(projectStartDate.value);
    const endDate = new Date(projectEndDate.value);

    if (startDate >= endDate) {
      newErrors.end_date = "End date must be after start date";
    }
  }

  projectErrors.value = newErrors;
};

const resetToToday = () => {
  prefilledDate.value = new Date().toISOString().split("T")[0];
};

const clearDate = () => {
  prefilledDate.value = "";
};
</script>
