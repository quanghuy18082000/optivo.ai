<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-bold mb-4">API Request Body Demo</h3>

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

    <!-- API Request Body -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">API Request Body Structure:</h4>

      <!-- With Permission -->
      <div v-if="canCreateQuotation" class="mb-4">
        <div class="flex items-center space-x-2 mb-2">
          <span class="w-3 h-3 bg-green-500 rounded-full"></span>
          <strong class="text-green-700"
            >With CREATE_QUOTATION Permission:</strong
          >
        </div>
        <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{
            JSON.stringify(
              {
                name: "My Project",
                description: "Project description",
                start_date: "2024-01-01",
                end_date: "2024-12-31",
                quotation: [
                  {
                    position_id: "1",
                    quantity: 1,
                    start_date: "2024-01-01",
                    end_date: "2024-12-31",
                  },
                ],
                plan: [
                  {
                    user_id: 1,
                    position_id: "1",
                    allocation_rate: 1,
                    start_date: "2024-01-01",
                    end_date: "2024-12-31",
                  },
                ],
              },
              null,
              2
            )
          }}</pre>
        </div>
      </div>

      <!-- Without Permission -->
      <div v-if="!canCreateQuotation" class="mb-4">
        <div class="flex items-center space-x-2 mb-2">
          <span class="w-3 h-3 bg-red-500 rounded-full"></span>
          <strong class="text-red-700"
            >Without CREATE_QUOTATION Permission:</strong
          >
        </div>
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{
            JSON.stringify(
              {
                name: "My Project",
                description: "Project description",
                start_date: "2024-01-01",
                end_date: "2024-12-31",
                quotation: null,
                plan: [
                  {
                    user_id: 1,
                    position_id: "1",
                    allocation_rate: 1,
                    start_date: "2024-01-01",
                    end_date: "2024-12-31",
                  },
                ],
              },
              null,
              2
            )
          }}</pre>
        </div>
      </div>

      <!-- Comparison -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- With Permission -->
        <div class="p-3 bg-green-50 border border-green-200 rounded">
          <h5 class="font-semibold text-green-800 mb-2">✅ With Permission</h5>
          <div class="text-sm space-y-1">
            <div>
              <code class="bg-green-100 px-1 rounded">quotation: [...]</code>
            </div>
            <div class="text-green-700">• Array of quotation objects</div>
            <div class="text-green-700">
              • Contains position_id, quantity, dates
            </div>
            <div class="text-green-700">• Backend processes quotation data</div>
          </div>
        </div>

        <!-- Without Permission -->
        <div class="p-3 bg-red-50 border border-red-200 rounded">
          <h5 class="font-semibold text-red-800 mb-2">❌ Without Permission</h5>
          <div class="text-sm space-y-1">
            <div>
              <code class="bg-red-100 px-1 rounded">quotation: null</code>
            </div>
            <div class="text-red-700">• Explicitly null value</div>
            <div class="text-red-700">
              • Backend knows no quotation intended
            </div>
            <div class="text-red-700">• Cleaner than empty array</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Implementation Details -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Implementation Logic:</h4>
      <div class="p-4 bg-gray-100 rounded-lg">
        <pre class="text-sm text-gray-700">{{
          `// In AddProjectPage.vue ONLY (EditProjectPage will be handled later)
const projectData = {
  name: formData.value.projectName.trim(),
  description: formData.value.description || "",
  start_date: formData.value.start_date,
  end_date: formData.value.end_date,
  
  quotation: canCreateQuotation.value
    ? formData.value.quotations
        .filter((q) => q.position_id)
        .map((q) => ({
          position_id: q.position_id,
          quantity: parseFloat(q.quantity),
          start_date: q.start_date,
          end_date: q.end_date,
        }))
    : null, // ← Send null if no permission
    
  plan: [...]
};`
        }}</pre>
      </div>
    </div>

    <!-- Backend Benefits -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Backend Benefits:</h4>
      <div class="space-y-2 text-sm">
        <div class="flex items-start space-x-2">
          <span class="text-blue-600 mt-0.5">🎯</span>
          <div>
            <strong>Clear Intent:</strong> <code>null</code> explicitly
            indicates "no quotation data" vs empty array which could mean
            "quotations were cleared"
          </div>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-green-600 mt-0.5">✅</span>
          <div>
            <strong>Type Safety:</strong> Backend can distinguish between "no
            permission" (null) and "empty quotations" ([])
          </div>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-purple-600 mt-0.5">🔧</span>
          <div>
            <strong>Database Logic:</strong> Can handle null values
            appropriately in database operations
          </div>
        </div>
      </div>
    </div>

    <!-- Test Button -->
    <div class="flex space-x-4">
      <router-link
        to="/projects/add"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Test API Request
      </router-link>

      <button
        @click="showRequestExample"
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
      >
        Show Request Example
      </button>
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

// Demo function
const showRequestExample = () => {
  const exampleData = {
    name: "Example Project",
    description: "This is a test project",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    quotation: canCreateQuotation.value
      ? [
          {
            position_id: "1",
            quantity: 1,
            start_date: "2024-01-01",
            end_date: "2024-12-31",
          },
        ]
      : null,
    plan: [
      {
        user_id: 1,
        position_id: "1",
        allocation_rate: 1,
        start_date: "2024-01-01",
        end_date: "2024-12-31",
      },
    ],
  };

  alert(`Request Body Example:\n\n${JSON.stringify(exampleData, null, 2)}`);
};
</script>
