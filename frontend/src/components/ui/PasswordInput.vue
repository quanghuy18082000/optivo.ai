<template>
  <Input
    :id="id"
    :type="showPassword ? 'text' : 'password'"
    v-model="inputValue"
    :placeholder="placeholder"
    :error="error"
    :error-message="errorMessage"
    :disabled="disabled"
    :label="label"
    @blur="emit('blur', $event)"
  >
    <template #append>
      <button
        type="button"
        @click="togglePasswordVisibility"
        class="text-gray-500 hover:text-gray-700 focus:outline-none"
        :disabled="disabled"
        :title="showPassword ? 'Hide password' : 'Show password'"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        tabindex="-1"
      >
        <!-- Eye open icon (when password is hidden) -->
        <svg
          v-if="!showPassword"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <!-- Eye closed icon (when password is visible) -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
      </button>
    </template>
  </Input>
</template>

<script setup>
import { ref, computed } from "vue";
import Input from "./Input.vue";

const props = defineProps({
  id: {
    type: String,
    default: () => `password-input-${Math.random().toString(36).substr(2, 9)}`,
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "••••••••",
  },
  modelValue: {
    type: String,
    default: "",
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
    default: "This field has an error",
  },
});

const emit = defineEmits(["update:modelValue", "blur"]);

// Create a computed property for two-way binding
const inputValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

// Password visibility state
const showPassword = ref(false);

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>
