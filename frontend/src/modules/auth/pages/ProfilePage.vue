<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Your Profile</h1>
        <span class="text-sm text-gray-500">Manage your account settings</span>
      </div>
    </template>

    <div class="p-6 bg-white rounded-lg shadow-md w-full mx-auto">
      <div v-if="isLoading" class="flex justify-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        ></div>
      </div>

      <div v-else class="space-y-8">
        <!-- Profile Header -->
        <div class="flex flex-col md:flex-row md:items-center gap-6">
          <div class="flex-shrink-0">
            <div
              v-if="userAvatar"
              class="w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-white"
            >
              <img
                :src="userAvatar"
                alt="User avatar"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <span class="text-3xl font-medium text-white">{{
                userInitials
              }}</span>
            </div>
          </div>

          <div class="flex-grow">
            <h2 class="text-2xl font-bold text-gray-900">{{ userName }}</h2>
            <p class="text-gray-600">{{ userEmail }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                @click="openChangePasswordModal"
                class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Change Password
              </button>
            </div>
          </div>
        </div>

        <!-- Profile Information -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              class="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Name</label
              >
              <div class="text-gray-900 font-medium">{{ userName }}</div>
            </div>

            <div
              class="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Email</label
              >
              <div class="text-gray-900 font-medium">{{ userEmail }}</div>
            </div>

            <div
              class="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Role</label
              >
              <div class="text-gray-900 font-medium">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ userRole }}
                </span>
              </div>
            </div>

            <div
              class="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Account Created</label
              >
              <div class="text-gray-900 font-medium">{{ userCreatedAt }}</div>
            </div>

            <div
              v-if="userPhone"
              class="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Phone</label
              >
              <div class="text-gray-900 font-medium">{{ userPhone }}</div>
            </div>

            <div
              v-if="userAddress"
              class="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Address</label
              >
              <div class="text-gray-900 font-medium">{{ userAddress }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="closePasswordModal"
        ></div>

        <!-- Modal panel -->
        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <div class="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              @click="closePasswordModal"
              class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span class="sr-only">Close</span>
              <svg
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3
                  class="text-lg leading-6 font-medium text-gray-900"
                  id="modal-title"
                >
                  Change Password
                </h3>
                <div class="mt-4">
                  <form @submit.prevent="changePassword" class="space-y-6">
                    <div class="grid grid-cols-1 gap-4">
                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 mb-1"
                          >Current Password</label
                        >
                        <div class="relative">
                          <input
                            v-model="passwordForm.currentPassword"
                            :type="showCurrentPassword ? 'text' : 'password'"
                            class="w-full p-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your current password"
                          />
                          <button
                            type="button"
                            @click="showCurrentPassword = !showCurrentPassword"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                            :title="
                              showCurrentPassword
                                ? 'Hide password'
                                : 'Show password'
                            "
                            :aria-label="
                              showCurrentPassword
                                ? 'Hide password'
                                : 'Show password'
                            "
                            tabindex="-1"
                          >
                            <!-- Eye open icon (when password is hidden) -->
                            <svg
                              v-if="!showCurrentPassword"
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
                        </div>
                      </div>

                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 mb-1"
                          >New Password</label
                        >
                        <div class="relative">
                          <input
                            v-model="passwordForm.newPassword"
                            :type="showNewPassword ? 'text' : 'password'"
                            class="w-full p-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your new password"
                          />
                          <button
                            type="button"
                            @click="showNewPassword = !showNewPassword"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                            :title="
                              showNewPassword
                                ? 'Hide password'
                                : 'Show password'
                            "
                            :aria-label="
                              showNewPassword
                                ? 'Hide password'
                                : 'Show password'
                            "
                            tabindex="-1"
                          >
                            <!-- Eye open icon (when password is hidden) -->
                            <svg
                              v-if="!showNewPassword"
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
                        </div>
                      </div>

                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 mb-1"
                          >Confirm New Password</label
                        >
                        <div class="relative">
                          <input
                            v-model="passwordForm.confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            class="w-full p-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirm your new password"
                          />
                          <button
                            type="button"
                            @click="showConfirmPassword = !showConfirmPassword"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                            :title="
                              showConfirmPassword
                                ? 'Hide password'
                                : 'Show password'
                            "
                            :aria-label="
                              showConfirmPassword
                                ? 'Hide password'
                                : 'Show password'
                            "
                            tabindex="-1"
                          >
                            <!-- Eye open icon (when password is hidden) -->
                            <svg
                              v-if="!showConfirmPassword"
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
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="changePassword"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              :disabled="isUpdatingPassword"
            >
              <span v-if="isUpdatingPassword">Updating...</span>
              <span v-else>Change Password</span>
            </button>
            <button
              type="button"
              @click="closePasswordModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import { useAuthStore } from "@/modules/auth/store";
import { useToast } from "@/composables/useToast";
import { usePageInitLoading } from "@/composables/usePageLoading";
import {
  updateProfile as updateProfileService,
  changePassword as changePasswordService,
} from "@/modules/auth/services/authService";

const authStore = useAuthStore();
const { success, error } = useToast();

// Page loading management
const { stopLoading } = usePageInitLoading("profile-page");

const isLoading = ref(true);

// Modal states
const showPasswordModal = ref(false);

// Form states
const profileForm = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
});

