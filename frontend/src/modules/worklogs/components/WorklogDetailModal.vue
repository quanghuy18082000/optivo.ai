<template>
  <Modal
    :is-open="isOpen"
    :title="`Worklog Details - ${formatDate(worklogDetail?.date)}`"
    subtitle="Detailed view of logged work entries for this date"
    size="large"
    @close="closeModal"
  >
    <template #header-right>
      <!-- Update Expires Info -->
      <div
        v-if="worklogDetail?.update_expires_in"
        class="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full"
      >
        Update expires in: {{ worklogDetail.update_expires_in }}
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center p-8">
      <div class="flex items-center gap-3">
        <svg
          class="animate-spin h-8 w-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="text-gray-600">Loading worklog details...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center p-8">
      <div class="text-center">
        <svg
          class="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">
          Failed to load worklog details
        </h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <button
          @click="fetchWorklogDetail"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="worklogDetail" class="flex-1 flex flex-col min-h-0">
      <!-- Summary Stats -->
      <div class="p-6 bg-blue-50 border-b border-gray-200 flex-shrink-0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Time Logged -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Time Logged</p>
              <p class="text-lg font-semibold text-blue-600">
                {{ worklogDetail.total_time_logged }}
              </p>
            </div>
          </div>

          <!-- Total Entries -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 01-2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Entries</p>
              <p class="text-lg font-semibold text-blue-600">
                {{ worklogDetail.total_entries }}
              </p>
            </div>
          </div>

          <!-- Average Time per Entry -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Avg per Entry</p>
              <p class="text-lg font-semibold text-blue-600">
                {{ calculateAverageTime() }}
              </p>
            </div>
          </div>

          <!-- Most Used Category -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Top Category</p>
              <p class="text-lg font-semibold text-blue-600">
                {{ getMostUsedCategory() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Header -->
      <div class="p-6 border-b border-gray-200 flex-shrink-0">
        <div
          class="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider"
        >
          <div class="col-span-2">Project</div>
          <div class="col-span-2">Category</div>
          <div class="col-span-4">Description</div>
          <div class="col-span-1">Hours</div>
          <div class="col-span-1">Minutes</div>
          <div class="col-span-2">Actions</div>
        </div>
      </div>

      <!-- Entries List -->
      <div class="flex-1 overflow-y-auto">
        <div class="divide-y divide-gray-200">
          <div
            v-for="entry in worklogDetail.entries"
            :key="entry.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="grid grid-cols-12 gap-4 items-center">
              <!-- Project -->
              <div class="col-span-2">
                <div
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {{ entry.project_name }}
                </div>
              </div>

              <!-- Category -->
              <div class="col-span-2">
                <div
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="getCategoryStyle(entry.category)"
                >
                  {{ entry.category }}
                </div>
              </div>

              <!-- Description -->
              <div class="col-span-4">
                <p class="text-sm text-gray-900">
                  {{ entry.description }}
                </p>
              </div>

              <!-- Hours -->
              <div class="col-span-1">
                <span class="text-sm font-medium text-gray-900">
                  {{ entry.hours }}
                </span>
              </div>

              <!-- Minutes -->
              <div class="col-span-1">
                <span class="text-sm font-medium text-gray-900">
                  {{ entry.minutes.toString().padStart(2, "0") }}
                </span>
              </div>

              <!-- Actions -->
              <div class="col-span-2">
                <div class="flex items-center gap-2">
                  <button
                    @click="editEntry(entry.id)"
                    class="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit entry"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="deleteEntry(entry.id)"
                    class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete entry"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!worklogDetail.entries?.length" class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 01-2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            No entries found
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            This worklog doesn't have any entries yet.
          </p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-6 border-t border-gray-200 flex-shrink-0">
        <div class="flex justify-end gap-4">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            @click="editWorklog"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Worklog
          </button>
        </div>
      </div>
    </div>
  </Modal>

  <!-- Delete Confirmation Modal -->
  <ConfirmModal
    v-model="showDeleteConfirmation"
    title="Delete Entry"
    :message="deleteConfirmMessage"
    confirm-text="Delete"
    @confirm="confirmDeleteEntry"
  />
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import Modal from "@/components/ui/Modal.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { getWorklogById, deleteWorklogEntry } from "../services/worklogService";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  worklogId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(["close", "refresh"]);

const router = useRouter();
const isLoading = ref(false);
const error = ref(null);
const worklogDetail = ref(null);
const showDeleteConfirmation = ref(false);
const entryToDelete = ref(null);
const deleteConfirmMessage = ref("");

const getCategoryStyle = (category) => {
  const styles = {
    Meeting: "bg-purple-100 text-purple-800",
    Development: "bg-blue-100 text-blue-800",
    "Bug Fix": "bg-red-100 text-red-800",
    Learning: "bg-yellow-100 text-yellow-800",
    Testing: "bg-green-100 text-green-800",
    Communication: "bg-indigo-100 text-indigo-800",
    Coding: "bg-emerald-100 text-emerald-800",
  };
  return styles[category] || "bg-gray-100 text-gray-800";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const calculateAverageTime = () => {
  if (!worklogDetail.value?.entries?.length) return "0h 0m";

  const totalMinutes = worklogDetail.value.entries.reduce((total, entry) => {
    return total + entry.hours * 60 + entry.minutes;
  }, 0);

  const avgMinutes = Math.round(
    totalMinutes / worklogDetail.value.entries.length
  );
  const hours = Math.floor(avgMinutes / 60);
  const minutes = avgMinutes % 60;

  return `${hours}h ${minutes}m`;
};

const getMostUsedCategory = () => {
  if (!worklogDetail.value?.entries?.length) return "N/A";

  const categoryCount = {};
  worklogDetail.value.entries.forEach((entry) => {
    categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
  });

  const mostUsed = Object.entries(categoryCount).reduce((a, b) =>
    categoryCount[a[0]] > categoryCount[b[0]] ? a : b
  );

  return mostUsed[0];
};

const fetchWorklogDetail = async () => {
  if (!props.worklogId) return;

  isLoading.value = true;
  error.value = null;

  try {
    const response = await getWorklogById(props.worklogId);
    worklogDetail.value = response.data;
  } catch (apiError) {
    console.error("Failed to fetch worklog details:", apiError);
    error.value = apiError.message || "Failed to fetch worklog details";
  } finally {
    isLoading.value = false;
  }
};

const deleteEntry = (entryId) => {
  // Find the entry to delete
  const entry = worklogDetail.value.entries.find((e) => e.id === entryId);
  if (!entry) return;

  // Set the entry to delete and show confirmation
  entryToDelete.value = entryId;

  // Create a descriptive message
  let description = entry.description || entry.category;
  if (description.length > 30) {
    description = description.substring(0, 30) + "...";
  }

  deleteConfirmMessage.value = `Are you sure you want to delete the entry "${description}" (${entry.hours}h ${entry.minutes}m)?`;
  showDeleteConfirmation.value = true;
};

const confirmDeleteEntry = async () => {
  if (!entryToDelete.value) return;

  try {
    // Call the API to delete the entry
    await deleteWorklogEntry(props.worklogId, entryToDelete.value);

    // Update the UI by removing the entry from the current data
    const entryIndex = worklogDetail.value.entries.findIndex(
      (e) => e.id === entryToDelete.value
    );

    if (entryIndex > -1) {
      worklogDetail.value.entries.splice(entryIndex, 1);
      worklogDetail.value.total_entries = worklogDetail.value.entries.length;

      // Recalculate total time
      const totalMinutes = worklogDetail.value.entries.reduce(
        (total, entry) => {
          return total + entry.hours * 60 + entry.minutes;
        },
        0
      );
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      worklogDetail.value.total_time_logged = `${hours}h ${minutes}m`;
    }

    // Reset state
    entryToDelete.value = null;

    // Notify parent component to refresh data
    emit("refresh");
  } catch (error) {
    console.error("Failed to delete entry:", error);
    alert("Failed to delete entry. Please try again.");
  }
};

const editEntry = (entryId) => {
  // TODO: Implement edit entry functionality
  console.log("Edit entry:", entryId);
  // Could navigate to an edit entry page or open a modal
};

const editWorklog = () => {
  router.push(`/worklog/edit/${props.worklogId}`);
  closeModal();
};

const closeModal = () => {
  emit("close");
};

// Watch for worklogId changes to fetch new data
watch(
  () => props.worklogId,
  (newId) => {
    if (newId && props.isOpen) {
      fetchWorklogDetail();
    }
  }
);

// Watch for modal open to fetch data
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.worklogId) {
      fetchWorklogDetail();
    }
  }
);
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
