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

const { isGlobalLoading } = useGlobalLoading();
</script>

<style scoped></style>
