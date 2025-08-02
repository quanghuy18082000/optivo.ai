<template>
  <div class="p-8 space-y-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">
      Enhanced Dropdown Components Demo
    </h1>

    <!-- Select Component Demo -->
    <div class="space-y-4">
      <h2 class="text-2xl font-semibold text-gray-800">Select Component</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Basic Select
          </label>
          <Select
            v-model="selectedValue"
            :options="selectOptions"
            placeholder="Choose an option..."
            @change="onSelectChange"
          />
          <p class="text-sm text-gray-500 mt-1">
            Selected: {{ selectedValue }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select with Error
          </label>
          <Select
            v-model="selectedValueError"
            :options="selectOptions"
            placeholder="This has an error..."
            :error="true"
            error-message="Please select a valid option"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Disabled Select
          </label>
          <Select
            v-model="selectedValueDisabled"
            :options="selectOptions"
            placeholder="This is disabled..."
            :disabled="true"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select with Custom Max Height
          </label>
          <Select
            v-model="selectedValueCustom"
            :options="longSelectOptions"
            placeholder="Custom height..."
            :max-height="150"
          />
        </div>
      </div>
    </div>

    <!-- MultiSelect Component Demo -->
    <div class="space-y-4">
      <h2 class="text-2xl font-semibold text-gray-800">
        MultiSelect Component
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Basic MultiSelect
          </label>
          <MultiSelect
            v-model="selectedMultiValues"
            :options="multiSelectOptions"
            placeholder="Choose multiple options..."
            @change="onMultiSelectChange"
          />
          <p class="text-sm text-gray-500 mt-1">
            Selected: {{ selectedMultiValues.join(", ") }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Searchable MultiSelect
          </label>
          <MultiSelect
            v-model="selectedSearchableValues"
            :options="multiSelectOptions"
            placeholder="Search and select..."
            :searchable="true"
            :show-select-all="true"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            MultiSelect with Error
          </label>
          <MultiSelect
            v-model="selectedMultiError"
            :options="multiSelectOptions"
            placeholder="This has an error..."
            :error="true"
            error-message="Please select at least one option"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Custom Display Items
          </label>
          <MultiSelect
            v-model="selectedCustomDisplay"
            :options="multiSelectOptions"
            placeholder="Max 2 display items..."
            :max-display-items="2"
            :searchable="true"
          />
        </div>
      </div>
    </div>

    <!-- Position Test Section -->
    <div class="space-y-4">
      <h2 class="text-2xl font-semibold text-gray-800">Position Testing</h2>
      <p class="text-gray-600">
        Test dropdowns in different positions to verify positioning logic.
      </p>

      <div
        class="grid grid-cols-3 gap-4 h-96 overflow-auto border border-gray-200 p-4"
      >
        <!-- Top Left -->
        <div class="flex flex-col justify-start">
          <label class="text-sm font-medium text-gray-700 mb-2">Top Left</label>
          <Select
            v-model="positionTest1"
            :options="selectOptions"
            placeholder="Top left position..."
          />
        </div>

        <!-- Top Right -->
        <div class="flex flex-col justify-start items-end">
          <label class="text-sm font-medium text-gray-700 mb-2"
            >Top Right</label
          >
          <div class="w-48">
            <MultiSelect
              v-model="positionTest2"
              :options="multiSelectOptions"
              placeholder="Top right position..."
              :searchable="true"
            />
          </div>
        </div>

        <!-- Center -->
        <div class="flex flex-col justify-center">
          <label class="text-sm font-medium text-gray-700 mb-2">Center</label>
          <Select
            v-model="positionTest3"
            :options="longSelectOptions"
            placeholder="Center position..."
          />
        </div>

        <!-- Bottom Left -->
        <div class="flex flex-col justify-end">
          <label class="text-sm font-medium text-gray-700 mb-2"
            >Bottom Left</label
          >
          <MultiSelect
            v-model="positionTest4"
            :options="multiSelectOptions"
            placeholder="Bottom left..."
            :show-select-all="true"
          />
        </div>

        <!-- Bottom Center -->
        <div class="flex flex-col justify-end">
          <label class="text-sm font-medium text-gray-700 mb-2"
            >Bottom Center</label
          >
          <Select
            v-model="positionTest5"
            :options="selectOptions"
            placeholder="Bottom center..."
          />
        </div>

        <!-- Bottom Right -->
        <div class="flex flex-col justify-end items-end">
          <label class="text-sm font-medium text-gray-700 mb-2"
            >Bottom Right</label
          >
          <div class="w-48">
            <MultiSelect
              v-model="positionTest6"
              :options="multiSelectOptions"
              placeholder="Bottom right..."
              :searchable="true"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-lg font-semibold text-blue-800 mb-2">
        Testing Instructions
      </h3>
      <ul class="text-blue-700 space-y-1 text-sm">
        <li>
          • Try opening dropdowns in different positions to test positioning
          logic
        </li>
        <li>• Resize the browser window to test responsive behavior</li>
        <li>
          • Scroll the page while dropdowns are open to test position updates
        </li>
        <li>• Test on mobile devices to verify mobile-specific positioning</li>
        <li>• Use keyboard navigation (Tab, Escape) to test accessibility</li>
        <li>• Test with long option lists to verify scrolling behavior</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Select from "./Select.vue";
import MultiSelect from "./MultiSelect.vue";

// Select demo data
const selectedValue = ref("");
const selectedValueError = ref("");
const selectedValueDisabled = ref("option2");
const selectedValueCustom = ref("");

// MultiSelect demo data
const selectedMultiValues = ref([]);
const selectedSearchableValues = ref(["option1"]);
const selectedMultiError = ref([]);
const selectedCustomDisplay = ref(["option1", "option2", "option3"]);

// Position test data
const positionTest1 = ref("");
const positionTest2 = ref([]);
const positionTest3 = ref("");
const positionTest4 = ref([]);
const positionTest5 = ref("");
const positionTest6 = ref([]);

// Options data
const selectOptions = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
  { label: "Option 4", value: "option4" },
  { label: "Option 5", value: "option5" },
];

const longSelectOptions = [
  { label: "Very Long Option Name 1", value: "long1" },
  { label: "Very Long Option Name 2", value: "long2" },
  { label: "Very Long Option Name 3", value: "long3" },
  { label: "Very Long Option Name 4", value: "long4" },
  { label: "Very Long Option Name 5", value: "long5" },
  { label: "Very Long Option Name 6", value: "long6" },
  { label: "Very Long Option Name 7", value: "long7" },
  { label: "Very Long Option Name 8", value: "long8" },
  { label: "Very Long Option Name 9", value: "long9" },
  { label: "Very Long Option Name 10", value: "long10" },
];

const multiSelectOptions = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
  { label: "Elderberry", value: "elderberry" },
  { label: "Fig", value: "fig" },
  { label: "Grape", value: "grape" },
  { label: "Honeydew", value: "honeydew" },
];

// Event handlers
const onSelectChange = (option) => {};

const onMultiSelectChange = (values, options) => {};
</script>
