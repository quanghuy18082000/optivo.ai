<script setup>
import { ref } from "vue";
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
const { resetPassword, error: authError, isLoading } = useAuth();

const token = ref(route.query.token || "");

const schema = toTypedSchema(
  zod
    .object({
      email: zod
        .string({ required_error: t("common.required") })
        .email(t("email_invalid")),
      password: zod
        .string({ required_error: t("common.required") })
        .min(8, t("password_min", { min: 8 }))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          t("password_complexity")
        ),
      passwordConfirmation: zod.string({
        required_error: t("common.required"),
      }),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: t("password_mismatch"),
      path: ["passwordConfirmation"],
    })
);

const { handleSubmit } = useForm({ validationSchema: schema });

const { value: email, errorMessage: emailError } = useField("email");
const { value: password, errorMessage: passwordError } = useField("password");
const { value: passwordConfirmation, errorMessage: passwordConfirmationError } =
  useField("passwordConfirmation");

const successMessage = ref("");

const onSubmit = handleSubmit(async (values) => {
  try {
    await resetPassword({
      email: values.email,
      password: values.password,
      token: token.value,
    });
    successMessage.value = t("auth.reset_password.success_message");
  } catch (error) {
    console.error("Password reset failed:", error);
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-center text-2xl font-semibold text-gray-900 mb-6">
        {{ t("auth.reset_password.title") || "Reset Your Password" }}
      </h1>

      <p class="text-sm text-gray-600 mb-6 text-center">
        {{
          t("auth.reset_password.instructions") ||
          "Enter your email and a new password to reset your password."
        }}
      </p>

      <form @submit.prevent="onSubmit" class="space-y-4">
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
            class="w-full"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ t("auth.reset_password.new_password") }}
          </label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            :error="!!passwordError"
            :error-message="passwordError"
            class="w-full"
          />
          <p class="text-xs text-gray-500 mt-1">
            {{
              t("auth.reset_password.password_requirements") ||
              "Minimum 8 characters with at least one uppercase, one lowercase, one number and one special character"
            }}
          </p>
        </div>

        <div>
          <label
            for="passwordConfirmation"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ t("auth.reset_password.confirm_password") }}
          </label>
          <Input
            id="passwordConfirmation"
            v-model="passwordConfirmation"
            type="password"
            placeholder="••••••••"
            :error="!!passwordConfirmationError"
            :error-message="passwordConfirmationError"
            class="w-full"
          />
        </div>

        <Button
          type="submit"
          class="w-full bg-[#0368FA] hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          :disabled="isLoading"
        >
          {{
            isLoading
              ? t("common.processing") + "..."
              : t("auth.reset_password.reset_button") || "Reset Password"
          }}
        </Button>

        <div v-if="authError" class="text-center text-red-500 text-sm mt-3">
          {{ t("common.error", { msg: authError }) }}
        </div>

        <div
          v-if="successMessage"
          class="text-center text-green-500 text-sm mt-3"
        >
          {{ successMessage }}
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
