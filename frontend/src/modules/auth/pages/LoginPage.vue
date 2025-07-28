<script setup>
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import Input from "@/components/ui/Input.vue";
import PasswordInput from "@/components/ui/PasswordInput.vue";
import Button from "@/components/ui/Button.vue";
import { useAuth } from "../composables/useAuth";
import { useI18n } from "vue-i18n";
import { ref, computed, watch, onMounted } from "vue";
import { usePageLoading } from "@/composables/usePageLoading";

const { t } = useI18n();

// Page loading management - Login page loads immediately
const { stopLoading } = usePageLoading("login-page");

const {
  loginUser,
  loginWithMicrosoft,
  loginWithGoogle,
  error: authError,
  isLoading,
} = useAuth();

// Create validation schema using Yup
const schema = toTypedSchema(
  yup.object({
    email: yup.string().required(t("common.required")),
    password: yup.string().required(t("common.required")),
  })
);

// Initialize form with validation - only validate when explicitly called
const { handleSubmit, errors, setFieldError, setErrors, validate } = useForm({
  validationSchema: schema,
  initialValues: {
    email: "",
    password: "",
  }, // Disable validation when model updates
});

// Form fields
const { value: email, errorMessage: emailError } = useField("email");
const { value: password, errorMessage: passwordError } = useField("password");

// Local state for form errors
const formError = ref(null);
const localLoading = ref(false);
const googleError = ref(null);

// Stop page loading when component is ready
onMounted(() => {
  stopLoading();
});

// Computed property for any loading state
const isAnyLoading = computed(() => {
  return localLoading.value || isLoading.value;
});

// Watch for auth errors and map them to form fields
watch(authError, (newError) => {
  if (newError) {
    const errorMessage = newError.message || newError;
    formError.value = errorMessage;

    // Map backend errors to form fields if possible
    if (errorMessage.toLowerCase().includes("email")) {
      setFieldError("email", errorMessage);
    } else if (errorMessage.toLowerCase().includes("password")) {
      setFieldError("password", errorMessage);
    } else if (errorMessage.toLowerCase().includes("credentials")) {
      setErrors({
        email: "Invalid credentials",
        password: "Invalid credentials",
      });
    }
  } else {
    formError.value = null;
  }
});

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

  localLoading.value = true;

  try {
    // Get current values from the form
    const values = {
      email: email.value,
      password: password.value,
    };

    await loginUser(values);
  } catch (error) {
    console.error("Login error:", error);
    formError.value = error.message || "Login failed";
  } finally {
    localLoading.value = false;
  }
};

// Microsoft login handler
const handleMicrosoftLogin = async () => {
  formError.value = null;
  localLoading.value = true;

  try {
    await loginWithMicrosoft();
  } catch (error) {
    console.error("Microsoft login failed:", error);
    formError.value = error.message || "Microsoft login failed";
  } finally {
    localLoading.value = false;
  }
};

// Google OAuth callback function
const handleGoogleCallback = async (response) => {
  formError.value = null;
  googleError.value = null;

  try {
    localLoading.value = true;

    // Check if we have the authorization code
    if (response.code) {
      // Send the authorization code to your backend
      await loginWithGoogle(response.code);
    } else {
      throw new Error("No authorization code received from Google");
    }
  } catch (error) {
    console.error("Google login failed:", error);
    googleError.value = error.message || "Google login failed";
    formError.value = error.message || "Google login failed";
  } finally {
    localLoading.value = false;
  }
};

// isAnyLoading is already defined as a computed property above
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
      <h1 class="text-center text-2xl font-semibold text-gray-900 mb-6">
        Login to <span class="text-[#0368FA] font-bold">Optivo</span>
      </h1>

      <form @submit="onSubmit" class="space-y-5">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ t("common.email") }} <span class="text-red-500">*</span>
          </label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="your-email@gmail.com"
            :error="!!emailError"
            :error-message="emailError"
            :disabled="isAnyLoading"
            class="w-full"
            required
            autocomplete="email"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ t("common.password") }} <span class="text-red-500">*</span>
          </label>
          <PasswordInput
            id="password"
            v-model="password"
            placeholder="**********"
            :error="!!passwordError"
            :error-message="passwordError"
            :disabled="isAnyLoading"
            required
            autocomplete="current-password"
          />
        </div>

        <div class="flex items-center justify-end text-sm">
          <router-link
            to="/forgot-password"
            class="text-[#0368FA] hover:underline"
            :class="{ 'pointer-events-none opacity-50': isAnyLoading }"
          >
            {{ t("auth.login.forgot_password") || "Forgot Password?" }}
          </router-link>
        </div>

        <Button
          type="submit"
          class="w-full bg-[#0368FA] hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          :disabled="isAnyLoading"
        >
          <span v-if="localLoading" class="flex items-center justify-center">
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
            {{ t("common.loading") || "Loading..." }}
          </span>
          <span v-else>Log In</span>
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

        <div class="flex w-full gap-4">
          <Button
            type="button"
            @click="handleMicrosoftLogin"
            class="w-full !text-gray-500 !px-0 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition"
            :disabled="isAnyLoading"
          >
            <div class="flex items-center justify-center gap-2">
              <img
                src="@/assets/images/microsoft-logo.png"
                alt="Microsoft"
                class="h-5 w-5"
              />
              <span v-if="isAnyLoading" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
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
              </span>
              <span v-else>Microsoft</span>
            </div>
          </Button>

          <GoogleLogin
            :callback="handleGoogleCallback"
            popupType="CODE"
            class="w-full"
          >
            <Button
              type="button"
              class="w-full bg-white !text-gray-500 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition"
              :disabled="isAnyLoading"
            >
              <div class="flex items-center justify-center gap-2">
                <img
                  src="@/assets/icons/google-logo.svg"
                  alt="Google"
                  class="h-5 w-5"
                />
                <span v-if="isAnyLoading" class="flex items-center">
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
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
                </span>
                <span v-else>Google</span>
              </div>
            </Button>
          </GoogleLogin>
        </div>
      </form>
    </div>
  </div>
</template>
