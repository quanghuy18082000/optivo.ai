<template>
  <div class="flex items-center gap-2">
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
      :class="[error ? 'border-red-500' : 'border-gray-300']"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium text-gray-700"
      :class="[
        disabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer',
      ]"
    >
      {{ label }}
    </label>
    <span v-if="error" class="text-sm text-red-500">{{ errorMessage }}</span>
  </div>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    default: () => `checkbox-${Math.random().toString(36).substr(2, 9)}`,
  },
  label: {
    type: String,
    default: "",
  },
  modelValue: {
    type: Boolean,
    default: false,
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

defineEmits(["update:modelValue"]);
</script>
