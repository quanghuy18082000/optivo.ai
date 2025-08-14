<template>
  <div>
    <router-view />

    <!-- Global Loading Screen -->
    <LoadingScreen :is-visible="isGlobalLoading" />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import LoadingScreen from "@/components/ui/LoadingScreen.vue";
import { useGlobalLoading } from "@/composables/useGlobalLoading.js";
import { useAuthStore } from "@/modules/auth/store";
import {
  fetchUserPermissions,
  fetchUserPermissionsDebounced,
} from "@/services/permissionService.js";

const { isGlobalLoading, setLoading } = useGlobalLoading();
const authStore = useAuthStore();
const route = useRoute();

// Function to initialize user permissions
const initializePermissions = async () => {
  if (authStore.isAuthenticated) {
    const loadingKey = "app-init-permissions";

    try {
      setLoading(loadingKey, true);

      await fetchUserPermissions(true); // Force refresh on app initialization
    } catch (error) {
      console.error("❌ Failed to initialize user permissions:", error);
    } finally {
      setLoading(loadingKey, false);
    }
  }
};

// Initialize permissions when app mounts
onMounted(() => {
  initializePermissions();
});

// Note: Route-based permission refresh is now handled in router guard
// This ensures permissions are fetched BEFORE route access, not after

// Watch for authentication state changes
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      // User just logged in, initialize permissions
      await initializePermissions();
    }
  }
);
</script>

<style scoped></style>