const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Password visibility states
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Loading and error states
const isUpdatingProfile = ref(false);
const isUpdatingPassword = ref(false);
const profileUpdateError = ref("");
const profileUpdateSuccess = ref("");
const passwordUpdateError = ref("");
const passwordUpdateSuccess = ref("");

// Computed properties for user information
const userName = computed(() => {
  return authStore.user?.name || authStore.user?.username || "User";
});

const userEmail = computed(() => {
  return authStore.user?.email || "";
});

const userAvatar = computed(() => {
  return authStore.user?.avatar || null;
});

const userRole = computed(() => {
  return authStore.role || "User";
});

const userPhone = computed(() => {
  return authStore.user?.phone || "";
});

const userAddress = computed(() => {
  return authStore.user?.address || "";
});

const userCreatedAt = computed(() => {
  if (!authStore.user?.created_at) return "N/A";

  const date = new Date(authStore.user.created_at);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const userInitials = computed(() => {
  const name = userName.value;
  if (!name || name === "User") return "U";

  // Get initials from name
  const nameParts = name.split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  return (
    nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
  ).toUpperCase();
});

// Modal control functions

const openChangePasswordModal = () => {
  resetPasswordForm();
  passwordUpdateError.value = "";
  passwordUpdateSuccess.value = "";
  showPasswordModal.value = true;
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
};

// Initialize form with user data
const initializeForm = () => {
  profileForm.value = {
    name: userName.value,
    email: userEmail.value,
    phone: userPhone.value || "",
    address: userAddress.value || "",
  };
};

// Reset password form
const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  // Reset password visibility states
  showCurrentPassword.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;
};

// Change password function
const changePassword = async () => {
  passwordUpdateError.value = "";
  passwordUpdateSuccess.value = "";

  // Validate passwords
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    const errorMsg = "New passwords do not match";
    passwordUpdateError.value = errorMsg;
    error(errorMsg);
    return;
  }

  if (passwordForm.value.newPassword.length < 8) {
    const errorMsg = "Password must be at least 8 characters long";
    passwordUpdateError.value = errorMsg;
    error(errorMsg);
    return;
  }

  isUpdatingPassword.value = true;

  try {
    // Call the API to change password
    await changePasswordService({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });

    // Reset form
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Reset password visibility states
    showCurrentPassword.value = false;
    showNewPassword.value = false;
    showConfirmPassword.value = false;

    const successMsg = "Password changed successfully!";
    passwordUpdateSuccess.value = successMsg;
    success(successMsg);

    closePasswordModal();
  } catch (err) {
    const errorMsg = err.message || "Failed to change password";
    passwordUpdateError.value = errorMsg;
    error(errorMsg);
  } finally {
    isUpdatingPassword.value = false;
  }
};

onMounted(() => {
  // Initialize form with user data
  initializeForm();

  // Simulate loading
  setTimeout(() => {
    isLoading.value = false;
    stopLoading();
  }, 500);
});
</script>
