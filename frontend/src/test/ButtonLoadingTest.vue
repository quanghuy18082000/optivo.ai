<template>
  <div class="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
    <h2 class="text-xl font-bold mb-4">Button Loading Test</h2>

    <div class="space-y-4">
      <!-- Test 1: Manual loading state -->
      <div>
        <h3 class="font-semibold mb-2">Test 1: Manual Loading State</h3>
        <Button
          :loading="isManualLoading"
          @click="testManualLoading"
          variant="primary"
        >
          Manual Loading Test
        </Button>
        <p class="text-sm text-gray-600 mt-1">Loading: {{ isManualLoading }}</p>
      </div>

      <!-- Test 2: Async function loading -->
      <div>
        <h3 class="font-semibold mb-2">Test 2: Async Function Loading</h3>
        <Button
          :loading="isAsyncLoading"
          @click="testAsyncLoading"
          variant="secondary"
        >
          Async Loading Test
        </Button>
        <p class="text-sm text-gray-600 mt-1">Loading: {{ isAsyncLoading }}</p>
      </div>

      <!-- Test 3: Computed loading state -->
      <div>
        <h3 class="font-semibold mb-2">Test 3: Computed Loading State</h3>
        <Button
          :loading="computedLoading"
          @click="testComputedLoading"
          variant="danger"
        >
          Computed Loading Test
        </Button>
        <p class="text-sm text-gray-600 mt-1">Loading: {{ computedLoading }}</p>
      </div>

      <!-- Test 4: Form submission simulation -->
      <div>
        <h3 class="font-semibold mb-2">Test 4: Form Submission Simulation</h3>
        <form @submit.prevent="testFormSubmission">
          <Button type="submit" :loading="isFormSubmitting" variant="primary">
            Submit Form
          </Button>
        </form>
        <p class="text-sm text-gray-600 mt-1">
          Form Submitting: {{ isFormSubmitting }}
        </p>
      </div>

      <!-- Test 5: Multiple loading states -->
      <div>
        <h3 class="font-semibold mb-2">Test 5: Multiple Loading States</h3>
        <div class="flex gap-2">
          <Button
            :loading="isLoading1"
            @click="testMultipleLoading(1)"
            size="small"
          >
            Action 1
          </Button>
          <Button
            :loading="isLoading2"
            @click="testMultipleLoading(2)"
            size="small"
          >
            Action 2
          </Button>
          <Button
            :loading="isLoading3"
            @click="testMultipleLoading(3)"
            size="small"
          >
            Action 3
          </Button>
        </div>
        <p class="text-sm text-gray-600 mt-1">
          Loading states: {{ isLoading1 }}, {{ isLoading2 }}, {{ isLoading3 }}
        </p>
      </div>

      <!-- Debug Info -->
      <div class="mt-6 p-4 bg-gray-100 rounded">
        <h3 class="font-semibold mb-2">Debug Info</h3>
        <pre class="text-xs">{{ debugInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import Button from "@/components/ui/Button.vue";

// Test 1: Manual loading state
const isManualLoading = ref(false);

const testManualLoading = () => {
  console.log("Manual loading test started");
  isManualLoading.value = true;

  setTimeout(() => {
    isManualLoading.value = false;
    console.log("Manual loading test completed");
  }, 2000);
};

// Test 2: Async function loading
const isAsyncLoading = ref(false);

const testAsyncLoading = async () => {
  console.log("Async loading test started");
  isAsyncLoading.value = true;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("Async loading test completed");
  } catch (error) {
    console.error("Async loading test failed:", error);
  } finally {
    isAsyncLoading.value = false;
  }
};

// Test 3: Computed loading state
const baseLoading = ref(false);
const computedLoading = computed(() => {
  console.log("Computed loading evaluated:", baseLoading.value);
  return baseLoading.value;
});

const testComputedLoading = () => {
  console.log("Computed loading test started");
  baseLoading.value = true;

  setTimeout(() => {
    baseLoading.value = false;
    console.log("Computed loading test completed");
  }, 2500);
};

// Test 4: Form submission simulation
const isFormSubmitting = ref(false);

const testFormSubmission = async () => {
  console.log("Form submission test started");
  isFormSubmitting.value = true;

  try {
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 4000));
    console.log("Form submission test completed");
  } catch (error) {
    console.error("Form submission test failed:", error);
  } finally {
    isFormSubmitting.value = false;
  }
};

// Test 5: Multiple loading states
const isLoading1 = ref(false);
const isLoading2 = ref(false);
const isLoading3 = ref(false);

const testMultipleLoading = async (buttonNumber) => {
  console.log(`Multiple loading test ${buttonNumber} started`);

  const loadingRef =
    buttonNumber === 1
      ? isLoading1
      : buttonNumber === 2
      ? isLoading2
      : isLoading3;

  loadingRef.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(`Multiple loading test ${buttonNumber} completed`);
  } catch (error) {
    console.error(`Multiple loading test ${buttonNumber} failed:`, error);
  } finally {
    loadingRef.value = false;
  }
};

// Debug info
const debugInfo = computed(() => ({
  isManualLoading: isManualLoading.value,
  isAsyncLoading: isAsyncLoading.value,
  baseLoading: baseLoading.value,
  computedLoading: computedLoading.value,
  isFormSubmitting: isFormSubmitting.value,
  multipleLoading: {
    isLoading1: isLoading1.value,
    isLoading2: isLoading2.value,
    isLoading3: isLoading3.value,
  },
}));
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
