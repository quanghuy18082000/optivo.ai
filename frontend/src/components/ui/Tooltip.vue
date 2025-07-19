<template>
  <div
    class="relative inline-block"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <!-- Trigger element -->
    <slot />

    <!-- Tooltip -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible && (content || $slots.tooltip)"
        :class="[
          'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm',
          'max-w-xs break-words',
          positionClasses,
        ]"
        :style="tooltipStyle"
        role="tooltip"
      >
        <!-- Tooltip content -->
        <slot name="tooltip">
          {{ content }}
        </slot>

        <!-- Arrow -->
        <div
          :class="[
            'absolute w-2 h-2 bg-gray-900 transform rotate-45',
            arrowClasses,
          ]"
        ></div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  position: {
    type: String,
    default: "top",
    validator: (value) => ["top", "bottom", "left", "right"].includes(value),
  },
  delay: {
    type: Number,
    default: 300,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: String,
    default: "20rem",
  },
});

const isVisible = ref(false);
let showTimeout = null;
let hideTimeout = null;

const positionClasses = computed(() => {
  const positions = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };
  return positions[props.position];
});

const arrowClasses = computed(() => {
  const arrows = {
    top: "top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2",
    left: "left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2",
    right: "right-full top-1/2 transform -translate-y-1/2 translate-x-1/2",
  };
  return arrows[props.position];
});

const tooltipStyle = computed(() => ({
  maxWidth: props.maxWidth,
}));

const showTooltip = () => {
  if (props.disabled || (!props.content && !slots.tooltip)) return;

  clearTimeout(hideTimeout);
  showTimeout = setTimeout(() => {
    isVisible.value = true;
  }, props.delay);
};

const hideTooltip = () => {
  clearTimeout(showTimeout);
  hideTimeout = setTimeout(() => {
    isVisible.value = false;
  }, 100);
};

// Cleanup timeouts on unmount
import { onBeforeUnmount } from "vue";
onBeforeUnmount(() => {
  clearTimeout(showTimeout);
  clearTimeout(hideTimeout);
});
</script>
