<template>
  <div
    ref="triggerRef"
    class="inline-block"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <!-- Trigger element -->
    <slot />
  </div>

  <!-- Tooltip Portal -->
  <Teleport to="body" :disabled="false">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="shouldShowTooltip"
        ref="tooltipRef"
        :class="[
          'fixed z-[99999] px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg',
          'max-w-xs break-words pointer-events-none',
        ]"
        :style="tooltipStyle"
        role="tooltip"
      >
        <!-- Tooltip content -->
        {{ content }}

        <!-- Arrow -->
        <div
          :class="[
            'absolute w-2 h-2 bg-gray-900 transform rotate-45',
            arrowClasses,
          ]"
        ></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import {
  ref,
  computed,
  nextTick,
  useSlots,
  onMounted,
  onBeforeUnmount,
} from "vue";

const slots = useSlots();

// Định nghĩa các props của component
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

// Refs
const triggerRef = ref(null);
const tooltipRef = ref(null);
const isVisible = ref(false);
const tooltipPosition = ref({ top: 0, left: 0 });

let showTimeout = null;
let hideTimeout = null;

// Calculate tooltip position
const calculatePosition = () => {
  if (!triggerRef.value) {
    return;
  }

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  let top = 0;
  let left = 0;

  switch (props.position) {
    case "top":
      top = triggerRect.top + scrollTop - 8; // 8px offset
      left = triggerRect.left + scrollLeft + triggerRect.width / 2;
      break;
    case "bottom":
      top = triggerRect.bottom + scrollTop + 8;
      left = triggerRect.left + scrollLeft + triggerRect.width / 2;
      break;
    case "left":
      top = triggerRect.top + scrollTop + triggerRect.height / 2;
      left = triggerRect.left + scrollLeft - 8;
      break;
    case "right":
      top = triggerRect.top + scrollTop + triggerRect.height / 2;
      left = triggerRect.right + scrollLeft + 8;
      break;
  }

  // Ensure tooltip is within viewport bounds
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Basic boundary checks
  if (left < 0) left = 10;
  if (left > viewportWidth - 200) left = viewportWidth - 210; // Assuming max tooltip width
  if (top < 0) top = 10;

  tooltipPosition.value = { top, left };
};

// Debug computed property
const shouldShowTooltip = computed(() => {
  const hasContent = !!(props.content || slots.default);
  const result = isVisible.value && hasContent;

  return result;
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

// Tooltip style with calculated position
const tooltipStyle = computed(() => {
  const baseStyle = {
    maxWidth: props.maxWidth,
    top: `${tooltipPosition.value.top}px`,
    left: `${tooltipPosition.value.left}px`,
    zIndex: 99999,
  };

  // Transform based on position for centering
  switch (props.position) {
    case "top":
      baseStyle.transform = "translate(-50%, -100%)";
      break;
    case "bottom":
      baseStyle.transform = "translate(-50%, 0)";
      break;
    case "left":
      baseStyle.transform = "translate(-100%, -50%)";
      break;
    case "right":
      baseStyle.transform = "translate(0, -50%)";
      break;
  }

  return baseStyle;
});

// Show tooltip function
const showTooltip = async () => {
  if (props.disabled) return;
  // Check if there's content to show
  if (!props.content && !slots.default) {
    return;
  }

  clearTimeout(hideTimeout);

  // Calculate position before showing
  calculatePosition();

  showTimeout = setTimeout(() => {
    console.log("Tooltip showing with position:", tooltipPosition.value);
    console.log("Tooltip style:", tooltipStyle.value);
    console.log(
      "DOM element will be created with shouldShowTooltip:",
      shouldShowTooltip.value
    );
    isVisible.value = true;

    // Force a re-render to ensure tooltip appears
    nextTick(() => {
      console.log(
        "Tooltip after nextTick, DOM element exists:",
        !!document.querySelector('[role="tooltip"]')
      );
    });
  }, props.delay);
};

// Hide tooltip function
const hideTooltip = () => {
  clearTimeout(showTimeout);
  hideTimeout = setTimeout(() => {
    isVisible.value = false;
  }, 100);
};

// Handle window resize and scroll
const handlePositionUpdate = () => {
  if (isVisible.value) {
    calculatePosition();
  }
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("resize", handlePositionUpdate);
  window.addEventListener("scroll", handlePositionUpdate, true);
});

onBeforeUnmount(() => {
  clearTimeout(showTimeout);
  clearTimeout(hideTimeout);
  window.removeEventListener("resize", handlePositionUpdate);
  window.removeEventListener("scroll", handlePositionUpdate, true);
});
</script>

<style scoped>
/* Các kiểu CSS cho tooltip */
.tooltip-content {
  max-width: 20rem;
  word-wrap: break-word;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
