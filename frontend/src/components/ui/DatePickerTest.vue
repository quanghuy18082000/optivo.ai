<template>
  <div class="p-8 space-y-8 max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">DatePicker Test</h1>
    
    <div class="space-y-6">
      <!-- Default Format Test -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Default Format (yyyy-MM-dd)</h2>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Select Date:
          </label>
          <DatePicker
            v-model="defaultFormatDate"
            placeholder="Select date..."
          />
          <p class="text-sm text-gray-600">
            Value: <code class="bg-gray-100 px-2 py-1 rounded">{{ defaultFormatDate || 'null' }}</code>
          </p>
          <p class="text-sm text-gray-600">
            Type: <code class="bg-gray-100 px-2 py-1 rounded">{{ typeof defaultFormatDate }}</code>
          </p>
          <p class="text-sm text-gray-600">
            Length: <code class="bg-gray-100 px-2 py-1 rounded">{{ defaultFormatDate?.length || 0 }}</code>
          </p>
          <p class="text-sm text-gray-600">
            Is Valid Date: <code class="bg-gray-100 px-2 py-1 rounded">{{ isValidDate(defaultFormatDate) }}</code>
          </p>
        </div>
      </div>

      <!-- DD/MM/YYYY Format Test -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">DD/MM/YYYY Format</h2>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Select Date:
          </label>
          <DatePicker
            v-model="ddmmyyyyFormatDate"
            placeholder="Select date..."
            date-format="dd/MM/yyyy"
          />
          <p class="text-sm text-gray-600">
            Value: <code class="bg-gray-100 px-2 py-1 rounded">{{ ddmmyyyyFormatDate || 'null' }}</code>
          </p>
          <p class="text-sm text-gray-600">
            Type: <code class="bg-gray-100 px-2 py-1 rounded">{{ typeof ddmmyyyyFormatDate }}</code>
          </p>
          <p class="text-sm text-gray-600">
            Length: <code class="bg-gray-100 px-2 py-1 rounded">{{ ddmmyyyyFormatDate?.length || 0 }}</code>
          </p>
          <p class="text-sm text-gray-600">
            Is Valid Date: <code class="bg-gray-100 px-2 py-1 rounded">{{ isValidDate(ddmmyyyyFormatDate) }}</code>
          </p>
        </div>
      </div>

      <!-- Validation Test -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Validation Test</h2>
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
          <div class="bg-gray-50 p-3 rounded">
            <p class="text-sm">
              <strong>Validation Result:</strong>
            </p>
            <p class="text-sm text-gray-600">
              Value: <code class="bg-white px-2 py-1 rounded">{{ validationTestDate || 'empty' }}</code>
            </p>
            <p class="text-sm text-gray-600">
              Is Empty: <code class="bg-white px-2 py-1 rounded">{{ isEmpty(validationTestDate) }}</code>
            </p>
            <p class="text-sm text-gray-600">
              Matches ISO Format: <code class="bg-white px-2 py-1 rounded">{{ matchesISOFormat(validationTestDate) }}</code>
            </p>
            <p class="text-sm text-gray-600">
              Matches DD/MM/YYYY Format: <code class="bg-white px-2 py-1 rounded">{{ matchesDDMMYYYYFormat(validationTestDate) }}</code>
            </p>
          </div>
        </div>
      </div>

      <!-- Pre-filled Test -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Pre-filled Date Test</h2>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Pre-filled with today's date:
          </label>
          <DatePicker
            v-model="prefilledDate"
            placeholder="Should show today's date..."
          />
          <p class="text-sm text-gray-600">
            Value: <code class="bg-gray-100 px-2 py-1 rounded">{{ prefilledDate || 'null' }}</code>
          </p>
          <button
            @click="resetToToday"
            class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Reset to Today
          </button>
          <button
            @click="clearDate"
            class="mt-2 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Date
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DatePicker from './DatePicker.vue'

// Test data
const defaultFormatDate = ref('')
const ddmmyyyyFormatDate = ref('')
const validationTestDate = ref('')
const prefilledDate = ref(new Date().toISOString().split('T')[0])

// Validation state
const hasValidationError = ref(false)
const validationErrorMessage = ref('')

// Helper functions
const isValidDate = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

const isEmpty = (value) => {
  return !value || value.trim() === ''
}

const matchesISOFormat = (value) => {
  if (!value) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

const matchesDDMMYYYYFormat = (value) => {
  if (!value) return false
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value)
}

const validateDate = () => {
  hasValidationError.value = false
  validationErrorMessage.value = ''
  
  if (isEmpty(validationTestDate.value)) {
    hasValidationError.value = true
    validationErrorMessage.value = 'Date is required'
    return
  }
  
  const isISOFormat = matchesISOFormat(validationTestDate.value)
  const isDDMMYYYYFormat = matchesDDMMYYYYFormat(validationTestDate.value)
  const dateObj = new Date(validationTestDate.value)
  
  if (!(isISOFormat || isDDMMYYYYFormat) || isNaN(dateObj.getTime())) {
    hasValidationError.value = true
    validationErrorMessage.value = 'Invalid date format'
    return
  }
  
  // Success
  hasValidationError.value = false
  validationErrorMessage.value = 'Valid date!'
}

const resetToToday = () => {
  prefilledDate.value = new Date().toISOString().split('T')[0]
}

const clearDate = () => {
  prefilledDate.value = ''
}
</script>
</template>

<script setup>
import { ref } from 'vue'
import DatePicker from './DatePicker.vue'

// Test data
const defaultFormatDate = ref('')
const ddmmyyyyFormatDate = ref('')
const validationTestDate = ref('')
const prefilledDate = ref(new Date().toISOString().split('T')[0])

// Validation state
const hasValidationError = ref(false)
const validationErrorMessage = ref('')

// Helper functions
const isValidDate = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

const isEmpty = (value) => {
  return !value || value.trim() === ''
}

const matchesISOFormat = (value) => {
  if (!value) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

const matchesDDMMYYYYFormat = (value) => {
  if (!value) return false
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value)
}

const validateDate = () => {
  hasValidationError.value = false
  validationErrorMessage.value = ''
  
  if (isEmpty(validationTestDate.value)) {
    hasValidationError.value = true
    validationErrorMessage.value = 'Date is required'
    return
  }
  
  const isISOFormat = matchesISOFormat(validationTestDate.value)
  const isDDMMYYYYFormat = matchesDDMMYYYYFormat(validationTestDate.value)
  const dateObj = new Date(validationTestDate.value)
  
  if (!(isISOFormat || isDDMMYYYYFormat) || isNaN(dateObj.getTime())) {
    hasValidationError.value = true
    validationErrorMessage.value = 'Invalid date format'
    return
  }
  
  // Success
  hasValidationError.value = false
  validationErrorMessage.value = 'Valid date!'
}

const resetToToday = () => {
  prefilledDate.value = new Date().toISOString().split('T')[0]
}

const clearDate = () => {
  prefilledDate.value = ''
}
</script>