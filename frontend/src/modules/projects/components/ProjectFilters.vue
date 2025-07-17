<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-hidden"
    @click="closePanel"
  >
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>

    <div
      class="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
      @click.stop
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200"
      >
        <h2 class="text-lg font-semibold text-gray-900">Project Filters</h2>
        <button
          @click="closePanel"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Filter Content -->
      <div class="p-6 space-y-6 overflow-y-auto h-full pb-24">
        <!-- Project Name Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Project Name
          </label>
          <Input
            v-model="localFilters.projectName"
            placeholder="Search by project name"
          />
        </div>

        <!-- Member Name Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Team Member
          </label>
          <Input
            v-model="localFilters.memberName"
            placeholder="Search by team member name"
          />
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Project Status
          </label>
          <Select
            v-model="localFilters.status"
            :options="statusOptions"
            placeholder="Select status"
          />
        </div>

        <!-- Date Range Filters -->
        <div class="space-y-4">
          <label class="block text-sm font-medium text-gray-700">
            Date Range
          </label>

          <div>
            <label class="block text-xs text-gray-500 mb-1"> Start Date </label>
            <DatePicker
              v-model="localFilters.start_date"
              placeholder="From date"
            />
          </div>

          <div>
            <label class="block text-xs text-gray-500 mb-1"> End Date </label>
            <DatePicker v-model="localFilters.end_date" placeholder="To date" />
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        class="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200"
      >
        <div class="flex gap-3">
          <Button variant="secondary" class="flex-1" @click="resetFilters">
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset All
          </Button>
          <Button variant="primary" class="flex-1" @click="applyFilters">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import Input from "@/components/ui/Input.vue";
import Select from "@/components/ui/Select.vue";
import DatePicker from "@/components/ui/DatePicker.vue";
import Button from "@/components/ui/Button.vue";

// Status options for the dropdown
const statusOptions = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
  { label: "Cancelled", value: "cancelled" },
];

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "apply", "reset"]);

const localFilters = ref({
  projectName: "",
  memberName: "",
  status: "",
  start_date: "",
  endDate: "",
  ...props.filters,
});

const closePanel = () => {
  emit("close");
};

const applyFilters = () => {
  emit("apply", { ...localFilters.value });
  closePanel();
};

const resetFilters = () => {
  localFilters.value = {
    projectName: "",
    memberName: "",
    status: "",
    start_date: "",
    endDate: "",
  };
  emit("reset");
};

// Watch for external filter changes to keep localFilters in sync
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...localFilters.value, ...newFilters };
  },
  { deep: true }
);
</script>
