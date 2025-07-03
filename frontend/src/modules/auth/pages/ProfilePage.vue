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
                @click="openEditProfileModal"
                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </button>
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

    <!-- Edit Profile Modal -->
    <div
      v-if="showEditProfileModal"
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
          @click="closeEditProfileModal"
        ></div>

        <!-- Modal panel -->
        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <div class="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              @click="closeEditProfileModal"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3
                  class="text-lg leading-6 font-medium text-gray-900"
                  id="modal-title"
                >
                  Edit Profile
                </h3>
                <div class="mt-4">
                  <form @submit.prevent="updateProfile" class="space-y-6">
                    <div class="grid grid-cols-1 gap-4">
                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 mb-1"
                          >Name</label
                        >
                        <input
                          v-model="profileForm.name"
                          type="text"
                          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 mb-1"
                          >Email</label
                        >
                        <input
                          v-model="profileForm.email"
                          type="email"
                          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your email"
                        />
                      </div>

                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 mb-1"
                          >Phone</label
                        >
                        <input
                          v-model="profileForm.phone"
                          type="tel"
                          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your phone number"
                        />
                      </div>

                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 mb-1"
                          >Address</label
                        >
                        <input
                          v-model="profileForm.address"
                          type="text"
                          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your address"
                        />
                      </div>
                    </div>

                    <div v-if="profileUpdateError" class="text-red-500 text-sm">
                      {{ profileUpdateError }}
                    </div>

                    <div
                      v-if="profileUpdateSuccess"
                      class="text-green-500 text-sm"
                    >
                      {{ profileUpdateSuccess }}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="updateProfile"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              :disabled="isUpdatingProfile"
            >
              <span v-if="isUpdatingProfile">Updating...</span>
              <span v-else>Update Profile</span>
            </button>
            <button
              type="button"
              @click="closeEditProfileModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
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
                        <input
                          v-model="passwordForm.currentPassword"
                          type="password"
                          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your current password"
                        />
                      </div>

                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 mb-1"
                          >New Password</label
                        >
                        <input
                          v-model="passwordForm.newPassword"
                          type="password"
                          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your new password"
                        />
                      </div>

                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 mb-1"
                          >Confirm New Password</label
                        >
                        <input
                          v-model="passwordForm.confirmPassword"
                          type="password"
                          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Confirm your new password"
                        />
                      </div>
                    </div>

                    <div
                      v-if="passwordUpdateError"
                      class="text-red-500 text-sm"
                    >
                      {{ passwordUpdateError }}
                    </div>

                    <div
                      v-if="passwordUpdateSuccess"
                      class="text-green-500 text-sm"
                    >
                      {{ passwordUpdateSuccess }}
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
import {
  updateProfile as updateProfileService,
  changePassword as changePasswordService,
} from "@/modules/auth/services/authService";

const authStore = useAuthStore();
const isLoading = ref(true);

// Modal states
const showEditProfileModal = ref(false);
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
const openEditProfileModal = () => {
  initializeForm();
  profileUpdateError.value = "";
  profileUpdateSuccess.value = "";
  showEditProfileModal.value = true;
};

const closeEditProfileModal = () => {
  showEditProfileModal.value = false;
};

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
};

// Update profile function
const updateProfile = async () => {
  profileUpdateError.value = "";
  profileUpdateSuccess.value = "";
  isUpdatingProfile.value = true;

  try {
    // Call the API to update profile
    const response = await updateProfileService({
      name: profileForm.value.name,
      email: profileForm.value.email,
      phone: profileForm.value.phone,
      address: profileForm.value.address,
    });

    // Update the store with new user data
    authStore.updateUserProfile({
      name: profileForm.value.name,
      email: profileForm.value.email,
      phone: profileForm.value.phone,
      address: profileForm.value.address,
    });

    profileUpdateSuccess.value = "Profile updated successfully!";

    // Close modal after a delay
    setTimeout(() => {
      closeEditProfileModal();
    }, 1500);
  } catch (error) {
    profileUpdateError.value = error.message || "Failed to update profile";
  } finally {
    isUpdatingProfile.value = false;
  }
};

// Change password function
const changePassword = async () => {
  passwordUpdateError.value = "";
  passwordUpdateSuccess.value = "";

  // Validate passwords
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordUpdateError.value = "New passwords do not match";
    return;
  }

  if (passwordForm.value.newPassword.length < 8) {
    passwordUpdateError.value = "Password must be at least 8 characters long";
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

    passwordUpdateSuccess.value = "Password changed successfully!";

    // Close modal after a delay
    setTimeout(() => {
      closePasswordModal();
    }, 1500);
  } catch (error) {
    passwordUpdateError.value = error.message || "Failed to change password";
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
  }, 500);
});
</script>
