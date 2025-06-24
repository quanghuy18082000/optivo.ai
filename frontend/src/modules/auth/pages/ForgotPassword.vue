<script setup>
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "../composables/useAuth";

const { t } = useI18n();
const { forgotPassword, error: authError, success, isLoading } = useAuth();

const schema = toTypedSchema(
  zod.object({
    email: zod
      .string({ required_error: t("common.required") })
      .email(t("common.invalid_email")),
  })
);

const { handleSubmit } = useForm({ validationSchema: schema });

const { value: email, errorMessage: emailError } = useField("email");

const onSubmit = handleSubmit((values) => {
  forgotPassword(values.email);
});
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

      <form @submit.prevent="onSubmit" class="space-y-5">
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

        <div v-if="authError" class="text-center text-red-500 text-sm mt-3">
          {{ t("auth.forgot.error", { msg: authError }) }}
        </div>

        <div v-if="success" class="text-center text-green-600 text-sm mt-3">
          {{ t("auth.forgot.success") || "Password reset link has been sent to your email!" }}
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