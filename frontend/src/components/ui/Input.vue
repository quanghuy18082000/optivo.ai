<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :min="min"
        :max="max"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
        :class="[
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
          hasAppend ? 'pr-10' : '',
        ]"
        @input="emit('update:modelValue', $event.target.value)"
        @blur="emit('blur', $event)"
      />
      <!-- Append slot for icons like eye icon -->
      <div
        v-if="$slots.append"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <slot name="append"></slot>
      </div>
    </div>
    <span v-if="error" class="text-sm text-red-500">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup>
import { computed, useSlots } from "vue";

const props = defineProps({
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`,
  },
  type: {
    type: String,
    default: "text",
    validator: (value) =>
      ["text", "email", "password", "number", "tel"].includes(value),
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  modelValue: {
    type: [String, Number],
    default: "",
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
  min: {
    type: [String, Number],
    default: undefined,
  },
  max: {
    type: [String, Number],
    default: undefined,
  },
});

const emit = defineEmits(["update:modelValue", "blur"]);

// Check if append slot is provided
const slots = useSlots();
const hasAppend = computed(() => !!slots.append);
</script>

<style scoped>
/* Style for number inputs to prevent overlap */
input[type="number"] {
  min-width: 70px;
  width: 100%;
}

/* Hide the spinner buttons for number inputs */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* For Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
