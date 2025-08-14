<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-medium text-gray-900 flex items-center">
        <svg
          class="w-5 h-5 mr-2 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          ></path>
        </svg>
        {{ $t("project_permission.project_roles") }}
      </h2>
      <button
        v-if="canAddRole"
        @click="$emit('add-role')"
        class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <svg
          class="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          ></path>
        </svg>
        {{ $t("project_permission.add_role") }}
      </button>
    </div>

    <!-- Loading State for Roles -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="flex items-center gap-3">
        <svg
          class="animate-spin h-5 w-5 text-blue-600"
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
        <span class="text-sm text-gray-600">{{ $t("common.loading") }}...</span>
      </div>
    </div>

    <!-- Roles List -->
    <div v-else class="space-y-2">
      <div
        v-for="role in roles"
        :key="role.id"
        class="group p-3 rounded-lg cursor-pointer transition-colors relative"
        :class="
          selectedRole?.id === role.id
            ? 'bg-blue-50 border-2 border-blue-200'
            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
        "
      >
        <div @click="$emit('select-role', role)" class="pr-8">
          <div class="font-medium text-gray-900">{{ role.name }}</div>
          <div class="text-sm text-gray-500">
            {{ role.description }}
          </div>
        </div>

        <!-- Delete Button -->
        <button
          v-if="canDeleteRole"
          @click.stop="$emit('delete-role', role)"
          class="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded hover:bg-red-50"
          :title="`Delete ${role.name}`"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="roles.length === 0" class="text-center py-8">
        <div class="text-gray-500 text-sm">
          {{ $t("project_permission.no_roles_found") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  roles: {
    type: Array,
    default: () => [],
  },
  selectedRole: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canAddRole: {
    type: Boolean,
    default: false,
  },
  canDeleteRole: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["add-role", "select-role", "delete-role"]);
</script>
