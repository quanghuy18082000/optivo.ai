<template>
  <div class="relative" ref="containerRef">
    <button
      type="button"
      ref="triggerRef"
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

    <!-- Error message -->
    <span v-if="error" class="text-sm text-red-500 mt-1 block">
      {{ errorMessage }}
    </span>
  </div>

  <!-- Dropdown using Teleport -->
  <Teleport to="body">
    <div v-if="isOpen">
      <!-- Overlay -->
      <div
        class="fixed inset-0 bg-transparent select-overlay"
        @click="closeDropdown"
        :style="{ zIndex: 40 }"
      ></div>

      <!-- Dropdown -->
      <div
        ref="dropdownRef"
        :style="popupStyle"
        class="bg-white border border-gray-300 rounded-md shadow-lg overflow-auto select-dropdown"
        @click.stop
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
          <TruncateText :name="option.label" text-class="inline" />
          <span v-if="option.disabled" class="ml-1 text-xs text-gray-500">
            (already selected)
          </span>
        </div>
        <div v-if="!options.length" class="px-3 py-2 text-gray-500 text-sm">
          No options available
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useDropdownPosition } from "@/composables/useDropdownPosition";
import TruncateText from "./TruncateText.vue";

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
  maxHeight: {
    type: Number,
    default: 240,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const isOpen = ref(false);
const containerRef = ref(null);
const triggerRef = ref(null);
const dropdownRef = ref(null);

const { popupStyle, updatePosition } = useDropdownPosition();

const selectedOption = computed(() => {
  return props.options.find(
    (option) => String(option.value) === String(props.modelValue)
  );
});

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;

    if (isOpen.value) {
      // Add class to body to prevent scrolling on mobile
      document.body.classList.add("select-open");
      updatePosition(triggerRef.value, dropdownRef.value, {
        maxHeight: props.maxHeight,
        preferredPosition: "bottom",
      });
    } else {
      // Remove class from body
      document.body.classList.remove("select-open");
    }
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  // Remove class from body when closing
  document.body.classList.remove("select-open");
};

const selectOption = (option) => {
  // Don't select disabled options
  if (option.disabled) return;

  emit("update:modelValue", option.value);
  emit("change", option);
  closeDropdown();
};

const handleEscape = (e) => {
  if (e.key === "Escape" && isOpen.value) {
    closeDropdown();
  }
};

const updateOnResizeOrScroll = () => {
  if (isOpen.value && triggerRef.value && dropdownRef.value) {
    updatePosition(triggerRef.value, dropdownRef.value, {
      maxHeight: props.maxHeight,
      preferredPosition: "bottom",
    });
  }
};

// Watch for dropdown visibility changes to update positioning
watch(isOpen, (isVisible) => {
  if (isVisible) {
    updatePosition(triggerRef.value, dropdownRef.value, {
      maxHeight: props.maxHeight,
      preferredPosition: "bottom",
    });
  }
});

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
  window.addEventListener("resize", updateOnResizeOrScroll);
  window.addEventListener("scroll", updateOnResizeOrScroll, true);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
  window.removeEventListener("resize", updateOnResizeOrScroll);
  window.removeEventListener("scroll", updateOnResizeOrScroll, true);
  // Cleanup body class on unmount
  document.body.classList.remove("select-open");
});
</script>
