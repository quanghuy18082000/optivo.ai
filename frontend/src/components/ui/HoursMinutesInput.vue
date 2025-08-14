<script setup>
import { computed } from "vue";
import Input from "./Input.vue";

const props = defineProps({
  hours: {
    type: [Number, String],
    default: null,
  },
  minutes: {
    type: [Number, String],
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: "",
  },
  hoursError: {
    type: Boolean,
    default: false,
  },
  hoursErrorMessage: {
    type: String,
    default: "",
  },
  minutesError: {
    type: Boolean,
    default: false,
  },
  minutesErrorMessage: {
    type: String,
    default: "",
  },
  class: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:hours", "update:minutes", "blur"]);

// Internal values for two-way binding
const hoursValue = computed({
  get: () => props.hours,
  set: (value) => emit("update:hours", value),
});

const minutesValue = computed({
  get: () => props.minutes,
  set: (value) => emit("update:minutes", value),
});

// Handle blur events
const handleHoursBlur = () => {
  emit("blur", "hours");
};

const handleMinutesBlur = () => {
  emit("blur", "minutes");
};

// Check if there's any error to show
const hasError = computed(() => {
  return props.error || props.hoursError || props.minutesError;
});

// Get the error message to display (prioritize general error, then specific field errors)
const displayErrorMessage = computed(() => {
  if (props.errorMessage) return props.errorMessage;
  if (props.hoursErrorMessage) return props.hoursErrorMessage;
  if (props.minutesErrorMessage) return props.minutesErrorMessage;
  return "";
});
</script>

<template>
  <div :class="['hours-minutes-input', props.class]">
    <div class="flex gap-2 items-start">
      <!-- Hours Input -->
      <div class="flex-1">
        <Input
          v-model.number="hoursValue"
          type="number"
          placeholder="00"
          :min="0"
          :max="23"
          :disabled="disabled"
          :error="hasError"
          class="w-full text-center"
          @blur="handleHoursBlur"
        />
      </div>

      <!-- Separator -->
      <div class="flex items-center pt-2">
        <span class="text-gray-400 font-medium text-lg">:</span>
      </div>

      <!-- Minutes Input -->
      <div class="flex-1">
        <Input
          v-model.number="minutesValue"
          type="number"
          placeholder="00"
          :min="0"
          :max="59"
          :disabled="disabled"
          :error="hasError"
          class="w-full text-center"
          @blur="handleMinutesBlur"
        />
      </div>
    </div>

    <!-- General Error Message (for combined validation like "Enter time worked") -->
    <div v-if="error && errorMessage" class="text-red-500 text-sm text-left">
      {{ displayErrorMessage }}
    </div>
  </div>
</template>

<style scoped>
.hours-minutes-input {
  @apply w-full;
}

/* Hide number input arrows for cleaner look */
.hours-minutes-input :deep(input[type="number"]) {
  -moz-appearance: textfield;
}

.hours-minutes-input :deep(input[type="number"]::-webkit-outer-spin-button),
.hours-minutes-input :deep(input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

/* Ensure consistent height for both inputs */
.hours-minutes-input :deep(.input-container) {
  @apply h-full;
}
</style>
