<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Your Profile</h1>
        <span class="text-sm text-gray-500">Manage your account settings</span>
      </div>
    </template>

    <div class="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <div v-if="isLoading" class="flex justify-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        ></div>
      </div>

      <div v-else class="space-y-8">
        <!-- Profile Header -->
        <div class="flex items-center gap-6">
          <div v-if="userAvatar" class="w-24 h-24 rounded-full overflow-hidden">
            <img
              :src="userAvatar"
              alt="User avatar"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <span class="text-3xl font-medium text-blue-600">{{
              userInitials
            }}</span>
          </div>

          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ userName }}</h2>
            <p class="text-gray-600">{{ userEmail }}</p>
          </div>
        </div>

        <!-- Profile Information -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Name</label
              >
              <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                {{ userName }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Email</label
              >
              <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                {{ userEmail }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Role</label
              >
              <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                {{ userRole }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Account Created</label
              >
              <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                {{ userCreatedAt }}
              </div>
            </div>
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

const authStore = useAuthStore();
const isLoading = ref(true);

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

onMounted(() => {
  // Simulate loading
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});
</script>
