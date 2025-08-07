<template>
  <div class="border border-gray-200 rounded-lg p-4">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h4 class="text-lg font-medium text-gray-900">
          {{ module.name }}
        </h4>
        <p class="text-sm text-gray-500">
          {{ module.description }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="$emit('select-all', module.key, true)"
          class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          {{ $t("common.select_all") }}
        </button>
        <button
          @click="$emit('select-all', module.key, false)"
          class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          {{ $t("common.clear_all") }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="permission in module.permissions"
        :key="permission.id"
        class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <input
          :id="`permission-${permission.id}`"
          type="checkbox"
          :checked="hasPermission(permission)"
          @change="
            $emit('toggle-permission', permission, $event.target.checked)
          "
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label
          :for="`permission-${permission.id}`"
          class="flex-1 cursor-pointer"
        >
          <div class="text-sm font-medium text-gray-700">
            {{ permission.displayName }}
          </div>
          <div v-if="permission.description" class="text-xs text-gray-500 mt-1">
            {{ permission.description }}
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  module: {
    type: Object,
    required: true,
  },
  hasPermission: {
    type: Function,
    required: true,
  },
});

defineEmits(["select-all", "toggle-permission"]);
</script>
