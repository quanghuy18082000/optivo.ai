<template>
  <div class="relative">
    <input
      :id="id"
      type="date"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
      :class="[
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:ring-blue-500',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      ]"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
    />
    <span v-if="error" class="text-sm text-red-500 mt-1 block">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    default: () => `datepicker-${Math.random().toString(36).substr(2, 9)}`,
  },
  placeholder: {
    type: String,
    default: "dd/mm/yyyy",
  },
  modelValue: {
    type: String,
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
