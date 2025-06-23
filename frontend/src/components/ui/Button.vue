<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex justify-center items-center px-4 py-2 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
    :class="[
      variantStyles[variant],
      sizeStyles[size],
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: "button",
    validator: (value) => ["button", "submit", "reset"].includes(value),
  },
  variant: {
    type: String,
    default: "primary",
    validator: (value) => ["primary", "secondary", "danger"].includes(value),
  },
  size: {
    type: String,
    default: "medium",
    validator: (value) => ["small", "medium", "large"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);

const variantStyles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
};

const sizeStyles = {
  small: "text-sm px-3 py-1.5",
  medium: "text-base px-4 py-2",
  large: "text-lg px-6 py-3",
};
</script>
