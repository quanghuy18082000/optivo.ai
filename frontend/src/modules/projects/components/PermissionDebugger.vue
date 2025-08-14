<template>
  <div class="bg-gray-100 p-4 rounded-lg mb-4" v-if="showDebug">
    <h3 class="text-lg font-semibold mb-3">🔍 Permission Debug Info</h3>

    <!-- Route Info -->
    <div class="mb-3">
      <h4 class="font-medium text-gray-700">Route Information:</h4>
      <div class="text-sm text-gray-600">
        <p>
          Project ID: <code>{{ projectId }}</code> ({{ typeof projectId }})
        </p>
        <p>
          Route Params: <code>{{ JSON.stringify(route.params) }}</code>
        </p>
        <p>
          Full Path: <code>{{ route.fullPath }}</code>
        </p>
      </div>
    </div>

    <!-- Auth Info -->
    <div class="mb-3">
      <h4 class="font-medium text-gray-700">Auth Information:</h4>
      <div class="text-sm text-gray-600">
        <p>
          User ID: <code>{{ authStore.user?.id }}</code> ({{
            typeof authStore.user?.id
          }})
        </p>
        <p>
          User Name: <code>{{ authStore.user?.name }}</code>
        </p>
        <p>
          Is Logged In: <code>{{ !!authStore.user?.id }}</code>
        </p>
      </div>
    </div>

    <!-- Permission State -->
    <div class="mb-3">
      <h4 class="font-medium text-gray-700">Permission State:</h4>
      <div class="text-sm text-gray-600">
        <p>
          Loading: <code>{{ isLoadingPermissions }}</code>
        </p>
        <p>
          Error: <code>{{ permissionError || "None" }}</code>
        </p>
        <p>
          Permissions Count: <code>{{ userPermissions?.length || 0 }}</code>
        </p>
        <p>
          Roles Count: <code>{{ userRoles?.length || 0 }}</code>
        </p>
      </div>
    </div>

    <!-- Permissions List -->
    <div class="mb-3" v-if="userPermissions?.length">
      <h4 class="font-medium text-gray-700">User Permissions:</h4>
      <div class="text-sm text-gray-600">
        <ul class="list-disc list-inside">
          <li v-for="permission in userPermissions" :key="permission">
            <code>{{ permission }}</code>
          </li>
        </ul>
      </div>
    </div>

    <!-- Roles List -->
    <div class="mb-3" v-if="userRoles?.length">
      <h4 class="font-medium text-gray-700">User Roles:</h4>
      <div class="text-sm text-gray-600">
        <div v-for="role in userRoles" :key="role.id" class="mb-2">
          <p>
            <strong>{{ role.name }}</strong> (ID: {{ role.id }})
          </p>
          <ul class="list-disc list-inside ml-4">
            <li v-for="permission in role.permissions" :key="permission">
              <code>{{ permission }}</code>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Permission Checks -->
    <div class="mb-3">
      <h4 class="font-medium text-gray-700">Permission Checks:</h4>
      <div class="text-sm text-gray-600 grid grid-cols-2 gap-2">
        <div>
          <p>
            Can Edit Project:
            <span :class="canEditProject ? 'text-green-600' : 'text-red-600'">
              {{ canEditProject ? "✅" : "❌" }}
            </span>
          </p>
          <p>
            Can Edit Quotation:
            <span :class="canEditQuotation ? 'text-green-600' : 'text-red-600'">
              {{ canEditQuotation ? "✅" : "❌" }}
            </span>
          </p>
          <p>
            Can Edit Plan:
            <span :class="canEditPlan ? 'text-green-600' : 'text-red-600'">
              {{ canEditPlan ? "✅" : "❌" }}
            </span>
          </p>
        </div>
        <div>
          <p>
            Can Manage Roles:
            <span :class="canManageRoles ? 'text-green-600' : 'text-red-600'">
              {{ canManageRoles ? "✅" : "❌" }}
            </span>
          </p>
          <p>
            Can Assign Roles:
            <span :class="canAssignRoles ? 'text-green-600' : 'text-red-600'">
              {{ canAssignRoles ? "✅" : "❌" }}
            </span>
          </p>
          <p>
            Can Add Users:
            <span :class="canAddUsers ? 'text-green-600' : 'text-red-600'">
              {{ canAddUsers ? "✅" : "❌" }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button
        @click="refetchPermissions"
        class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        :disabled="isLoadingPermissions"
      >
        {{ isLoadingPermissions ? "Loading..." : "Refetch Permissions" }}
      </button>
      <button
        @click="showDebug = false"
        class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
      >
        Hide Debug
      </button>
    </div>
  </div>

  <!-- Show Debug Button -->
  <button
    v-else
    @click="showDebug = true"
    class="fixed bottom-4 right-4 px-3 py-2 bg-yellow-500 text-white rounded-full text-sm hover:bg-yellow-600 shadow-lg z-50"
  >
    🔍 Debug Permissions
  </button>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/modules/auth/store";

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true,
  },
  userPermissions: {
    type: Array,
    default: () => [],
  },
  userRoles: {
    type: Array,
    default: () => [],
  },
  isLoadingPermissions: {
    type: Boolean,
    default: false,
  },
  permissionError: {
    type: String,
    default: null,
  },
  canEditProject: {
    type: Boolean,
    default: false,
  },
  canEditQuotation: {
    type: Boolean,
    default: false,
  },
  canEditPlan: {
    type: Boolean,
    default: false,
  },
  canManageRoles: {
    type: Boolean,
    default: false,
  },
  canAssignRoles: {
    type: Boolean,
    default: false,
  },
  canAddUsers: {
    type: Boolean,
    default: false,
  },
  fetchUserPermissions: {
    type: Function,
    required: true,
  },
});

const route = useRoute();
const authStore = useAuthStore();
const showDebug = ref(false);

const refetchPermissions = async () => {
  await props.fetchUserPermissions();
};
</script>

<style scoped>
code {
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: "Courier New", monospace;
}
</style>
