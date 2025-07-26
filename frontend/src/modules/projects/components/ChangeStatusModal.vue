<template>
  <Modal
    :is-open="isOpen"
    @close="closeModal"
    title="Change Project Status"
    size="medium"
  >
    <div class="p-6 space-y-4">
      <div>
        <p class="text-sm text-gray-600 mb-4">
          Change status for {{ selectedProjects.length }} selected project{{
            selectedProjects.length > 1 ? "s" : ""
          }}:
        </p>

        <!-- Projects with Individual Status Selection -->
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div
            v-for="project in selectedProjects"
            :key="project.id"
            class="bg-gray-50 rounded-lg p-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 truncate">
                  {{ project.name }}
                </h4>
                <p class="text-xs text-gray-500 mt-1">
                  Current: {{ getStatusLabel(project.status) }}
                </p>
              </div>
              <div class="flex-shrink-0 w-48">
                <Select
                  v-model="projectStatuses[project.id]"
                  :options="getAvailableStatusOptions(project.status)"
                  :placeholder="`Select new status...`"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button variant="secondary" @click="closeModal" :disabled="isLoading">
          Cancel
        </Button>
        <Button
          variant="primary"
          @click="handleChangeStatus"
          :disabled="!hasAnyStatusSelected || isLoading"
          :loading="isLoading"
        >
          Change Status
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Modal from "@/components/ui/Modal.vue";
import Button from "@/components/ui/Button.vue";
import Select from "@/components/ui/Select.vue";
import {
  PROJECT_STATUS_LABELS,
  getAvailableStatusOptions,
} from "../constants/projectStatus";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  selectedProjects: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "change-status"]);

const projectStatuses = ref({});
const error = ref("");

// Check if any project has a status selected
const hasAnyStatusSelected = computed(() => {
  return Object.values(projectStatuses.value).some(
    (status) => status && status.trim() !== ""
  );
});

const getStatusLabel = (status) => {
  return PROJECT_STATUS_LABELS[status] || status;
};

const closeModal = () => {
  projectStatuses.value = {};
  error.value = "";
  emit("close");
};

const handleChangeStatus = () => {
  // Check if any status is selected
  if (!hasAnyStatusSelected.value) {
    error.value = "Please select at least one status to change";
    return;
  }

  error.value = "";

  // Build array of changes - only include projects with selected status
  const changes = [];
  Object.entries(projectStatuses.value).forEach(([projectId, newStatus]) => {
    if (newStatus && newStatus.trim() !== "") {
      changes.push({
        projectId: parseInt(projectId),
        newStatus: newStatus,
      });
    }
  });

  if (changes.length === 0) {
    error.value = "Please select at least one status to change";
    return;
  }

  emit("change-status", { changes });
};

// Reset form when modal opens/closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      projectStatuses.value = {};
      error.value = "";
    } else {
      // Initialize project statuses when modal opens
      const initialStatuses = {};
      props.selectedProjects.forEach((project) => {
        initialStatuses[project.id] = "";
      });
      projectStatuses.value = initialStatuses;
    }
  }
);
</script>
