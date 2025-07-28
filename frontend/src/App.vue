<template>
  <div>
    <router-view />

    <!-- Global Loading Screen -->
    <LoadingScreen :is-visible="isGlobalLoading" />

    <!-- Development Test Panel -->
    <!-- <LoadingTestPanel v-if="isDevelopment" /> -->
  </div>
</template>

<script setup>
import { computed } from "vue";
import LoadingScreen from "@/components/ui/LoadingScreen.vue";
import LoadingTestPanel from "@/components/LoadingTestPanel.vue";
import { useGlobalLoading } from "@/composables/useGlobalLoading.js";
import { useRoutePermissions } from "@/composables/useRoutePermissions.js";

const { isGlobalLoading } = useGlobalLoading();

// Initialize route-based permission refreshing
useRoutePermissions();

// Show test panel only in development
const isDevelopment = computed(() => import.meta.env.DEV);
</script>

<style scoped></style>
