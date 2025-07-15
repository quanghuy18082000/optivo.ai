<template>
  <PopupMenu
    v-model="isOpen"
    placement="bottom-end"
    :offset="8"
    width="48"
    min-width="12rem"
  >
    <template #trigger="{ isOpen }">
      <button
        class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
      >
        <!-- User Avatar -->
        <div
          v-if="userAvatar"
          class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
        >
          <img
            :src="userAvatar"
            alt="User avatar"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          v-else
          class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <span class="text-sm font-medium text-blue-600">{{
            userInitials
          }}</span>
        </div>

        <!-- Dropdown Arrow -->
        <svg
          class="w-4 h-4 flex-shrink-0"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </template>

    <!-- User Info -->
    <div class="px-4 py-3 border-b border-gray-100">
      <p class="text-sm font-medium text-gray-900">
        {{ authStore.user?.name || "Guest User" }}
      </p>
      <p class="text-xs text-gray-500 truncate">
        {{ authStore.user?.email || "No email available" }}
      </p>
    </div>

    <!-- Profile Option -->
    <router-link
      to="/profile"
      class="flex items-center gap-2 text-0.925rem px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
      @click="isOpen = false"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      Your Profile
    </router-link>

    <!-- Logout Option -->
    <PopupMenuItem @click="handleLogout">
      <template #icon>
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </template>
      Logout
    </PopupMenuItem>
  </PopupMenu>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store";
import PopupMenu from "@/components/ui/PopupMenu.vue";
import PopupMenuItem from "@/components/ui/PopupMenuItem.vue";

const router = useRouter();
const authStore = useAuthStore();
const isOpen = ref(false);

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

// Methods
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const handleLogout = () => {
  authStore.logout();
  isOpen.value = false;
  router.push("/login");
};
</script>
