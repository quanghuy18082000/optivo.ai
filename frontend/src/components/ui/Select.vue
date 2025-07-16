<template>
  <div class="relative" ref="containerRef">
    <button
      type="button"
      @click="toggleDropdown"
      class="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
      :class="[
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:ring-blue-500',
        disabled
          ? 'bg-gray-100 cursor-not-allowed'
          : 'cursor-pointer hover:border-gray-400',
      ]"
      :disabled="disabled"
    >
      <div class="flex items-center justify-between">
        <span :class="selectedOption ? 'text-gray-900' : 'text-gray-500'">
          {{ selectedOption ? selectedOption.label : placeholder }}
        </span>
        <svg
          class="w-5 h-5 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </button>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      ref="dropdownRef"
      :style="dropdownStyles"
      class="fixed z-50 min-w-xs max-w-md mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-auto"
    >
      <div
        v-for="option in options"
        :key="option.value"
        @click="!option.disabled && selectOption(option)"
        class="px-3 py-2 transition-colors duration-150"
        :class="{
          'bg-blue-50 text-blue-600':
            selectedOption?.value === option.value && !option.disabled,
          'cursor-pointer hover:bg-gray-100': !option.disabled,
          'cursor-not-allowed text-gray-400 bg-gray-50': option.disabled,
        }"
        :title="
          option.disabled
            ? 'This project is already selected in another group'
            : ''
        "
      >
        {{ option.label }}
        <span v-if="option.disabled" class="ml-1 text-xs text-gray-500">
          (already selected)
        </span>
      </div>
      <div v-if="!options.length" class="px-3 py-2 text-gray-500 text-sm">
        No options available
      </div>
    </div>

    <!-- Error message -->
    <span v-if="error" class="text-sm text-red-500 mt-1 block">
      {{ errorMessage }}
    </span>
  </div>

  <!-- Click outside to close -->
  <div v-if="isOpen" class="fixed inset-0 z-40" @click="closeDropdown"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
    validator: (options) => {
      return options.every(
        (option) =>
          typeof option === "object" &&
          option.hasOwnProperty("label") &&
          option.hasOwnProperty("value")
      );
    },
  },
  placeholder: {
    type: String,
    default: "Select an option",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: "This field has an error",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const isOpen = ref(false);
const dropdownStyles = ref({});
const containerRef = ref(null);
const dropdownRef = ref(null);

const selectedOption = computed(() => {
  return props.options.find(
    (option) => String(option.value) === String(props.modelValue)
  );
});

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;

    if (isOpen.value) {
      nextTick(() => {
        const container = containerRef.value;
        const dropdown = dropdownRef.value;

        if (container && dropdown) {
          const containerRect = container.getBoundingClientRect();
          const spaceBelow = window.innerHeight - containerRect.bottom;
          const maxHeight = Math.min(spaceBelow - 20, 240); // set a max height with a small buffer

          dropdownStyles.value = {
            width: `${containerRect.width}px`,
            maxHeight: `${maxHeight}px`,
          };
        }
      });
    }
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};

const selectOption = (option) => {
  // Don't select disabled options
  if (option.disabled) return;

  emit("update:modelValue", option.value);
  emit("change", option);
  closeDropdown();
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (isOpen.value && !event.target.closest(".relative")) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
