<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
      :class="[
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:ring-blue-500',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      ]"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
    />
    <span v-if="error" class="text-sm text-red-500">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

defineProps({
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
});

defineEmits(["update:modelValue", "blur"]);
</script>
