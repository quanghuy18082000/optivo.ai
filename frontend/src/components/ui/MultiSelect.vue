<template>
  <div class="relative" ref="containerRef">
    <!-- Main Input Display -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      :class="[
        'w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500',
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
              {{ item.label }}
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

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      ref="dropdownRef"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
    >
      <!-- Search Input -->
      <div v-if="searchable" class="p-2 border-b border-gray-200">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search options..."
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          @click.stop
        />
      </div>

      <!-- Select All Option -->
      <div
        v-if="showSelectAll && filteredOptions.length > 0"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
        @click.stop="handleSelectAllClick"
      >
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate.prop="isIndeterminate"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            @click.stop
          />
          <span class="text-sm font-medium text-gray-700">Select All</span>
        </div>
      </div>

      <!-- Options List -->
      <div>
        <div
          v-for="option in filteredOptions"
          :key="option.value"
          class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
          @click.stop="handleOptionClick(option)"
        >
          <input
            type="checkbox"
            :checked="isOptionSelected(option)"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            @click.stop
          />
          <span class="text-sm text-gray-700">{{ option.label }}</span>
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

    <!-- Error Message -->
    <p v-if="error && errorMessage" class="mt-1 text-sm text-red-600">
      {{ errorMessage }}
    </p>
  </div>

  <!-- Backdrop -->
  <div v-if="isOpen" class="fixed inset-0 z-40" @click="closeDropdown"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

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
  showSelectAll: {
    type: Boolean,
    default: false,
  },
  maxDisplayItems: {
    type: Number,
    default: 3,
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "change"]);

// Refs
const isOpen = ref(false);
const searchQuery = ref("");
const containerRef = ref(null);
const dropdownRef = ref(null);

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
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = "";
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

// Click outside handler
const handleClickOutside = (event) => {
  if (
    isOpen.value &&
    containerRef.value &&
    !containerRef.value.contains(event.target)
  ) {
    closeDropdown();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
