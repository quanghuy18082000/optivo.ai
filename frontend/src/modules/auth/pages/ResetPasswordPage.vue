<script setup>
import { ref, onMounted } from "vue";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import { useAuth } from "../composables/useAuth";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const { resetPassword, error: authError, isLoading, success } = useAuth();

const token = ref("");

onMounted(() => {
  // Get token from URL params
  token.value = route.query.token || "";
  if (!token.value) {
    console.error("No reset token found in URL");
  }
});

const schema = toTypedSchema(
  zod
    .object({
      password: zod
        .string({ required_error: t("common.required") })
        .min(8, t("common.min_length", { min: 8 }))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          t("auth.password_complexity") || "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),
      confirmPassword: zod.string({
        required_error: t("common.required"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.password_mismatch") || "Passwords do not match",
      path: ["confirmPassword"],
    })
);

const { handleSubmit } = useForm({ validationSchema: schema });

const { value: password, errorMessage: passwordError } = useField("password");
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField("confirmPassword");

const onSubmit = handleSubmit(async (values) => {
  if (!token.value) {
    console.error("No reset token available");
    return;
  }

  resetPassword({
    token: token.value,
    password: values.password,
    confirmPassword: values.confirmPassword,
  });
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-center text-2xl font-semibold text-gray-900 mb-6">
        {{ t("auth.reset_password.title") || "Reset Your Password" }}
      </h1>

      <p class="text-sm text-gray-600 mb-6 text-center">
        {{ t("auth.reset_password.instructions") || "Enter a new password to reset your password." }}
      </p>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ t("auth.reset_password.new_password") || "New Password" }}
          </label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            :error="!!passwordError"
            :error-message="passwordError"
            :disabled="isLoading"
            class="w-full"
          />
          <p class="text-xs text-gray-500 mt-1">
            {{ t("auth.reset_password.password_requirements") || "Minimum 8 characters with at least one uppercase, one lowercase, one number and one special character" }}
          </p>
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ t("auth.reset_password.confirm_password") || "Confirm Password" }}
          </label>
          <Input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            :error="!!confirmPasswordError"
            :error-message="confirmPasswordError"
            :disabled="isLoading"
            class="w-full"
          />
        </div>

        <Button
          type="submit"
          class="w-full bg-[#0368FA] hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          :disabled="isLoading || !token"
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
            {{ t("auth.reset_password.processing") || "Processing..." }}
          </span>
          <span v-else>
            {{ t("auth.reset_password.reset_button") || "Reset Password" }}
          </span>
        </Button>

        <div v-if="!token" class="text-center text-red-500 text-sm mt-3">
          Invalid or missing reset token. Please request a new password reset link.
        </div>

        <div v-if="authError" class="text-center text-red-500 text-sm mt-3">
          {{ t("common.error", { msg: authError }) }}
        </div>

        <div v-if="success" class="text-center text-green-500 text-sm mt-3">
          {{ t("auth.reset_password.success_message") || "Your password has been successfully reset! Redirecting to login..." }}
        </div>
      </form>

      <div class="mt-6 text-center text-sm">
        <router-link to="/login" class="text-[#0368FA] hover:underline">
          {{ t("auth.reset_password.back_to_login") || "Back to Login" }}
        </router-link>
      </div>
    </div>
  </div>
</template>