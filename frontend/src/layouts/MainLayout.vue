<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-blue-600 text-white relative flex-shrink-0 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-19' : 'w-64',
      ]"
    >
      <div class="p-4">
        <!-- Logo and Toggle -->
        <div class="flex items-center justify-between mb-8">
          <div v-if="!isCollapsed" class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
            >
              <img src="@/assets/images/optivo-logo.png" alt="" class="rounded-full" /></img>
            </div>
            <span class="text-xl font-bold">OPTIVO</span>
          </div>
          <div v-else class="flex justify-center w-full">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
            >
            <img src="@/assets/images/optivo-logo.png" alt="" class="rounded-full" /></img>
            </div>
          </div>
          <button
            @click="toggleSidebar"
            class="absolute right--4 top-5 p-1 hover:scale-110 bg-white text-blue-600 border-1 shadow-lg rounded-full transition-colors"
          >
            <svg
              class="w-6 h-6 transition-transform duration-300"
              :class="{ 'rotate-180': isCollapsed }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="space-y-2">
          <router-link
            to="/"
            class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-700 transition-colors group"
            :class="{
              'bg-blue-700': $route.path === '/',
            }"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
              />
            </svg>
            <div v-if="!isCollapsed" class="min-w-0">
              <div class="font-medium truncate">Daily Input</div>
              <div class="text-sm text-blue-200 truncate">Log your work</div>
            </div>
            <!-- Tooltip for collapsed state -->
          </router-link>

          <router-link
            to="/projects"
            class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-700 transition-colors group"
            :class="{ 'bg-blue-700': $route.path === '/projects' }"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
              />
            </svg>
            <div v-if="!isCollapsed" class="min-w-0">
              <div class="font-medium truncate">Projects</div>
              <div class="text-sm text-blue-200 truncate">Manage projects</div>
            </div>
          </router-link>

          <router-link
            to="/profile"
            class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-700 transition-colors group"
            :class="{ 'bg-blue-700': $route.path === '/profile' }"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clip-rule="evenodd"
              />
            </svg>
            <div v-if="!isCollapsed" class="min-w-0">
              <div class="font-medium truncate">Profile</div>
              <div class="text-sm text-blue-200 truncate">Your account</div>
            </div>
          </router-link>

          <!-- Loading Demo Link (Development only) -->
          <!-- <router-link
            v-if="isDevelopment"
            to="/loading-demo"
            class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-blue-700 transition-colors group"
            :class="{ 'bg-blue-700': $route.path === '/loading-demo' }"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clip-rule="evenodd"
              />
            </svg>
            <div v-if="!isCollapsed" class="min-w-0">
              <div class="font-medium truncate">Loading Demo</div>
              <div class="text-sm text-blue-200 truncate">Test loading screens</div>
            </div>
          </router-link> -->

        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 min-w-0">
            <slot name="header-left">
              <h1 class="text-2xl font-semibold text-gray-900 truncate">
                Dashboard
              </h1>
            </slot>
          </div>

          <div class="flex items-center gap-4 flex-shrink-0">
            <slot name="header-right">
              <!-- User Menu -->
              <UserMenu />
            </slot>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import UserMenu from "@/components/UserMenu.vue";

const isCollapsed = ref(false);

// Show development features only in dev mode
const isDevelopment = computed(() => import.meta.env.DEV);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>
