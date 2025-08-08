<template>
  <div
    :class="[
      'animate-spin rounded-full border-2 border-current border-t-transparent',
      sizeClasses,
    ]"
  ></div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  size: {
    type: String,
    default: "md",
    validator: (value) => ["xs", "sm", "md", "lg"].includes(value),
  },
});

const sizeClasses = computed(() => {
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  return sizes[props.size];
});
</script>
