<template>
  <Unauthorized />
</template>

<script setup>
import { onMounted } from "vue";
import Unauthorized from "@/components/errors/Unauthorized.vue";
import { usePageLoading } from "@/composables/usePageLoading";

// Page loading management - Unauthorized page loads immediately
const { stopLoading } = usePageLoading("unauthorized-view-page");

onMounted(() => {
  stopLoading();
});
</script>
