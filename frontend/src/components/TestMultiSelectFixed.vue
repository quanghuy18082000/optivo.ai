<template>
  <div class="p-6 max-w-md mx-auto">
    <h2 class="text-lg font-semibold mb-4">Test MultiSelect - Fixed Version</h2>

    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">
        Select Team Members:
      </label>
      <MultiSelect
        v-model="selectedMembers"
        :options="memberOptions"
        placeholder="Select team members..."
        searchable
        show-select-all
        @change="handleMemberChange"
      />
    </div>

    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">
        Select Technologies:
      </label>
      <MultiSelect
        v-model="selectedTechnologies"
        :options="technologyOptions"
        placeholder="Select technologies..."
        searchable
        show-select-all
        @change="handleTechnologyChange"
      />
    </div>

    <div class="mt-6 p-4 bg-gray-100 rounded">
      <h3 class="font-medium mb-2">Selected Members:</h3>
      <pre>{{ JSON.stringify(selectedMembers, null, 2) }}</pre>

      <h3 class="font-medium mb-2 mt-4">Selected Technologies:</h3>
      <pre>{{ JSON.stringify(selectedTechnologies, null, 2) }}</pre>

      <h3 class="font-medium mb-2 mt-4">Change Events Log:</h3>
      <div class="max-h-32 overflow-y-auto">
        <div
          v-for="(log, index) in eventLogs"
          :key="index"
          class="text-xs mb-1"
        >
          {{ log }}
        </div>
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      <button
        @click="clearSelections"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear All
      </button>
      <button
        @click="clearLogs"
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Clear Logs
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import MultiSelect from "@/components/ui/MultiSelect.vue";

const selectedMembers = ref([]);
const selectedTechnologies = ref([]);
const eventLogs = ref([]);

const memberOptions = [
  { label: "John Doe", value: 1 },
  { label: "Jane Smith", value: 2 },
  { label: "Bob Johnson", value: 3 },
  { label: "Alice Brown", value: 4 },
  { label: "Charlie Wilson", value: 5 },
  { label: "David Lee", value: 6 },
  { label: "Emma Davis", value: 7 },
  { label: "Frank Miller", value: 8 },
];

const technologyOptions = [
  { label: "Vue.js", value: "vue" },
  { label: "React", value: "react" },
  { label: "Angular", value: "angular" },
  { label: "Node.js", value: "nodejs" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "PHP", value: "php" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "TypeScript", value: "typescript" },
];

const handleMemberChange = (values, options) => {
  const timestamp = new Date().toLocaleTimeString();
  eventLogs.value.unshift(`[${timestamp}] Members: ${values.length} selected`);
  console.log("Members changed:", { values, options });
};

const handleTechnologyChange = (values, options) => {
  const timestamp = new Date().toLocaleTimeString();
  eventLogs.value.unshift(
    `[${timestamp}] Technologies: ${values.length} selected`
  );
  console.log("Technologies changed:", { values, options });
};

const clearSelections = () => {
  selectedMembers.value = [];
  selectedTechnologies.value = [];
  eventLogs.value.unshift(
    `[${new Date().toLocaleTimeString()}] All selections cleared`
  );
};

const clearLogs = () => {
  eventLogs.value = [];
};
</script>
