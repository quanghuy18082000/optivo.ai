<template>
  <div class="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full">
    <!-- Step 1 -->
    <div
      class="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
      :class="
        currentStep >= 1
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-500'
      "
    >
      <svg
        v-if="currentStep > 1"
        class="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      <span v-else class="text-sm font-medium">1</span>
    </div>

    <!-- Line connector -->
    <div
      class="w-4 h-0.5"
      :class="currentStep > 1 ? 'bg-blue-600' : 'bg-gray-300'"
    ></div>

    <!-- Step 2 -->
    <div
      class="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
      :class="
        currentStep >= 2
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-500'
      "
    >
      <svg
        v-if="currentStep > 2"
        class="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      <span v-else class="text-sm font-medium">2</span>
    </div>

    <!-- Line connector -->
    <div
      class="w-4 h-0.5"
      :class="currentStep > 2 ? 'bg-blue-600' : 'bg-gray-300'"
    ></div>

    <!-- Step 3 -->
    <div
      class="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
      :class="
        currentStep >= 3
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-500'
      "
    >
      <svg
        v-if="currentStep > 3"
        class="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      <span v-else class="text-sm font-medium">3</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
});
</script>
