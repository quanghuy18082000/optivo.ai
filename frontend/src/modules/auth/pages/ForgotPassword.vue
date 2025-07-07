<script setup>
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "../composables/useAuth";
import { ref } from "vue";

const { t } = useI18n();
const { forgotPassword, error: authError, success, isLoading } = useAuth();

// Create validation schema using Yup
const schema = toTypedSchema(
  yup.object({
    email: yup
      .string()
      .required(t("common.required"))
      .email(t("common.invalid_email")),
  })
);

// Initialize form with validation - only validate when explicitly called
const { handleSubmit, errors, validate } = useForm({
  validationSchema: schema,
  validateOnMount: false,
  validateOnBlur: false,
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false,
});

const { value: email, errorMessage: emailError } = useField("email");
const formError = ref(null);

// Form submission handler - manually validate on submit
const onSubmit = async (event) => {
  event.preventDefault();
  formError.value = null;

  // Manually trigger validation when the form is submitted
  const validationResult = await validate();

  // Only proceed if validation passes
  if (!validationResult.valid) {
    return;
  }

  // Get current values from the form
  forgotPassword(email.value);
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-center text-2xl font-semibold text-gray-900 mb-6">
        {{ t("auth.forgot.title") }}
      </h1>

      <p class="text-sm text-gray-600 mb-6 text-center">
        {{ t("auth.forgot.description") }}
      </p>

      <form @submit="onSubmit" class="space-y-5">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ t("common.email") }}
          </label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="your-email@gmail.com"
            :error="!!emailError"
            :error-message="emailError"
            :disabled="isLoading"
            class="w-full"
          />
        </div>

        <Button
          type="submit"
          class="w-full bg-[#0368FA] hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="flex items-center justify-center">
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ t("common.loading") || "Sending..." }}
          </span>
          <span v-else>
            {{ t("auth.forgot.send_link") || "Send Reset Link" }}
          </span>
        </Button>

        <div
          v-if="authError || formError"
          class="text-center text-red-500 text-sm mt-3 p-2 bg-red-50 rounded-md border border-red-200"
        >
          {{ t("auth.forgot.error", { msg: authError || formError }) }}
        </div>

        <div class="text-center text-sm mt-4">
          <router-link to="/login" class="text-[#0368FA] hover:underline">
            ← {{ t("auth.forgot.back_to_login") || "Back to login" }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>
