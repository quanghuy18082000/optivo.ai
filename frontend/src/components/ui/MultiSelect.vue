<template>
  <div class="relative" ref="containerRef">
    <!-- Main Input Display -->
    <button
      type="button"
      ref="triggerRef"
      @click="toggleDropdown"
      :disabled="disabled"
      :class="[
        'dropdown-trigger w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500',
        disabled
          ? 'bg-gray-50 cursor-not-allowed'
          : 'cursor-pointer hover:border-gray-400',
        error
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-blue-500',
      ]"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <!-- Selected Items Display -->
          <div v-if="selectedItems.length > 0" class="flex flex-wrap gap-1">
            <span
              v-for="item in displayItems"
              :key="item.value"
              class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
            >
              <TruncateText
                :name="item.label"
                text-class="text-xs font-medium"
              />
              <button
                type="button"
                @click.stop="removeItem(item)"
                class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
              >
                <svg
                  class="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
            <span
              v-if="selectedItems.length > maxDisplayItems"
              class="text-xs text-gray-500 py-1"
            >
              +{{ selectedItems.length - maxDisplayItems }} more
            </span>
          </div>
          <!-- Placeholder -->
          <span v-else class="text-gray-500">{{ placeholder }}</span>
        </div>

        <!-- Dropdown Arrow -->
        <div class="ml-2 flex-shrink-0">
          <svg
            :class="[
              'w-5 h-5 text-gray-400 transition-transform',
              isOpen ? 'rotate-180' : '',
            ]"
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
      </div>
    </button>

    <!-- Error Message -->
    <p v-if="error && errorMessage" class="mt-1 text-sm text-red-600">
      {{ errorMessage }}
    </p>
  </div>

  <!-- Dropdown using Teleport -->
  <Teleport to="body">
    <div v-if="isOpen">
      <!-- Dropdown Menu (no overlay needed, dropdown manager handles it) -->
      <div
        ref="dropdownRef"
        :style="popupStyle"
        class="bg-white border border-gray-300 rounded-md shadow-lg multiselect-dropdown dropdown-content flex flex-col"
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
            @keydown.escape.prevent="closeDropdown"
          />
        </div>

        <!-- Sticky Select All Option -->
        <div
          v-if="showSelectAll && filteredOptions.length > 0"
          class="sticky z-10 bg-white px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-200 flex-shrink-0"
          :class="searchable ? 'top-[61px]' : 'top-0'"
          @click.stop="handleSelectAllClick"
        >
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate.prop="isIndeterminate"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              @click.stop="handleSelectAllClick"
            />
            <span class="text-sm font-medium text-gray-700">Select All</span>
          </div>
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
            class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 transition-colors"
            @click.stop="handleOptionClick(option)"
          >
            <input
              type="checkbox"
              :checked="isOptionSelected(option)"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              @click.stop="handleOptionClick(option)"
            />
            <TruncateText
              :name="option.label"
              text-class="text-sm text-gray-700"
            />
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
import {
  useDropdownManager,
  useEscapeKey,
} from "@/composables/useDropdownManager";

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "Select options...",
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
    default: "",
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  searchPlaceholder: {
    type: String,
    default: "Search options...",
  },
  showSelectAll: {
    type: Boolean,
    default: false,
  },
  maxDisplayItems: {
    type: Number,
    default: 3,
  },
  maxHeight: {
    type: Number,
    default: 240,
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "change"]);

// Refs
const isOpen = ref(false);
const searchQuery = ref("");
const containerRef = ref(null);
const triggerRef = ref(null);
const dropdownRef = ref(null);
const searchInputRef = ref(null);

const popupStyle = ref({});

// Initialize dropdown manager
const { registerDropdown } = useDropdownManager();
useEscapeKey(() => {
  if (isOpen.value) {
    closeDropdown();
  }
});

// Computed
const selectedItems = computed(() => {
  return props.options.filter((option) =>
    props.modelValue.includes(option.value)
  );
});

