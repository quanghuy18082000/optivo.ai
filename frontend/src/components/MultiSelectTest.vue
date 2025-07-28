<template>
  <div
    class="fixed top-4 right-4 bg-green-100 border border-green-400 rounded p-4 max-w-md z-50"
  >
    <h3 class="font-bold text-sm mb-2">🧪 MultiSelect Test</h3>

    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium mb-1">Test MultiSelect:</label>
        <MultiSelect
          v-model="selectedValues"
          :options="testOptions"
          placeholder="Select items..."
          searchable
          show-select-all
          @change="handleChange"
        />
      </div>

      <div class="text-xs">
        <strong>Selected Values:</strong> {{ selectedValues }}
      </div>

      <div class="text-xs">
        <strong>Selected Count:</strong> {{ selectedValues.length }}
      </div>

      <button
        @click="clearSelection"
        class="bg-red-500 text-white px-2 py-1 rounded text-xs"
      >
        Clear All
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import MultiSelect from "@/components/ui/MultiSelect.vue";

const selectedValues = ref([]);

const testOptions = [
  { label: "Option 1", value: 1 },
  { label: "Option 2", value: 2 },
  { label: "Option 3", value: 3 },
  { label: "Long Option Name 4", value: 4 },
  { label: "Another Option 5", value: 5 },
];

const handleChange = (values, options) => {
  console.log("✅ MultiSelect working! Selected:", values.length, "items");
};

const clearSelection = () => {
  selectedValues.value = [];
};
</script>
