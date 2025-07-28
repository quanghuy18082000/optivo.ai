<template>
  <NotFound />
</template>

<script setup>
import { onMounted } from "vue";
import NotFound from "@/components/errors/NotFound.vue";
import { usePageLoading } from "@/composables/usePageLoading";

// Page loading management - NotFound page loads immediately
const { stopLoading } = usePageLoading("not-found-page");

onMounted(() => {
  stopLoading();
});
</script>
