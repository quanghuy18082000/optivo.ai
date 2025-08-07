<template>
  <div class="bg-white rounded-lg shadow mb-6">
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8 px-6">
        <button
          @click="$emit('update:activeTab', 'permissions')"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'permissions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          {{ $t("project_permission.role_permissions") }}
        </button>
        <button
          @click="$emit('update:activeTab', 'assignments')"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'assignments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          {{ $t("project_permission.user_assignments") }}
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true,
  },
});

defineEmits(["update:activeTab"]);
</script>
