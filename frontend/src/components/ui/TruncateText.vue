<template>
  <Tooltip :content="displayName" :disabled="false" position="top" :delay="200">
    <div
      :class="['line-clamp-1', textClass]"
      ref="textRef"
      :style="{ maxWidth: maxWidth }"
    >
      {{ displayName }}
    </div>
  </Tooltip>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import Tooltip from "./Tooltip.vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  maxLength: {
    type: Number,
    default: null,
  },
  maxWidth: {
    type: String,
    default: "100%",
  },
  textClass: {
    type: String,
    default: "text-sm text-gray-900",
  },
  showDot: {
    type: Boolean,
    default: false,
  },
});

const textRef = ref(null);
const shouldShowTooltip = ref(false);

const displayName = computed(() => {
  if (!props.name) return "";

  if (props.maxLength && props.name.length > props.maxLength) {
    return (
      props.name.substring(0, props.maxLength) + (props.showDot ? "..." : "")
    );
  }
  return props.name;
});

// Check if text is truncated and needs tooltip
const checkTruncation = async () => {
  await nextTick();
  // Add small delay to ensure DOM is fully rendered
  await new Promise((resolve) => setTimeout(resolve, 10));

  if (textRef.value && props.name) {
    const element = textRef.value;
    const isOverflowing = element.scrollWidth > element.clientWidth;
    const isTruncatedByLength =
      props.maxLength && props.name.length > props.maxLength;

    // Always show tooltip if text is longer than display
    const shouldShow =
      isOverflowing || isTruncatedByLength || props.name !== displayName.value;

    shouldShowTooltip.value = shouldShow;
  }
};

// Watch for changes in name or maxLength
watch([() => props.name, () => props.maxLength], () => {
  checkTruncation();
});

onMounted(() => {
  checkTruncation();
});
</script>
