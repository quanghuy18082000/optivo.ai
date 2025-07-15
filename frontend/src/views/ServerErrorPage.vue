<template>
  <ErrorHandler
    :title="$t('errors.serverError')"
    :message="$t('errors.serverErrorMessage')"
  />
</template>

<script setup>
import ErrorHandler from "@/components/errors/ErrorHandler.vue";
</script>
