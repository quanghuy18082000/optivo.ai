<template>
  <ErrorHandler
    :title="$t('errors.serverError')"
    :message="$t('errors.serverErrorMessage')"
  />
</template>

<script setup>
import { onMounted } from "vue";
import ErrorHandler from "@/components/errors/ErrorHandler.vue";
import { usePageLoading } from "@/composables/usePageLoading";

// Page loading management - Server error page loads immediately
const { stopLoading } = usePageLoading("server-error-page");

onMounted(() => {
  stopLoading();
});
</script>
