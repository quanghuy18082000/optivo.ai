<template>
  <div class="space-y-2">
    <!-- Select All Option -->
    <div
      v-if="showSelectAll && options.length > 0"
      class="border-b border-gray-200 pb-2 mb-2"
    >
      <Checkbox
        :id="`${groupId}-select-all`"
        :model-value="isAllSelected"
        :indeterminate="isIndeterminate"
        :label="selectAllLabel"
        :disabled="disabled"
        @update:model-value="toggleSelectAll"
      />
    </div>

    <!-- Individual Options -->
    <div class="space-y-2">
      <Checkbox
        v-for="option in options"
        :key="option.value"
        :id="`${groupId}-${option.value}`"
        :model-value="isOptionSelected(option.value)"
        :label="option.label"
        :disabled="disabled || option.disabled"
        @update:model-value="(checked) => toggleOption(option.value, checked)"
      />
    </div>

    <!-- No Options Message -->
    <div v-if="options.length === 0" class="text-gray-500 text-sm py-2">
      {{ noOptionsMessage }}
    </div>

    <!-- Error Message -->
    <p v-if="error && errorMessage" class="mt-2 text-sm text-red-600">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Checkbox from "./Checkbox.vue";

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
    validator: (options) => {
      return options.every(
        (option) =>
          typeof option === "object" &&
          option.hasOwnProperty("value") &&
          option.hasOwnProperty("label")
      );
    },
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
  showSelectAll: {
    type: Boolean,
    default: false,
  },
  selectAllLabel: {
    type: String,
    default: "Select All",
  },
  noOptionsMessage: {
    type: String,
    default: "No options available",
  },
  groupId: {
    type: String,
    default: () => `checkbox-group-${Math.random().toString(36).substr(2, 9)}`,
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "change"]);

// Computed
const isAllSelected = computed(() => {
  if (props.options.length === 0) return false;

  const availableOptions = props.options.filter((option) => !option.disabled);
  if (availableOptions.length === 0) return false;

  return availableOptions.every((option) =>
    props.modelValue.includes(option.value)
  );
});

const isIndeterminate = computed(() => {
  if (props.options.length === 0) return false;

  const availableOptions = props.options.filter((option) => !option.disabled);
  const selectedCount = availableOptions.filter((option) =>
    props.modelValue.includes(option.value)
  ).length;

  return selectedCount > 0 && selectedCount < availableOptions.length;
});

// Methods
const isOptionSelected = (value) => {
  return props.modelValue.includes(value);
};

const toggleOption = (value, checked) => {
  let newValue = [...props.modelValue];

  if (checked) {
    // Add value if not already present
    if (!newValue.includes(value)) {
      newValue.push(value);
    }
  } else {
    // Remove value
    newValue = newValue.filter((v) => v !== value);
  }

  // Emit updates
  emit("update:modelValue", newValue);

  // Calculate selected options for change event
  const selectedOptions = props.options.filter((option) =>
    newValue.includes(option.value)
  );
  emit("change", newValue, selectedOptions);
};

const toggleSelectAll = (checked) => {
  const availableOptions = props.options.filter((option) => !option.disabled);

  let newValue;
  if (checked) {
    // Select all available options
    const availableValues = availableOptions.map((option) => option.value);
    newValue = [...new Set([...props.modelValue, ...availableValues])];
  } else {
    // Deselect all available options
    const availableValues = availableOptions.map((option) => option.value);
    newValue = props.modelValue.filter(
      (value) => !availableValues.includes(value)
    );
  }

  // Emit updates
  emit("update:modelValue", newValue);

  // Calculate selected options for change event
  const selectedOptions = props.options.filter((option) =>
    newValue.includes(option.value)
  );
  emit("change", newValue, selectedOptions);
};
</script>
