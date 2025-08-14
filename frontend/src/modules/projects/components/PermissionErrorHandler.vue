<template>
  <!-- Permission Loading -->
  <div
    v-if="isLoadingPermissions"
    class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"
  >
    <div
      class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
    ></div>
    <h3 class="text-lg font-medium text-blue-800 mb-2">Loading Permissions</h3>
    <p class="text-blue-600">Checking your access rights...</p>
  </div>

  <!-- Permission Error -->
  <div
    v-else-if="permissionError"
    class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
  >
    <svg
      class="mx-auto h-12 w-12 text-red-400 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
    <h3 class="text-lg font-medium text-red-800 mb-2">Permission Error</h3>
    <p class="text-red-600 mb-4">{{ permissionError }}</p>

    <!-- Error-specific actions -->
    <div class="flex justify-center gap-3">
      <button
        @click="retryPermissions"
        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        :disabled="isRetrying"
      >
        {{ isRetrying ? "Retrying..." : "Retry" }}
      </button>

      <button
        v-if="showGoBack"
        @click="goBack"
        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Go Back
      </button>
    </div>

    <!-- Debug info for development -->
    <details v-if="showDebugInfo" class="mt-4 text-left">
      <summary class="cursor-pointer text-sm text-red-700 hover:text-red-900">
        Show Debug Info
      </summary>
      <div class="mt-2 p-3 bg-red-100 rounded text-xs text-red-800">
        <p>
          <strong>Project ID:</strong> {{ projectId }} ({{ typeof projectId }})
        </p>
        <p><strong>User ID:</strong> {{ userId }} ({{ typeof userId }})</p>
        <p><strong>Error:</strong> {{ permissionError }}</p>
        <p><strong>Timestamp:</strong> {{ new Date().toISOString() }}</p>
      </div>
    </details>
  </div>

  <!-- No Permissions -->
  <div
    v-else-if="hasNoPermissions"
    class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center"
  >
    <svg
      class="mx-auto h-12 w-12 text-yellow-400 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
    <h3 class="text-lg font-medium text-yellow-800 mb-2">Access Restricted</h3>
    <p class="text-yellow-600 mb-4">
      You don't have permission to access this project.
    </p>

    <div class="flex justify-center gap-3">
      <button
        @click="requestAccess"
        class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        Request Access
      </button>

      <button
        @click="goToProjects"
        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        View My Projects
      </button>
    </div>
  </div>

  <!-- Invalid Project -->
  <div
    v-else-if="isInvalidProject"
    class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center"
  >
    <svg
      class="mx-auto h-12 w-12 text-gray-400 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    <h3 class="text-lg font-medium text-gray-800 mb-2">Project Not Found</h3>
    <p class="text-gray-600 mb-4">
      The project you're looking for doesn't exist or has been removed.
    </p>

    <button
      @click="goToProjects"
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Browse Projects
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store";

const props = defineProps({
  isLoadingPermissions: {
    type: Boolean,
    default: false,
  },
  permissionError: {
    type: String,
    default: null,
  },
  projectId: {
    type: [String, Number],
    default: null,
  },
  userPermissions: {
    type: Array,
    default: () => [],
  },
  userRoles: {
    type: Array,
    default: () => [],
  },
  fetchUserPermissions: {
    type: Function,
    required: true,
  },
  showDebugInfo: {
    type: Boolean,
    default: process.env.NODE_ENV === "development",
  },
});

const router = useRouter();
const authStore = useAuthStore();

// Computed properties
const userId = computed(() => authStore.user?.id);

const hasNoPermissions = computed(() => {
  return (
    !props.isLoadingPermissions &&
    !props.permissionError &&
    props.userPermissions.length === 0 &&
    props.userRoles.length === 0
  );
});

const isInvalidProject = computed(() => {
  return (
    props.permissionError &&
    (props.permissionError.includes("not found") ||
      props.permissionError.includes("invalid project_id"))
  );
});

const showGoBack = computed(() => {
  return window.history.length > 1;
});

// State
const isRetrying = ref(false);

// Methods
const retryPermissions = async () => {
  isRetrying.value = true;
  try {
    await props.fetchUserPermissions();
  } finally {
    isRetrying.value = false;
  }
};

const goBack = () => {
  router.go(-1);
};

const goToProjects = () => {
  router.push("/projects");
};

const requestAccess = () => {
  // TODO: Implement request access functionality
  // For now, just show a message
  alert("Please contact your project administrator to request access.");
};
</script>
