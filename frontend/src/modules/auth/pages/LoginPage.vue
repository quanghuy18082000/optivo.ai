<script setup>
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import Checkbox from "@/components/ui/Checkbox.vue";
import { useAuth } from "../composables/useAuth";
import { useI18n } from "vue-i18n";
import { ref } from "vue";

const { t } = useI18n();
const {
  loginUser,
  loginWithMicrosoft,
  loginWithGoogle,
  error: authError,
} = useAuth();

const schema = toTypedSchema(
  zod.object({
    username: zod
      .string({ required_error: t("common.required") })
      .email(t("common.invalid_email")),
    password: zod
      .string({ required_error: t("common.required") })
      .min(6, t("common.min_length", { length: 6 })),
  })
);

const { handleSubmit } = useForm({ validationSchema: schema });

const { value: username, errorMessage: usernameError } = useField("username");
const { value: password, errorMessage: passwordError } = useField("password");
const { value: rememberMe } = useField("rememberMe");

const isLoading = ref(false);

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  await loginUser(values);
  isLoading.value = false;
});

const handleMicrosoftLogin = async () => {
  isLoading.value = true;
  try {
    await loginWithMicrosoft();
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = async () => {
  isLoading.value = true;
  try {
    await loginWithGoogle();
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-sm bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-center text-2xl font-semibold text-gray-900 mb-6">
        Login to <span class="text-[#0368FA] font-bold">Optivo</span>
      </h1>

      <form @submit.prevent="onSubmit" class="space-y-5">
        <div>
          <label
            for="username"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ t("common.email") }}
          </label>
          <Input
            id="username"
            v-model="username"
            type="email"
            placeholder="your-email@gmail.com"
            :error="!!usernameError"
            :error-message="usernameError"
            class="w-full"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ t("common.password") }}
          </label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="**********"
            :error="!!passwordError"
            :error-message="passwordError"
            class="w-full"
          />
        </div>

        <div class="flex items-center justify-between text-sm">
          <Checkbox
            id="rememberMe"
            v-model="rememberMe"
            :label="t('auth.login.remember_me')"
            class="text-[#0368FA]"
          />
          <router-link
            to="/forgot-password"
            class="text-[#0368FA] hover:underline"
          >
            {{ t("auth.login.forgot_password") || "Forgot Password?" }}
          </router-link>
        </div>

        <Button
          type="submit"
          class="w-full bg-[#0368FA] hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          :loading="isLoading"
        >
          Log In
        </Button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">
              {{ t("auth.login.or_continue_with") }}
            </span>
          </div>
        </div>

        <div class="flex gap-4">
          <Button
            type="button"
            @click="handleMicrosoftLogin"
            class="w-full flex items-center justify-center !text-gray-500 gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-md transition"
            :loading="isLoading"
          >
            <img
              src="@/assets/images/microsoft-logo.png"
              alt="Microsoft"
              class="h-5 w-5"
            />
            Microsoft
          </Button>
          <Button
            type="button"
            @click="handleGoogleLogin"
            class="w-full flex items-center justify-center gap-2 bg-white !text-gray-500 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-md transition"
            :loading="isLoading"
          >
            <img
              src="@/assets/icons/google-logo.svg"
              alt="Google"
              class="h-5 w-5"
            />
            Google
          </Button>
        </div>

        <div v-if="authError" class="text-center text-red-500 text-sm mt-3">
          {{ t("common.error", { msg: authError }) }}
        </div>
      </form>
    </div>
  </div>
</template>
