<template>
  <div ref="triggerRef" class="inline-block">
    <slot name="trigger" :toggle="toggle" :is-open="isOpen"></slot>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="popupRef"
        class="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
        :class="[
          width === 'auto' ? '' : `w-${width}`,
          minWidth ? `min-w-[${minWidth}]` : '',
          maxWidth ? `max-w-[${maxWidth}]` : 'max-w-[calc(100vw-2rem)]',
        ]"
        :style="popupStyle"
      >
        <slot></slot>
      </div>
    </Teleport>

    <!-- Backdrop for closing when clicking outside -->
    <Teleport to="body">
      <div
        v-if="isOpen && closeOnClickOutside"
        class="fixed inset-0 z-40"
        @click="close"
      ></div>
    </Teleport>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  placement: {
    type: String,
    default: "bottom-start",
    validator: (value) =>
      [
        "top",
        "top-start",
        "top-end",
        "right",
        "right-start",
        "right-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
      ].includes(value),
  },
  offset: {
    type: Number,
    default: 8,
  },
  width: {
    type: String,
    default: "48",
  },
  minWidth: {
    type: String,
    default: "12rem",
  },
  maxWidth: {
    type: String,
    default: null,
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  closeOnSelect: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "open", "close"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const triggerRef = ref(null);
const popupRef = ref(null);
const popupStyle = ref({});

// Toggle popup visibility
const toggle = (event) => {
  if (event) {
    event.stopPropagation();
  }

  if (isOpen.value) {
    close();
  } else {
    open();
  }
};

// Open popup
const open = () => {
  isOpen.value = true;
  emit("open");

  // Calculate position after the popup is rendered
  nextTick(() => {
    updatePosition();
  });
};

// Close popup
const close = () => {
  isOpen.value = false;
  emit("close");
};

// Calculate and update popup position
const updatePosition = () => {
  if (!triggerRef.value || !popupRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const popupRect = popupRef.value.getBoundingClientRect();

  // Default position (bottom-start)
  let top = triggerRect.bottom + props.offset;
  let left = triggerRect.left;

  // Adjust based on placement
  switch (props.placement) {
    case "top":
      top = triggerRect.top - popupRect.height - props.offset;
      left = triggerRect.left + triggerRect.width / 2 - popupRect.width / 2;
      break;
    case "top-start":
      top = triggerRect.top - popupRect.height - props.offset;
      left = triggerRect.left;
      break;
    case "top-end":
      top = triggerRect.top - popupRect.height - props.offset;
      left = triggerRect.right - popupRect.width;
      break;
    case "right":
      top = triggerRect.top + triggerRect.height / 2 - popupRect.height / 2;
      left = triggerRect.right + props.offset;
      break;
    case "right-start":
      top = triggerRect.top;
      left = triggerRect.right + props.offset;
      break;
    case "right-end":
      top = triggerRect.bottom - popupRect.height;
      left = triggerRect.right + props.offset;
      break;
    case "bottom":
      top = triggerRect.bottom + props.offset;
      left = triggerRect.left + triggerRect.width / 2 - popupRect.width / 2;
      break;
    case "bottom-start":
      top = triggerRect.bottom + props.offset;
      left = triggerRect.left;
      break;
    case "bottom-end":
      top = triggerRect.bottom + props.offset;
      left = triggerRect.right - popupRect.width;
      break;
    case "left":
      top = triggerRect.top + triggerRect.height / 2 - popupRect.height / 2;
      left = triggerRect.left - popupRect.width - props.offset;
      break;
    case "left-start":
      top = triggerRect.top;
      left = triggerRect.left - popupRect.width - props.offset;
      break;
    case "left-end":
      top = triggerRect.bottom - popupRect.height;
      left = triggerRect.left - popupRect.width - props.offset;
      break;
  }

  // Ensure popup stays within viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Adjust horizontal position if needed
  if (left < 10) {
    left = 10;
  } else if (left + popupRect.width > viewportWidth - 10) {
    left = viewportWidth - popupRect.width - 10;
  }

  // Adjust vertical position if needed
  if (top < 10) {
    top = 10;
  } else if (top + popupRect.height > viewportHeight - 10) {
    top = viewportHeight - popupRect.height - 10;
  }

  // Update popup style
  popupStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
};

// Handle window resize
const handleResize = () => {
  if (isOpen.value) {
    updatePosition();
  }
};

// Handle escape key press
const handleKeyDown = (event) => {
  if (props.closeOnEsc && isOpen.value && event.key === "Escape") {
    close();
  }
};

// Handle click on popup content
const handleContentClick = (event) => {
  if (props.closeOnSelect) {
    // Check if the clicked element is a button or has a role="button"
    const isButton =
      event.target.tagName === "BUTTON" ||
      event.target.closest("button") ||
      event.target.getAttribute("role") === "button" ||
      event.target.closest('[role="button"]');

    if (isButton) {
      close();
    }
  }
};

// Watch for changes in modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      nextTick(() => {
        updatePosition();
      });
    }
  }
);

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleResize, true);
  document.addEventListener("keydown", handleKeyDown);

  if (popupRef.value) {
    popupRef.value.addEventListener("click", handleContentClick);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("scroll", handleResize, true);
  document.removeEventListener("keydown", handleKeyDown);

  if (popupRef.value) {
    popupRef.value.removeEventListener("click", handleContentClick);
  }
});
</script>
