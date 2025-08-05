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
        <h2 class="text-lg font-semibold text-gray-900">
          {{ $t("user_management.filters_title") }}
        </h2>
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
            {{ $t("user_management.search_users") }}
          </label>
          <Input
            v-model="localFilters.search"
            :placeholder="$t('user_management.search_placeholder')"
          />
        </div>

        <!-- Other filters are temporarily hidden -->
        <!-- Status, Role, Department, and Workload filters will be added back later -->
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
            {{ $t("common.reset_all") }}
          </Button>
          <Button variant="primary" class="flex-1" @click="applyFilters">
            {{ $t("common.apply_filters") }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import Input from "@/components/ui/Input.vue";
import Select from "@/components/ui/Select.vue";
import MultiSelect from "@/components/ui/MultiSelect.vue";
import Button from "@/components/ui/Button.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  availableRoles: {
    type: Array,
    default: () => [],
  },
  availableDepartments: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "apply", "reset"]);

// Local filter state - only search for now
const localFilters = ref({
  search: props.filters.search || "",
  // Other filters are temporarily disabled
  // status: props.filters.status || "",
  // roles: Array.isArray(props.filters.roles) ? [...props.filters.roles] : [],
  // departments: Array.isArray(props.filters.departments)
  //   ? [...props.filters.departments]
  //   : [],
  // minWorkload: props.filters.minWorkload || null,
  // maxWorkload: props.filters.maxWorkload || null,
});

// Status options
const statusOptions = computed(() => [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]);

// Role options
const roleOptions = computed(() =>
  props.availableRoles.map((role) => ({
    label: role,
    value: role,
  }))
);

// Department options
const departmentOptions = computed(() =>
  props.availableDepartments.map((department) => ({
    label: department,
    value: department,
  }))
);

// Panel methods
const closePanel = () => {
  emit("close");
};

const applyFilters = () => {
  // Clean up the filters before emitting
  const cleanFilters = { ...localFilters.value };

  // Remove empty arrays and empty/null values
  Object.keys(cleanFilters).forEach((key) => {
    if (Array.isArray(cleanFilters[key]) && cleanFilters[key].length === 0) {
      delete cleanFilters[key];
    } else if (
      cleanFilters[key] === "" ||
      cleanFilters[key] === null ||
      cleanFilters[key] === undefined
    ) {
      delete cleanFilters[key];
    }
  });

  emit("apply", cleanFilters);
  closePanel();
};

const resetFilters = () => {
  const resetValues = {
    search: "",
    // Other filters are temporarily disabled
    // status: "",
    // roles: [],
    // departments: [],
    // minWorkload: null,
    // maxWorkload: null,
  };
  localFilters.value = resetValues;
  emit("reset");
};

// Watch for external filter changes to keep localFilters in sync
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = {
      search: newFilters.search || "",
      // Other filters are temporarily disabled
      // status: newFilters.status || "",
      // roles: Array.isArray(newFilters.roles) ? [...newFilters.roles] : [],
      // departments: Array.isArray(newFilters.departments)
      //   ? [...newFilters.departments]
      //   : [],
      // minWorkload: newFilters.minWorkload || null,
      // maxWorkload: newFilters.maxWorkload || null,
    };
  },
  { deep: true, immediate: true }
);
</script>
