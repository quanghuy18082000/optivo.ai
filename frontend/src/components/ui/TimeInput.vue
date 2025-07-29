<template>
  <div class="space-y-1">
    <div class="relative">
      <input
        :id="id"
        v-model="timeInput.formattedDisplay.value"
        type="text"
        :class="[
          'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
          timeInput.isValid.value
            ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            : 'border-red-300 focus:ring-red-500 focus:border-red-500',
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white',
          inputClass,
        ]"
        :placeholder="placeholder"
        :disabled="disabled"
        @blur="handleBlur"
        @input="handleInput"
      />

      <!-- Format hint -->
      <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
        <div
          class="text-xs text-gray-400 cursor-help"
          :title="'Format: 2d3h24m (days/hours/minutes)'"
        >
          dhm
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div
      v-if="!timeInput.isValid.value && timeInput.errorMessage.value"
      class="text-sm text-red-600"
    >
      {{ timeInput.errorMessage.value }}
    </div>

    <!-- Helper text -->
    <div v-if="showHelper" class="text-xs text-gray-500">
      Examples: 2d (2 days), 3h30m (3 hours 30 minutes), 45m (45 minutes)
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted } from "vue";
import { useTimeFormat } from "@/composables/useTimeFormat";

const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  modelValue: {
    type: Number,
    default: 0,
  },
  placeholder: {
    type: String,
    default: "e.g., 2d3h24m",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: String,
    default: "",
  },
  showHelper: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "blur", "input"]);

const { createTimeInput } = useTimeFormat();
const timeInput = createTimeInput(props.modelValue);

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== timeInput.getMinutes()) {
      timeInput.setMinutes(newValue);
    }
  }
);

// Watch for internal changes and emit to parent
watch(
  () => timeInput.minutesValue.value,
  (newMinutes) => {
    if (newMinutes !== props.modelValue) {
      emit("update:modelValue", newMinutes);
    }
  }
);

// Initialize with prop value
onMounted(() => {
  if (props.modelValue) {
    timeInput.setMinutes(props.modelValue);
  }
});

const handleBlur = (event) => {
  timeInput.formatOnBlur();
  emit("blur", event);
};

const handleInput = (event) => {
  emit("input", event);
};

// Expose methods for parent component access
defineExpose({
  isValid: timeInput.isValid,
  getMinutes: timeInput.getMinutes,
  setMinutes: timeInput.setMinutes,
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
