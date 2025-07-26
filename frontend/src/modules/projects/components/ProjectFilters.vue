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
        <!-- Search Text Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Search Text
          </label>
          <Input
            v-model="localFilters.search_text"
            placeholder="Search projects, members, or descriptions..."
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

        <!-- Project Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Projects
          </label>
          <MultiSelect
            v-model="localFilters.project_ids"
            :options="projectOptions"
            placeholder="Select projects..."
            :disabled="isLoadingProjects"
            searchable
            show-select-all
            @change="handleProjectChange"
          />
          <div class="text-xs text-gray-500 mt-1">
            Selected: {{ localFilters.project_ids.length }} projects
          </div>
        </div>

        <!-- Team Members Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Team Members
          </label>
          <MultiSelect
            v-model="localFilters.member_ids"
            :options="memberOptions"
            placeholder="Select team members..."
            :disabled="isLoadingMembers"
            searchable
            show-select-all
            @change="handleMemberChange"
          />
          <div class="text-xs text-gray-500 mt-1">
            Selected: {{ localFilters.member_ids.length }} members
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
import { ref, watch, onMounted } from "vue";
import Input from "@/components/ui/Input.vue";
import MultiSelect from "@/components/ui/MultiSelect.vue";
import DatePicker from "@/components/ui/DatePicker.vue";
import Button from "@/components/ui/Button.vue";
import { getProjects } from "@/modules/worklogs/services/worklogService";
import { getUsers } from "@/services/userService";

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

// Local filter state
const localFilters = ref({
  search_text: props.filters.search_text || "",
  start_date: props.filters.start_date || "",
  end_date: props.filters.end_date || "",
  project_ids: Array.isArray(props.filters.project_ids)
    ? [...props.filters.project_ids]
    : [],
  member_ids: Array.isArray(props.filters.member_ids)
    ? [...props.filters.member_ids]
    : [],
});

// Options for dropdowns
const projectOptions = ref([]);
const memberOptions = ref([]);
const isLoadingProjects = ref(false);
const isLoadingMembers = ref(false);

// Load project options
const loadProjectOptions = async () => {
  try {
    isLoadingProjects.value = true;
    const response = await getProjects();

    // Transform projects data to options format
    const projects = response?.data || response || [];

    projectOptions.value = projects.map((project) => ({
      label: project.name,
      value: project.id,
    }));
  } catch (error) {
    console.error("Error loading projects:", error);
    projectOptions.value = [];
  } finally {
    isLoadingProjects.value = false;
  }
};

// Load member options
const loadMemberOptions = async () => {
  try {
    isLoadingMembers.value = true;
    const response = await getUsers();

    // Transform users data to options format
    // getUsers returns { message: "string", data: [{ user_id: 0, name: "string" }] }
    const users = response?.data || [];
    memberOptions.value = users.map((user) => ({
      label: user.name,
      value: user.id,
    }));
  } catch (error) {
    console.error("Error loading members:", error);
    // Fallback: create some default member options if API fails
    memberOptions.value = [];
  } finally {
    isLoadingMembers.value = false;
  }
};

// Event handlers
const handleProjectChange = (values, options) => {
  // Handle project selection change if needed
  console.log("Projects changed:", { values, options });
};

const handleMemberChange = (values, options) => {
  // Handle member selection change if needed
  console.log("Members changed:", { values, options });
};

// Panel methods
const closePanel = () => {
  emit("close");
};

const applyFilters = () => {
  // Clean up the filters before emitting
  const cleanFilters = { ...localFilters.value };

  // Remove empty arrays and empty strings
  Object.keys(cleanFilters).forEach((key) => {
    if (Array.isArray(cleanFilters[key]) && cleanFilters[key].length === 0) {
      delete cleanFilters[key];
    } else if (cleanFilters[key] === "" || cleanFilters[key] === null) {
      delete cleanFilters[key];
    }
  });

  emit("apply", cleanFilters);
  closePanel();
};

const resetFilters = () => {
  const resetValues = {
    search_text: "",
    start_date: "",
    end_date: "",
    project_ids: [],
    member_ids: [],
  };
  localFilters.value = resetValues;
  emit("reset");
};

// Watch for external filter changes to keep localFilters in sync
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = {
      search_text: newFilters.search_text || "",
      start_date: newFilters.start_date || "",
      end_date: newFilters.end_date || "",
      project_ids: Array.isArray(newFilters.project_ids)
        ? [...newFilters.project_ids]
        : [],
      member_ids: Array.isArray(newFilters.member_ids)
        ? [...newFilters.member_ids]
        : [],
    };
  },
  { deep: true, immediate: true }
);

// Load options when component mounts
onMounted(() => {
  loadProjectOptions();
  loadMemberOptions();
});
</script>
