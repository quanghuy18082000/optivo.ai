<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">API Pagination Demo</h1>

    <!-- API Response Structure -->
    <div class="mb-8 p-4 bg-gray-100 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">
        Expected API Response Structure:
      </h3>
      <pre class="text-sm bg-white p-3 rounded border overflow-x-auto"><code>{
  "message": "Success",
  "data": [
    { "user_id": 1, "name": "User 1", "email": "user1@example.com" },
    { "user_id": 2, "name": "User 2", "email": "user2@example.com" }
  ],
  "pagination": {
    "page": 1,
    "size": 10,
    "total": 100,
    "total_pages": 10,
    "has_next": true,
    "has_previous": false
  }
}</code></pre>
    </div>

    <!-- Current API Response -->
    <div class="mb-8 p-4 bg-blue-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Current API Response:</h3>
      <pre
        class="text-sm bg-white p-3 rounded border overflow-x-auto"
      ><code>{{ JSON.stringify(currentApiResponse, null, 2) }}</code></pre>
    </div>

    <!-- Controls -->
    <div class="mb-6 flex gap-4 items-center">
      <button
        @click="simulateApiCall(1, 10)"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Simulate API Call (Page 1, Size 10)
      </button>
      <button
        @click="simulateApiCall(2, 10)"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Simulate API Call (Page 2, Size 10)
      </button>
      <button
        @click="simulateApiCall(5, 20)"
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Simulate API Call (Page 5, Size 20)
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div class="px-4 py-3 bg-gray-50 border-b">
        <h3 class="text-lg font-medium">Users Data (from API)</h3>
      </div>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              User ID
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Email
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.user_id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.user_id }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
            >
              {{ user.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ user.email }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination using API data -->
      <Pagination
        :current-page="paginationData.page"
        :total-pages="paginationData.total_pages"
        :total="paginationData.total"
        :page-size="paginationData.size"
        :has-next="paginationData.has_next"
        :has-previous="paginationData.has_previous"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Pagination State -->
    <div class="bg-yellow-50 p-4 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Pagination State (from API):</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div><strong>Current Page:</strong> {{ paginationData.page }}</div>
        <div><strong>Page Size:</strong> {{ paginationData.size }}</div>
        <div><strong>Total Items:</strong> {{ paginationData.total }}</div>
        <div>
          <strong>Total Pages:</strong> {{ paginationData.total_pages }}
        </div>
        <div><strong>Has Next:</strong> {{ paginationData.has_next }}</div>
        <div>
          <strong>Has Previous:</strong> {{ paginationData.has_previous }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Pagination from "@/components/ui/Pagination.vue";

// State
const users = ref([]);
const paginationData = ref({
  page: 1,
  size: 10,
  total: 0,
  total_pages: 1,
  has_next: false,
  has_previous: false,
});
const currentApiResponse = ref(null);

// Simulate API call
const simulateApiCall = async (page, size) => {
  // Simulate loading

  // Generate mock data based on page and size
  const totalUsers = 157; // Total users in "database"
  const startIndex = (page - 1) * size;
  const endIndex = Math.min(startIndex + size, totalUsers);

  const mockUsers = [];
  for (let i = startIndex; i < endIndex; i++) {
    mockUsers.push({
      user_id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
    });
  }

  // Create API response
  const apiResponse = {
    message: "Success",
    data: mockUsers,
    pagination: {
      page: page,
      size: size,
      total: totalUsers,
      total_pages: Math.ceil(totalUsers / size),
      has_next: endIndex < totalUsers,
      has_previous: page > 1,
    },
  };

  // Update state with API response
  currentApiResponse.value = apiResponse;
  users.value = apiResponse.data;
  paginationData.value = apiResponse.pagination;
};

// Handle page change
const handlePageChange = (page) => {
  simulateApiCall(page, paginationData.value.size);
};

// Initial load
simulateApiCall(1, 10);
</script>
