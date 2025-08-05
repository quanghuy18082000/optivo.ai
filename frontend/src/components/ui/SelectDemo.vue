<template>
  <div class="p-8 space-y-8">
    <h1 class="text-2xl font-bold text-gray-900">Select & MultiSelect Demo</h1>

    <!-- Regular Select -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-800">Regular Select</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Basic Select
          </label>
          <Select
            v-model="selectedBasic"
            :options="basicOptions"
            placeholder="Choose an option"
          />
          <p class="text-sm text-gray-500 mt-1">
            Selected: {{ selectedBasic }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Searchable Select
          </label>
          <Select
            v-model="selectedSearchable"
            :options="searchableOptions"
            placeholder="Choose a country"
            searchable
            search-placeholder="Search countries..."
          />
          <p class="text-sm text-gray-500 mt-1">
            Selected: {{ selectedSearchable }}
          </p>
        </div>
      </div>
    </div>

    <!-- MultiSelect -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-800">MultiSelect</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Basic MultiSelect
          </label>
          <MultiSelect
            v-model="selectedMultiBasic"
            :options="basicOptions"
            placeholder="Choose multiple options"
            show-select-all
          />
          <p class="text-sm text-gray-500 mt-1">
            Selected: {{ selectedMultiBasic }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Searchable MultiSelect
          </label>
          <MultiSelect
            v-model="selectedMultiSearchable"
            :options="searchableOptions"
            placeholder="Choose multiple countries"
            searchable
            search-placeholder="Search countries..."
            show-select-all
          />
          <p class="text-sm text-gray-500 mt-1">
            Selected: {{ selectedMultiSearchable }}
          </p>
        </div>
      </div>
    </div>

    <!-- Large Dataset Example -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-800">
        Large Dataset (100+ items)
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Searchable Select (Large Dataset)
          </label>
          <Select
            v-model="selectedLarge"
            :options="largeDataset"
            placeholder="Search from 100+ items"
            searchable
            search-placeholder="Type to search..."
          />
          <p class="text-sm text-gray-500 mt-1">
            Selected: {{ selectedLarge }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Searchable MultiSelect (Large Dataset)
          </label>
          <MultiSelect
            v-model="selectedMultiLarge"
            :options="largeDataset"
            placeholder="Search and select multiple"
            searchable
            search-placeholder="Type to search..."
            show-select-all
            :max-display-items="2"
          />
          <p class="text-sm text-gray-500 mt-1">
            Selected: {{ selectedMultiLarge.length }} items
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Select from "./Select.vue";
import MultiSelect from "./MultiSelect.vue";

// Basic options
const basicOptions = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3" },
  { label: "Option 4", value: "4" },
  { label: "Option 5", value: "5" },
];

// Country options for searchable demo
const searchableOptions = [
  { label: "United States", value: "us" },
  { label: "United Kingdom", value: "uk" },
  { label: "Canada", value: "ca" },
  { label: "Australia", value: "au" },
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
  { label: "Japan", value: "jp" },
  { label: "South Korea", value: "kr" },
  { label: "China", value: "cn" },
  { label: "India", value: "in" },
  { label: "Brazil", value: "br" },
  { label: "Mexico", value: "mx" },
  { label: "Spain", value: "es" },
  { label: "Italy", value: "it" },
  { label: "Netherlands", value: "nl" },
  { label: "Sweden", value: "se" },
  { label: "Norway", value: "no" },
  { label: "Denmark", value: "dk" },
  { label: "Finland", value: "fi" },
  { label: "Switzerland", value: "ch" },
];

// Generate large dataset
const largeDataset = Array.from({ length: 100 }, (_, i) => ({
  label: `Item ${i + 1} - ${Math.random().toString(36).substring(7)}`,
  value: `item-${i + 1}`,
}));

// Selected values
const selectedBasic = ref("");
const selectedSearchable = ref("");
const selectedMultiBasic = ref([]);
const selectedMultiSearchable = ref([]);
const selectedLarge = ref("");
const selectedMultiLarge = ref([]);
</script>
