<template>
  <div class="p-8 space-y-8">
    <h1 class="text-2xl font-bold text-gray-900">User Search API Demo</h1>

    <!-- Search Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">
        Search Users via API
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Search Query
          </label>
          <div class="flex gap-4">
            <Input
              v-model="searchQuery"
              placeholder="Search users by name, email..."
              class="flex-1"
              @keydown.enter="searchUsers"
            />
            <button
              @click="searchUsers"
              :disabled="searching"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                v-if="searching"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ searching ? "Searching..." : "Search" }}
            </button>
            <button
              @click="clearSearch"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div class="text-sm text-gray-600">
          <p><strong>Current search:</strong> {{ searchQuery || "None" }}</p>
          <p><strong>Results found:</strong> {{ users.length }} users</p>
          <p>
            <strong>API endpoint:</strong> GET /users?search={{
              searchQuery || "{query}"
            }}&page={{ currentPage }}&size={{ pageSize }}
          </p>
        </div>
      </div>
    </div>

    <!-- API Response Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">API Response</h3>
      <div class="bg-gray-100 rounded-md p-4 max-h-64 overflow-y-auto">
        <pre class="text-sm text-gray-800">{{
          apiResponse || "No API calls made yet"
        }}</pre>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Search Results</h3>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Department
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div
                      class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium"
                    >
                      {{ getInitials(user.name) }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.department }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                  :class="
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  "
                >
                  {{ user.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.length === 0 && !searching" class="text-center py-8">
          <div class="text-gray-500 text-sm">
            {{
              searchQuery
                ? "No users found for your search"
                : "Enter a search query to find users"
            }}
          </div>
        </div>

        <div v-if="searching" class="text-center py-8">
          <div class="text-gray-500 text-sm">Searching...</div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && users.length > 0"
        class="mt-6 flex items-center justify-between"
      >
        <div class="text-sm text-gray-700">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to
          {{ Math.min(currentPage * pageSize, pagination.total) }} of
          {{ pagination.total }} results
        </div>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="!pagination.has_previous || searching"
            class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span class="px-3 py-1 text-sm">
            Page {{ currentPage }} of {{ pagination.total_pages }}
          </span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="!pagination.has_next || searching"
            class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Input from "./Input.vue";
import { getUsers } from "@/services/userService";

// State
const searchQuery = ref("");
const searching = ref(false);
const users = ref([]);
const apiResponse = ref("");
const pagination = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);

// Methods
const searchUsers = async (page = 1) => {
  try {
    searching.value = true;
    currentPage.value = page;

    const params = {
      page: currentPage.value,
      size: pageSize.value,
      ...(searchQuery.value && { search: searchQuery.value }),
    };

    console.log("Searching users with params:", params);

    const response = await getUsers(params);

    apiResponse.value = JSON.stringify(response, null, 2);

    if (response.data) {
      // Transform API data and add mock data for missing fields
      users.value = response.data.map((user, index) => ({
        ...user,
        role: ["Admin", "Manager", "Developer", "QA", "Designer"][index % 5],
        department: ["IT", "Sales", "Marketing", "Design", "HR"][index % 5],
        status: index % 3 === 0 ? "inactive" : "active",
      }));
    }

    if (response.pagination) {
      pagination.value = response.pagination;
    }
  } catch (error) {
    console.error("Error searching users:", error);
    apiResponse.value = JSON.stringify({ error: error.message }, null, 2);

    // Fallback to mock data for demo
    const mockUsers = Array.from({ length: 5 }, (_, index) => ({
      id: index + 1,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      role: ["Admin", "Manager", "Developer", "QA", "Designer"][index % 5],
      department: ["IT", "Sales", "Marketing", "Design", "HR"][index % 5],
      status: index % 3 === 0 ? "inactive" : "active",
    }));

    // Filter mock data based on search query
    if (searchQuery.value) {
      const filtered = mockUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
      users.value = filtered;
    } else {
      users.value = mockUsers;
    }

    // Mock pagination
    pagination.value = {
      page: currentPage.value,
      size: pageSize.value,
      total: users.value.length,
      total_pages: Math.ceil(users.value.length / pageSize.value),
      has_next: false,
      has_previous: false,
    };
  } finally {
    searching.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  users.value = [];
  apiResponse.value = "";
  pagination.value = null;
  currentPage.value = 1;
};

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value?.total_pages) {
    searchUsers(page);
  }
};

const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};
</script>
