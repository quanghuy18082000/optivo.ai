<template>
  <div class="p-6 max-w-md mx-auto">
    <h2 class="text-lg font-semibold mb-4">Test MultiSelect Component</h2>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Select Projects:
      </label>
      <MultiSelect
        v-model="selectedProjects"
        :options="projectOptions"
        placeholder="Select projects..."
        searchable
        show-select-all
        @change="handleChange"
      />
    </div>

    <div class="mt-4 p-4 bg-gray-100 rounded">
      <h3 class="font-medium mb-2">Selected Values:</h3>
      <pre>{{ JSON.stringify(selectedProjects, null, 2) }}</pre>

      <h3 class="font-medium mb-2 mt-4">Selected Options:</h3>
      <pre>{{ JSON.stringify(selectedOptions, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import MultiSelect from "@/components/ui/MultiSelect.vue";

const selectedProjects = ref([]);
const selectedOptions = ref([]);

const projectOptions = [
  { label: "Project Alpha", value: 1 },
  { label: "Project Beta", value: 2 },
  { label: "Project Gamma", value: 3 },
  { label: "Project Delta", value: 4 },
  { label: "Project Epsilon", value: 5 },
  { label: "Project Zeta", value: 6 },
  { label: "Project Eta", value: 7 },
  { label: "Project Theta", value: 8 },
];

const handleChange = (values, options) => {
  console.log("MultiSelect changed:", { values, options });
  selectedOptions.value = options;
};
</script>
