<template>
  <div class="p-8 space-y-8">
    <h1 class="text-2xl font-bold text-gray-900">Assign Roles Demo</h1>

    <!-- Assign Roles Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">
        Assign Roles to User
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select User
          </label>
          <Select
            v-model="selectedUserId"
            :options="userOptions"
            placeholder="Choose a user"
            searchable
            search-placeholder="Search users..."
          />
          <p class="text-sm text-gray-500 mt-1">
            Selected User ID: {{ selectedUserId }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select Roles
          </label>
          <MultiSelect
            v-model="selectedRoleIds"
            :options="roleOptions"
            placeholder="Choose roles"
            searchable
            search-placeholder="Search roles..."
            show-select-all
          />
          <p class="text-sm text-gray-500 mt-1">
            Selected Role IDs: {{ selectedRoleIds }}
          </p>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          @click="assignRoles"
          :disabled="
            !selectedUserId || selectedRoleIds.length === 0 || assigning
          "
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            v-if="assigning"
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
          {{ assigning ? "Assigning..." : "Assign Roles" }}
        </button>
      </div>
    </div>

    <!-- API Response Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">API Response</h3>
      <div class="bg-gray-100 rounded-md p-4">
        <pre class="text-sm text-gray-800">{{
          apiResponse || "No API calls made yet"
        }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Select from "./Select.vue";
import MultiSelect from "./MultiSelect.vue";
import { assignRolesToUser } from "@/services/roleService";

// Mock data
const userOptions = [
  { label: "John Doe", value: 1 },
  { label: "Jane Smith", value: 2 },
  { label: "Bob Johnson", value: 3 },
  { label: "Alice Brown", value: 4 },
  { label: "Charlie Wilson", value: 5 },
];

const roleOptions = [
  { label: "Admin", value: 1 },
  { label: "Manager", value: 2 },
  { label: "Developer", value: 3 },
  { label: "Designer", value: 4 },
  { label: "Tester", value: 5 },
  { label: "Support", value: 6 },
];

// State
const selectedUserId = ref("");
const selectedRoleIds = ref([]);
const assigning = ref(false);
const apiResponse = ref("");

// Mock assignments
const assignments = ref([
  {
    userId: 1,
    userName: "John Doe",
    roles: [
      { id: 1, name: "Admin" },
      { id: 2, name: "Manager" },
    ],
  },
  {
    userId: 2,
    userName: "Jane Smith",
    roles: [{ id: 3, name: "Developer" }],
  },
]);

// Methods
const assignRoles = async () => {
  try {
    assigning.value = true;

    // Call the actual API
    const response = await assignRolesToUser(
      selectedUserId.value,
      selectedRoleIds.value
    );

    apiResponse.value = JSON.stringify(response, null, 2);

    // Find user and roles for display
    const user = userOptions.find((u) => u.value === selectedUserId.value);
    const selectedRoles = roleOptions.filter((role) =>
      selectedRoleIds.value.includes(role.value)
    );

    // Update mock assignments
    const existingAssignment = assignments.value.find(
      (a) => a.userId === selectedUserId.value
    );
    if (existingAssignment) {
      // Add new roles to existing assignment
      selectedRoles.forEach((role) => {
        if (!existingAssignment.roles.find((r) => r.id === role.value)) {
          existingAssignment.roles.push({ id: role.value, name: role.label });
        }
      });
    } else {
      // Create new assignment
      assignments.value.push({
        userId: selectedUserId.value,
        userName: user.label,
        roles: selectedRoles.map((role) => ({
          id: role.value,
          name: role.label,
        })),
      });
    }

    // Clear selections
    selectedUserId.value = "";
    selectedRoleIds.value = [];

    alert(
      `Successfully assigned ${selectedRoles.length} role(s) to ${user.label}`
    );
  } catch (error) {
    console.error("Error assigning roles:", error);
    apiResponse.value = JSON.stringify({ error: error.message }, null, 2);
    alert("Failed to assign roles: " + error.message);
  } finally {
    assigning.value = false;
  }
};

const removeAssignment = (assignment) => {
  const index = assignments.value.findIndex(
    (a) => a.userId === assignment.userId
  );
  if (index > -1) {
    assignments.value.splice(index, 1);
    alert(`Removed assignment for ${assignment.userName}`);
  }
};
</script>
