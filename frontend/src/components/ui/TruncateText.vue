<template>
  <Tooltip :content="fullName" :disabled="!shouldShowTooltip" position="top">
    <span :class="['truncate block', textClass]" ref="textRef">
      {{ displayName }}
    </span>
  </Tooltip>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
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

const fullName = computed(() => props.name);

const displayName = computed(() => {
  if (props.maxLength && props.name.length > props.maxLength) {
    return props.name.substring(0, props.maxLength) + "...";
  }
  return props.name;
});

// Check if text is truncated and needs tooltip
const checkTruncation = async () => {
  await nextTick();
  if (textRef.value) {
    const element = textRef.value;
    shouldShowTooltip.value = element.scrollWidth > element.clientWidth;
  }
};

onMounted(() => {
  checkTruncation();
});
</script>
