<template>
  <div
    class="inline-flex items-center justify-center rounded-full bg-gray-500 overflow-hidden"
    :class="sizeClasses"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover"
      @error="handleImageError"
    />
    <span v-else class="text-white font-medium" :class="textSizeClasses">
      {{ initials }}
    </span>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  src: {
    type: String,
    default: null,
  },
  alt: {
    type: String,
    default: "Avatar",
  },
  name: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg", "xl"].includes(value),
  },
});

const imageError = ref(false);

const sizeClasses = computed(() => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };
  return sizes[props.size];
});

const textSizeClasses = computed(() => {
  const sizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };
  return sizes[props.size];
});

const initials = computed(() => {
  if (!props.name) return "?";
  return props.name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const handleImageError = () => {
  imageError.value = true;
};
</script>
