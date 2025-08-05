<template>
  <div class="overflow-hidden bg-white rounded-lg shadow">
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Header -->
        <thead class="bg-gray-50">
          <tr>
            <slot name="header" />
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="bg-white divide-y divide-gray-200">
          <slot name="body" />

          <!-- Empty state -->
          <tr v-if="showEmpty" class="hover:bg-gray-50">
            <td
              :colspan="columnCount"
              class="px-6 py-12 text-center text-gray-500"
            >
              <div class="flex flex-col items-center">
                <svg
                  class="w-12 h-12 mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"
                  ></path>
                </svg>
                <p class="text-sm font-medium text-gray-900">
                  {{ emptyMessage }}
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center"
    >
      <div class="flex items-center space-x-2">
        <div
          class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
        ></div>
        <span class="text-sm text-gray-600">{{ $t("common.loading") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  showEmpty: {
    type: Boolean,
    default: false,
  },
  emptyMessage: {
    type: String,
    default: "No data available",
  },
  columnCount: {
    type: Number,
    default: 1,
  },
});
</script>
