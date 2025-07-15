<template>
  <div class="relative" ref="containerRef">
    <button
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
        <div class="flex-1 min-w-0">
          <div v-if="selectedOptions.length > 0" class="flex flex-wrap gap-1">
            <span
              v-for="option in selectedOptions.slice(0, maxDisplayItems)"
              :key="option.value"
              class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
            >
              {{ option.label }}
              <button
                @click.stop="removeOption(option)"
                class="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
              v-if="selectedOptions.length > maxDisplayItems"
              class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              +{{ selectedOptions.length - maxDisplayItems }} more
            </span>
          </div>
          <span v-else class="text-gray-500">{{ placeholder }}</span>
        </div>
        <div class="flex items-center gap-2 ml-2">
          <button
            v-if="selectedOptions.length > 0 && !disabled"
            @click.stop="clearAll"
            class="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg
              class="w-4 h-4 text-gray-400"
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
      </div>
    </button>

    <div
      v-if="isOpen"
      ref="dropdownRef"
      :style="dropdownStyles"
      class="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-auto"
    >
      <div v-if="searchable" class="p-2 border-b border-gray-200">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search options..."
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          @click.stop
        />
      </div>

      <div
        v-if="showSelectAll && filteredOptions.length > 0"
        @click="toggleSelectAll"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-150 border-b border-gray-200"
      >
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            @click.stop
          />
          <span class="text-sm font-medium text-gray-700">Select All</span>
        </div>
      </div>

      <div>
        <div
          v-for="option in filteredOptions"
          :key="option.value"
          @click="toggleOption(option)"
          class="px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
        >
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="isSelected(option)"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              @click.stop
            />
            <span class="text-sm text-gray-700">{{ option.label }}</span>
          </div>
        </div>
        <div
          v-if="filteredOptions.length === 0"
          class="px-3 py-2 text-gray-500 text-sm"
        >
          {{ searchQuery ? "No options found" : "No options available" }}
        </div>
      </div>
    </div>

    <span v-if="error" class="text-sm text-red-500 mt-1 block">
      {{ errorMessage }}
    </span>
  </div>

  <div v-if="isOpen" class="fixed inset-0 z-40" @click="closeDropdown"></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps({
  modelValue: Array,
  options: Array,
  placeholder: String,
  disabled: Boolean,
  error: Boolean,
  errorMessage: String,
  searchable: Boolean,
  showSelectAll: Boolean,
  maxDisplayItems: Number,
});

const emit = defineEmits(["update:modelValue", "change"]);

const isOpen = ref(false);
const searchQuery = ref("");
const dropdownStyles = ref({});
const containerRef = ref(null);
const dropdownRef = ref(null);

const selectedOptions = computed(() => {
  return props.options.filter((option) =>
    props.modelValue.includes(option.value)
  );
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;

  return props.options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const isAllSelected = computed(() => {
  return (
    filteredOptions.value.length > 0 &&
    filteredOptions.value.every((option) =>
      props.modelValue.includes(option.value)
    )
  );
});

const isIndeterminate = computed(() => {
  const selectedCount = filteredOptions.value.filter((option) =>
    props.modelValue.includes(option.value)
  ).length;
  return selectedCount > 0 && selectedCount < filteredOptions.value.length;
});

const toggleDropdown = () => {
  if (props.disabled) return;

  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    searchQuery.value = "";

    nextTick(() => {
      const container = containerRef.value;
      const dropdown = dropdownRef.value;

      if (container && dropdown) {
        const rect = container.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const height = Math.min(spaceBelow - 20, 240); // 240px max height with buffer

        dropdownStyles.value = {
          width: `${rect.width}px`,
          maxHeight: `${height}px`,
        };
      }
    });
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = "";
};

const isSelected = (option) => props.modelValue.includes(option.value);

const toggleOption = (option) => {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(option.value);
  if (index > -1) {
    newValue.splice(index, 1);
  } else {
    newValue.push(option.value);
  }
  emit("update:modelValue", newValue);
  emit("change", newValue, selectedOptions.value);
};

const removeOption = (option) => {
  const newValue = props.modelValue.filter((v) => v !== option.value);
  emit("update:modelValue", newValue);
  emit("change", newValue, selectedOptions.value);
};

const clearAll = () => {
  emit("update:modelValue", []);
  emit("change", [], []);
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    const newValue = props.modelValue.filter(
      (value) => !filteredOptions.value.some((option) => option.value === value)
    );
    emit("update:modelValue", newValue);
    emit("change", newValue, selectedOptions.value);
  } else {
    const newValue = [
      ...new Set([
        ...props.modelValue,
        ...filteredOptions.value.map((option) => option.value),
      ]),
    ];
    emit("update:modelValue", newValue);
    emit("change", newValue, selectedOptions.value);
  }
};

const handleClickOutside = (event) => {
  if (
    isOpen.value &&
    containerRef.value &&
    !containerRef.value.contains(event.target)
  ) {
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
