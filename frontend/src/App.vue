<template>
  <div>
    <router-view />

    <!-- Global Loading Screen -->
    <LoadingScreen :is-visible="isGlobalLoading" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import LoadingScreen from "@/components/ui/LoadingScreen.vue";

import { useGlobalLoading } from "@/composables/useGlobalLoading.js";
import { useRoutePermissions } from "@/composables/useRoutePermissions.js";

const { isGlobalLoading } = useGlobalLoading();

// Initialize route-based permission refreshing
useRoutePermissions();
</script>

<style scoped></style>
