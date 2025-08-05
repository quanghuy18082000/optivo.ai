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
        class="bg-white border border-gray-300 rounded-md shadow-lg select-dropdown flex flex-col"
        :class="{ 'min-h-[200px]': filteredOptions.length > 0 }"
        @click.stop
      >
        <!-- Sticky Search Input -->
        <div
          v-if="searchable"
          class="sticky top-0 z-10 bg-white p-3 border-b border-gray-200 rounded-t-md flex-shrink-0"
        >
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            @click.stop
            @keydown.enter.prevent="selectFirstOption"
            @keydown.escape.prevent="closeDropdown"
          />
        </div>

        <!-- Scrollable Options List -->
        <div
          class="overflow-y-auto flex-1"
          :style="{
            maxHeight: maxHeight + 'px',
            minHeight: getMinHeight() + 'px',
          }"
        >
          <div
            v-for="option in filteredOptions"
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

          <!-- No Options Message -->
          <div
            v-if="filteredOptions.length === 0"
            class="px-3 py-2 text-gray-500 text-sm"
          >
            {{ searchQuery ? "No options found" : "No options available" }}
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
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
  searchable: {
    type: Boolean,
    default: false,
  },
  searchPlaceholder: {
    type: String,
    default: "Search options...",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const isOpen = ref(false);
const searchQuery = ref("");
const containerRef = ref(null);
const triggerRef = ref(null);
const dropdownRef = ref(null);
const searchInputRef = ref(null);

const popupStyle = ref({});

const selectedOption = computed(() => {
  return props.options.find(
    (option) => String(option.value) === String(props.modelValue)
  );
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;

  return props.options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;

    if (isOpen.value) {
      // Clear search query when opening
      searchQuery.value = "";
      // Add class to body to prevent scrolling on mobile
      document.body.classList.add("select-open");

      // Position dropdown after DOM update
      setTimeout(() => {
        positionDropdown();
        // Re-position after a short delay to ensure DOM is fully rendered
        setTimeout(() => positionDropdown(), 10);
      }, 0);

      // Focus search input if searchable
      if (props.searchable) {
        setTimeout(() => {
          searchInputRef.value?.focus();
        }, 100);
      }
    } else {
      // Remove class from body
      document.body.classList.remove("select-open");
    }
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = "";
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

const selectFirstOption = () => {
  const availableOptions = filteredOptions.value.filter(
    (option) => !option.disabled
  );
  if (availableOptions.length > 0) {
    selectOption(availableOptions[0]);
  }
};

const getMinHeight = () => {
  // Base min height for options list
  const baseMinHeight = 120;

  // If no options, return smaller height
  if (filteredOptions.value.length === 0) {
    return 60;
  }

  // If few options, calculate based on option count
  if (filteredOptions.value.length <= 3) {
    return Math.min(filteredOptions.value.length * 40 + 20, baseMinHeight);
  }

  return baseMinHeight;
};

const positionDropdown = () => {
  if (!triggerRef.value || !dropdownRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const isMobile = viewportWidth < 640; // sm breakpoint

  if (isMobile) {
    // On mobile, center the dropdown
    popupStyle.value = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      position: "fixed",
      maxWidth: "calc(100vw - 20px)",
      width: "300px",
      zIndex: 50,
    };
    return;
  }

  const dropdownWidth = Math.max(triggerRect.width, 200); // At least as wide as trigger
  const dropdownHeight = Math.min(
    props.maxHeight + (props.searchable ? 60 : 0),
    400
  ); // Estimated height

  // Calculate vertical position
  const spaceBelow = viewportHeight - triggerRect.bottom - 10; // 10px margin
  const spaceAbove = triggerRect.top - 10; // 10px margin
  const shouldOpenUp =
    spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;

  // Calculate horizontal position
  let left = triggerRect.left;
  const spaceRight = viewportWidth - triggerRect.left;

  // If dropdown would overflow on the right, align it to the right edge of trigger
  if (spaceRight < dropdownWidth) {
    left = triggerRect.right - dropdownWidth;
  }

  // Ensure dropdown doesn't go off-screen on the left
  if (left < 10) {
    left = 10;
  }

  // Ensure dropdown doesn't go off-screen on the right
  if (left + dropdownWidth > viewportWidth - 10) {
    left = viewportWidth - dropdownWidth - 10;
  }

  // Calculate top position
  let top;
  if (shouldOpenUp) {
    top = Math.max(10, triggerRect.top - dropdownHeight - 5);
  } else {
    top = Math.min(
      viewportHeight - dropdownHeight - 10,
      triggerRect.bottom + 5
    );
  }

  popupStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${Math.max(dropdownWidth, triggerRect.width)}px`,
    position: "fixed",
    transform: "none",
    zIndex: 50,
  };
};

const handleEscape = (e) => {
  if (e.key === "Escape" && isOpen.value) {
    closeDropdown();
  }
};

const updateOnResizeOrScroll = () => {
  if (isOpen.value) {
    positionDropdown();
  }
};

// Watch for dropdown visibility changes to update positioning
watch(isOpen, (isVisible) => {
  if (isVisible) {
    setTimeout(() => positionDropdown(), 0);
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

<style scoped>
/* Custom scrollbar for dropdown */
.select-dropdown .overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.select-dropdown .overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.select-dropdown .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.select-dropdown .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Ensure sticky elements have proper background */
.sticky {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Smooth transitions for hover states */
.select-dropdown .transition-colors {
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
}

/* Focus ring for search input */
.select-dropdown input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Dropdown sizing improvements */
.select-dropdown {
  min-width: 200px;
  max-width: 400px;
}

.select-dropdown.min-h-\[200px\] {
  min-height: 200px !important;
}

/* Ensure proper flex behavior */
.select-dropdown .flex-shrink-0 {
  flex-shrink: 0;
}

.select-dropdown .flex-1 {
  flex: 1 1 auto;
  min-height: 0; /* Allow flex item to shrink below content size */
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .select-dropdown {
    max-width: calc(100vw - 2rem);
    min-width: 280px;
  }

  .sticky {
    padding: 0.75rem;
  }

  /* Adjust min-height for mobile */
  .select-dropdown.min-h-\[200px\] {
    min-height: 180px !important;
  }
}
</style>
