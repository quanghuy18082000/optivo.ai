<template>
  <div class="flex items-center gap-2">
    <label class="text-sm text-gray-700">
      {{ $t("common.items_per_page") }}:
    </label>
    <select
      :value="pageSize"
      @change="handlePageSizeChange"
      class="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option v-for="size in pageSizeOptions" :key="size" :value="size">
        {{ size }}
      </option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps({
  pageSize: {
    type: Number,
    required: true,
  },
  pageSizeOptions: {
    type: Array,
    default: () => [5, 10, 20, 50, 100],
  },
});

const emit = defineEmits(["page-size-change"]);

const handlePageSizeChange = (event) => {
  const newSize = parseInt(event.target.value);
  emit("page-size-change", newSize);
};
</script>
