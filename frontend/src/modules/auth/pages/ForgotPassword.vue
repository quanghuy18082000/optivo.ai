<script setup>
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "../composables/useAuth";

const { t } = useI18n();
const { forgotPassword, error: authError, success } = useAuth();

const schema = toTypedSchema(
  zod.object({
    email: zod
      .string({ required_error: t("common.required") })
      .email(t("username_invalid")),
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
            class="w-full"
          />
        </div>

        <Button
          type="submit"
          class="w-full bg-[#0368FA] hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
        >
          {{ t("auth.forgot.send_link") || "Send Reset Link" }}
        </Button>

        <div v-if="authError" class="text-center text-red-500 text-sm mt-3">
          {{ t("auth.forgot.error", { msg: authError }) }}
        </div>

        <div v-if="success" class="text-center text-green-600 text-sm mt-3">
          {{
            t("auth.forgot.send_link") || "Password reset link has been sent!"
          }}
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
