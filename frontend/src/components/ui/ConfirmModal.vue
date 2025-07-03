<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4"
        @click="$emit('update:modelValue', false)"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              {{ title }}
            </h3>
          </div>

          <!-- Content -->
          <div class="px-6 py-4">
            <div class="flex items-start">
              <!-- Icon (optional) -->
              <div v-if="showIcon" class="flex-shrink-0 mr-4">
                <div
                  class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>

              <!-- Message -->
              <div>
                <p class="text-sm text-gray-500">
                  {{ message }}
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3"
          >
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="$emit('update:modelValue', false)"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              @click="confirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Confirm Action",
  },
  message: {
    type: String,
    default: "Are you sure you want to perform this action?",
  },
  confirmText: {
    type: String,
    default: "Confirm",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const confirm = () => {
  emit("confirm");
  emit("update:modelValue", false);
};
</script>
