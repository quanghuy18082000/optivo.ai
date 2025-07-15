<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4"
  >
    <div class="text-center">
      <h1 class="text-9xl font-bold text-blue-600 mb-4">404</h1>
      <h2 class="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
        {{ $t("errors.pageNotFound") }}
      </h2>
      <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
        {{ $t("errors.pageNotFoundMessage") }}
      </p>
      <router-link
        to="/"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          ></path>
        </svg>
        {{ $t("common.backToHome") }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed for this component
</script>