const displayItems = computed(() => {
  return selectedItems.value.slice(0, props.maxDisplayItems);
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;

  return props.options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const isAllSelected = computed(() => {
  if (filteredOptions.value.length === 0) return false;

  return filteredOptions.value.every((option) =>
    props.modelValue.includes(option.value)
  );
});

const isIndeterminate = computed(() => {
  if (filteredOptions.value.length === 0) return false;

  const selectedCount = filteredOptions.value.filter((option) =>
    props.modelValue.includes(option.value)
  ).length;

  return selectedCount > 0 && selectedCount < filteredOptions.value.length;
});

// Methods
const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = "";
    // Add class to body to prevent scrolling on mobile
    document.body.classList.add("multiselect-open");

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
    document.body.classList.remove("multiselect-open");
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = "";
  // Remove class from body when closing
  document.body.classList.remove("multiselect-open");
};

const isOptionSelected = (option) => {
  return props.modelValue.includes(option.value);
};

const toggleOption = (option) => {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(option.value);

  if (index > -1) {
    // Remove option
    newValue.splice(index, 1);
  } else {
    // Add option
    newValue.push(option.value);
  }

  // Emit updates
  emit("update:modelValue", newValue);

  // Calculate selected options for change event
  const newSelectedOptions = props.options.filter((opt) =>
    newValue.includes(opt.value)
  );
  emit("change", newValue, newSelectedOptions);
};

const removeItem = (item) => {
  const newValue = props.modelValue.filter((value) => value !== item.value);
  emit("update:modelValue", newValue);

  const newSelectedOptions = props.options.filter((opt) =>
    newValue.includes(opt.value)
  );
  emit("change", newValue, newSelectedOptions);
};

// Separate handlers to prevent event conflicts
const handleOptionClick = (option) => {
  toggleOption(option);
};

const handleSelectAllClick = () => {
  toggleSelectAll();
};

const toggleSelectAll = () => {
  const filteredValues = filteredOptions.value.map((option) => option.value);

  if (isAllSelected.value) {
    // Deselect all filtered options
    const newValue = props.modelValue.filter(
      (value) => !filteredValues.includes(value)
    );
    emit("update:modelValue", newValue);

    const newSelectedOptions = props.options.filter((opt) =>
      newValue.includes(opt.value)
    );
    emit("change", newValue, newSelectedOptions);
  } else {
    // Select all filtered options
    const newValue = [...new Set([...props.modelValue, ...filteredValues])];
    emit("update:modelValue", newValue);

    const newSelectedOptions = props.options.filter((opt) =>
      newValue.includes(opt.value)
    );
    emit("change", newValue, newSelectedOptions);
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
      zIndex: 9999,
    };
    return;
  }

  const dropdownWidth = Math.max(triggerRect.width, 200); // At least as wide as trigger
  const searchHeight = props.searchable ? 60 : 0;
  const selectAllHeight = props.showSelectAll ? 40 : 0;
  const dropdownHeight = Math.min(
    props.maxHeight + searchHeight + selectAllHeight,
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
    zIndex: 9999,
  };
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

// Lifecycle
onMounted(() => {
  // Register với dropdown manager
  const cleanup = registerDropdown(isOpen, closeDropdown);

  // Keep existing resize/scroll listeners
  window.addEventListener("resize", updateOnResizeOrScroll);
  window.addEventListener("scroll", updateOnResizeOrScroll, true);

  // Store cleanup function for unmount
  onUnmounted(() => {
    cleanup();
    window.removeEventListener("resize", updateOnResizeOrScroll);
    window.removeEventListener("scroll", updateOnResizeOrScroll, true);
    // Cleanup body class on unmount
    document.body.classList.remove("multiselect-open");
  });
});
</script>

<style scoped>
/* Custom scrollbar for dropdown */
.multiselect-dropdown .overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.multiselect-dropdown .overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.multiselect-dropdown .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.multiselect-dropdown .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Ensure sticky elements have proper background */
.sticky {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Smooth transitions for hover states */
.multiselect-dropdown .transition-colors {
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
}

/* Focus ring for search input */
.multiselect-dropdown input[type="text"]:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Checkbox styling improvements */
.multiselect-dropdown input[type="checkbox"] {
  transition: all 0.15s ease-in-out;
}

.multiselect-dropdown input[type="checkbox"]:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Selected items styling improvements */
.inline-flex.items-center {
  transition: all 0.15s ease-in-out;
}

.inline-flex.items-center:hover {
  background-color: rgba(59, 130, 246, 0.15);
}

/* Dropdown sizing improvements */
.multiselect-dropdown {
  min-width: 200px;
  max-width: 400px;
}

.multiselect-dropdown.min-h-\[200px\] {
  min-height: 200px !important;
}

/* Ensure proper flex behavior */
.multiselect-dropdown .flex-shrink-0 {
  flex-shrink: 0;
}

.multiselect-dropdown .flex-1 {
  flex: 1 1 auto;
  min-height: 0; /* Allow flex item to shrink below content size */
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .multiselect-dropdown {
    max-width: calc(100vw - 2rem);
    min-width: 280px;
  }

  .sticky {
    padding: 0.75rem;
  }

  /* Adjust selected items display on mobile */
  .inline-flex.items-center {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  /* Adjust min-height for mobile */
  .multiselect-dropdown.min-h-\[200px\] {
    min-height: 180px !important;
  }
}

/* Improve Select All section visibility */
.sticky.top-0:nth-child(2) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Better visual separation for sticky elements */
.sticky + .overflow-y-auto {
  border-top: 1px solid #e5e7eb;
}
</style>
