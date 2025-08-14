<template>
  <div class="p-8 space-y-6">
    <h1 class="text-2xl font-bold">Dropdown Click Outside Test</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- MultiSelect Test -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">MultiSelect Component</h2>
        <MultiSelect
          v-model="selectedProjects"
          :options="projectOptions"
          placeholder="Select projects..."
          searchable
          show-select-all
        />
        <div class="text-sm text-gray-600">
          Selected: {{ selectedProjects.length }} items
        </div>
      </div>

      <!-- DatePicker Test -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">DatePicker Component</h2>
        <DatePicker v-model="selectedDate" placeholder="Select date..." />
        <div class="text-sm text-gray-600">
          Selected Date: {{ selectedDate || "None" }}
        </div>
      </div>

      <!-- Multiple MultiSelect Test -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">
          Multiple MultiSelect (should close others)
        </h2>
        <MultiSelect
          v-model="selectedMembers"
          :options="memberOptions"
          placeholder="Select members..."
          searchable
        />
        <div class="text-sm text-gray-600">
          Selected: {{ selectedMembers.length }} members
        </div>
      </div>

      <!-- Additional DatePicker -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">
          Second DatePicker (should close others)
        </h2>
        <DatePicker v-model="endDate" placeholder="Select end date..." />
        <div class="text-sm text-gray-600">
          End Date: {{ endDate || "None" }}
        </div>
      </div>
    </div>

    <div class="mt-8 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-md font-semibold mb-2">Test Instructions:</h3>
      <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
        <li>Click on any dropdown/datepicker to open it</li>
        <li>Click outside to close (should work)</li>
        <li>Press ESC key to close (should work)</li>
        <li>
          Open one dropdown, then click another - first should close
          automatically
        </li>
        <li>Only one dropdown should be open at a time</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import MultiSelect from "@/components/ui/MultiSelect.vue";
import DatePicker from "@/components/ui/DatePicker.vue";

// Test data
const selectedProjects = ref([]);
const selectedMembers = ref([]);
const selectedDate = ref("");
const endDate = ref("");

const projectOptions = ref([
  { label: "Project Alpha", value: 1 },
  { label: "Project Beta", value: 2 },
  { label: "Project Gamma", value: 3 },
  { label: "Project Delta", value: 4 },
  { label: "Project Epsilon", value: 5 },
  { label: "Project Zeta", value: 6 },
  { label: "Project Eta", value: 7 },
  { label: "Project Theta", value: 8 },
]);

const memberOptions = ref([
  { label: "John Doe", value: 1 },
  { label: "Jane Smith", value: 2 },
  { label: "Bob Johnson", value: 3 },
  { label: "Alice Brown", value: 4 },
  { label: "Charlie Davis", value: 5 },
  { label: "Diana Wilson", value: 6 },
]);
</script>
