<template>
  <!-- Modal Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-hidden"
    @click="handleOverlayClick"
  >
    <div
      class="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
    ></div>

    <!-- Modal Content -->
    <div
      class="absolute bg-white rounded-lg shadow-xl flex flex-col transition-all"
      :class="[sizeClasses[size], positionClasses[position]]"
      @click.stop
    >
      <!-- Modal Header (if showHeader is true) -->
      <div
        v-if="showHeader"
        class="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0"
      >
        <div class="flex items-center gap-3">
          <div
            v-if="icon"
            class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
          >
            <component :is="icon" class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 v-if="title" class="text-xl font-semibold text-gray-900">
              {{ title }}
            </h2>
            <p v-if="subtitle" class="text-sm text-gray-500">
              {{ subtitle }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Header Right Slot -->
          <slot name="header-right"></slot>

          <!-- Close Button -->
          <button
            v-if="showCloseButton"
            @click="closeModal"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 flex flex-col min-h-0">
        <slot></slot>
      </div>

      <!-- Modal Footer (if provided) -->
      <div
        v-if="$slots.footer"
        class="p-6 border-t border-gray-200 flex-shrink-0"
      >
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "medium",
    validator: (value) =>
      ["small", "medium", "large", "xlarge", "full"].includes(value),
  },
  position: {
    type: String,
    default: "center",
    validator: (value) => ["center", "top", "bottom"].includes(value),
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showCloseButton: {
    type: Boolean,
    default: true,
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true,
  },
  icon: {
    type: [String, Object],
    default: null,
  },
});

const emit = defineEmits(["close", "open"]);

const sizeClasses = {
  small:
    "inset-x-4 inset-y-8 md:inset-x-8 md:inset-y-16 lg:inset-x-32 lg:inset-y-24",
  medium: "inset-4 md:inset-8 lg:inset-16 xl:inset-24",
  large: "inset-4 md:inset-6 lg:inset-12 xl:inset-16",
  xlarge: "inset-2 md:inset-4 lg:inset-8",
  full: "inset-0",
};

const positionClasses = {
  center: "",
  top: "top-4 md:top-8 lg:top-16",
  bottom: "bottom-4 md:bottom-8 lg:bottom-16",
};

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    closeModal();
  }
};

const closeModal = () => {
  emit("close");
};

const handleEscapeKey = (event) => {
  if (event.key === "Escape" && props.isOpen) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscapeKey);
  if (props.isOpen) {
    document.body.style.overflow = "hidden";
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscapeKey);
  document.body.style.overflow = "";
});

// Watch for isOpen changes to handle body scroll
import { watch } from "vue";
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = "hidden";
      emit("open");
    } else {
      document.body.style.overflow = "";
    }
  }
);
</script>
