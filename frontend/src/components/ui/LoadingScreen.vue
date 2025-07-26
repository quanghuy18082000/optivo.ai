<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <!-- Simple Loading Circle -->
    <div
      class="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  isVisible: {
    type: Boolean,
    default: true,
  },
});
</script>
