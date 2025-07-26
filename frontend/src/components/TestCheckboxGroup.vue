<template>
  <div class="p-6 max-w-md mx-auto">
    <h2 class="text-lg font-semibold mb-4">Test CheckboxGroup Component</h2>

    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">
        Select Technologies:
      </label>
      <CheckboxGroup
        v-model="selectedTechnologies"
        :options="technologyOptions"
        show-select-all
        select-all-label="Select All Technologies"
        @change="handleTechnologyChange"
      />
    </div>

    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">
        Select Team Members:
      </label>
      <CheckboxGroup
        v-model="selectedMembers"
        :options="memberOptions"
        show-select-all
        select-all-label="Select All Members"
        @change="handleMemberChange"
      />
    </div>

    <div class="mt-6 p-4 bg-gray-100 rounded">
      <h3 class="font-medium mb-2">Selected Technologies:</h3>
      <pre>{{ JSON.stringify(selectedTechnologies, null, 2) }}</pre>

      <h3 class="font-medium mb-2 mt-4">Selected Members:</h3>
      <pre>{{ JSON.stringify(selectedMembers, null, 2) }}</pre>

      <h3 class="font-medium mb-2 mt-4">Selected Technology Options:</h3>
      <pre>{{ JSON.stringify(selectedTechnologyOptions, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import CheckboxGroup from "@/components/ui/CheckboxGroup.vue";

const selectedTechnologies = ref([]);
const selectedMembers = ref([]);
const selectedTechnologyOptions = ref([]);

const technologyOptions = [
  { label: "Vue.js", value: "vue" },
  { label: "React", value: "react" },
  { label: "Angular", value: "angular" },
  { label: "Node.js", value: "nodejs" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "PHP", value: "php", disabled: true }, // Disabled option
  { label: "Go", value: "go" },
];

const memberOptions = [
  { label: "John Doe", value: 1 },
  { label: "Jane Smith", value: 2 },
  { label: "Bob Johnson", value: 3 },
  { label: "Alice Brown", value: 4 },
  { label: "Charlie Wilson", value: 5 },
];

const handleTechnologyChange = (values, options) => {
  console.log("Technologies changed:", { values, options });
  selectedTechnologyOptions.value = options;
};

const handleMemberChange = (values, options) => {
  console.log("Members changed:", { values, options });
};
</script>
