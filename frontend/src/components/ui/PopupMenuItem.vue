<template>
  <button
    :class="[
      'w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2',
      variant === 'default' ? 'text-gray-700 hover:bg-gray-100' : '',
      variant === 'danger' ? 'text-red-600 hover:bg-red-50' : '',
      variant === 'warning' ? 'text-amber-600 hover:bg-amber-50' : '',
      variant === 'success' ? 'text-green-600 hover:bg-green-50' : '',
      variant === 'info' ? 'text-blue-600 hover:bg-blue-50' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      className,
    ]"
    :disabled="disabled"
    @click="!disabled && $emit('click', $event)"
  >
    <slot name="icon"></slot>
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: "default",
    validator: (value) =>
      ["default", "danger", "warning", "success", "info"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  className: {
    type: String,
    default: "",
  },
});

defineEmits(["click"]);
</script>
