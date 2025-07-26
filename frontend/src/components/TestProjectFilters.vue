<template>
  <div class="p-6">
    <h2 class="text-lg font-semibold mb-4">Test Project Filters</h2>

    <div class="mb-4">
      <Button @click="showFilters = true" variant="primary">
        Open Filters
      </Button>
    </div>

    <div class="mt-4 p-4 bg-gray-100 rounded">
      <h3 class="font-medium mb-2">Current Filters:</h3>
      <pre>{{ JSON.stringify(filters, null, 2) }}</pre>
    </div>

    <!-- Project Filters Component -->
    <ProjectFilters
      :is-open="showFilters"
      :filters="filters"
      @close="showFilters = false"
      @apply="handleApplyFilters"
      @reset="handleResetFilters"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Button from "@/components/ui/Button.vue";
import ProjectFilters from "@/modules/projects/components/ProjectFilters.vue";

const showFilters = ref(false);

const filters = ref({
  search_text: "",
  start_date: "",
  end_date: "",
  project_ids: [],
  member_ids: [],
});

const handleApplyFilters = (newFilters) => {
  console.log("Apply filters:", newFilters);
  filters.value = { ...filters.value, ...newFilters };
  showFilters.value = false;
};

const handleResetFilters = () => {
  console.log("Reset filters");
  filters.value = {
    search_text: "",
    start_date: "",
    end_date: "",
    project_ids: [],
    member_ids: [],
  };
};
</script>
