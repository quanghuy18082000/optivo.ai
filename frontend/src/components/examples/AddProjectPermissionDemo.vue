<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-bold mb-4">Add Project Permission Demo</h3>

    <!-- Permission Status -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="font-semibold mb-2">Current Permission Status:</h4>
      <div class="flex items-center space-x-2">
        <span
          class="w-3 h-3 rounded-full"
          :class="canCreateQuotation ? 'bg-green-500' : 'bg-red-500'"
        ></span>
        <span>CREATE_QUOTATION Permission: {{ canCreateQuotation }}</span>
      </div>
    </div>

    <!-- Step Flow Explanation -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Add Project Flow:</h4>
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <span
            class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm"
            >1</span
          >
          <span>Basic Information (Always shown)</span>
        </div>

        <div v-if="canCreateQuotation" class="flex items-center space-x-2">
          <span
            class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm"
            >2</span
          >
          <span>Quotation Input (Shown - User has permission)</span>
        </div>

        <div v-else class="flex items-center space-x-2 opacity-50">
          <span
            class="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm"
            >2</span
          >
          <span class="line-through"
            >Quotation Input (Skipped - No permission)</span
          >
        </div>

        <div class="flex items-center space-x-2">
          <span
            class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm"
          >
            {{ canCreateQuotation ? "3" : "2" }}
          </span>
          <span>Team Allocation (Always shown)</span>
        </div>
      </div>
    </div>

    <!-- Total Steps -->
    <div class="mb-6 p-3 bg-blue-50 rounded">
      <strong>Total Steps:</strong> {{ totalSteps }}
      <span class="text-sm text-gray-600">
        ({{ canCreateQuotation ? "With" : "Without" }} Quotation step)
      </span>
    </div>

    <!-- Features Affected -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Features Affected by Permission:</h4>
      <ul class="space-y-1 text-sm">
        <li class="flex items-center space-x-2">
          <span :class="canCreateQuotation ? 'text-green-600' : 'text-red-600'">
            {{ canCreateQuotation ? "✅" : "❌" }}
          </span>
          <span>Quotation Input Step</span>
        </li>
        <li class="flex items-center space-x-2">
          <span :class="canCreateQuotation ? 'text-green-600' : 'text-red-600'">
            {{ canCreateQuotation ? "✅" : "❌" }}
          </span>
          <span>"Clone Data From Quotation" button in Plan step</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="text-blue-600">ℹ️</span>
          <span>Step indicator shows {{ totalSteps }} steps instead of 3</span>
        </li>
        <li class="flex items-center space-x-2">
          <span class="text-blue-600">ℹ️</span>
          <span>Submit button shows correct step numbers</span>
        </li>
      </ul>
    </div>

    <!-- Test Button -->
    <div class="flex space-x-4">
      <router-link
        to="/projects/add"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Test Add Project Flow
      </router-link>

      <button
        @click="simulatePermissionToggle"
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
      >
        Simulate Permission Toggle (Demo)
      </button>
    </div>

    <!-- Code Example -->
    <div class="mt-6 bg-gray-100 p-4 rounded text-xs">
      <strong>Implementation Highlights:</strong>
      <pre class="mt-2 text-gray-700">
// Dynamic step descriptions
const stepDescriptions = computed(() => {
  const steps = [{ title: "Basic Information", ... }];
  
  if (canCreateQuotation.value) {
    steps.push({ title: "Quotation Input", ... });
  }
  
  steps.push({ title: "Team Allocation", ... });
  return steps;
});

// Dynamic step rendering
&lt;QuotationStep v-if="isQuotationStep" ... /&gt;
&lt;PlanStep v-if="isPlanStep" :canCreateQuotation="canCreateQuotation" ... /&gt;
      </pre>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { usePermissions } from "@/composables/usePermissions.js";

const { hasGlobalPermission, PERMISSIONS } = usePermissions();

// Permission check
const canCreateQuotation = computed(() => {
  return hasGlobalPermission(PERMISSIONS.CREATE_QUOTATION);
});

// Calculate total steps based on permission
const totalSteps = computed(() => {
  return canCreateQuotation.value ? 3 : 2;
});

// Demo function to show how permission affects flow
const simulatePermissionToggle = () => {
  alert(
    `Current permission: ${
      canCreateQuotation.value ? "HAS" : "NO"
    } CREATE_QUOTATION\n\nIn real app, this would be controlled by backend permissions.\n\nTotal steps: ${
      totalSteps.value
    }`
  );
};
</script>
