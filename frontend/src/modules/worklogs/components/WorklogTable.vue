<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Table Header -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div
        class="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider"
      >
        <div class="col-span-2">Date</div>
        <div class="col-span-2">Project</div>
        <div class="col-span-2">Category</div>
        <div class="col-span-2">Time</div>
        <div class="col-span-2">Progress</div>
        <div class="col-span-2"></div>
      </div>
    </div>

    <!-- Table Body -->
    <div class="divide-y divide-gray-200">
      <div
        v-for="worklog in transformedData"
        :key="worklog.id"
        class="px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <!-- Date Row -->
        <div
          class="grid grid-cols-12 gap-4 items-center bg-blue-50 p-2 rounded-md"
        >
          <div class="col-span-2">
            <div class="flex items-center gap-2">
              <div
                class="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-900">{{
                worklog.formattedDate
              }}</span>
            </div>
          </div>
          <div class="col-span-2"></div>
          <div class="col-span-2">
            <span class="text-xs font-medium text-gray-500"
              >{{ worklog.entries.length }} ENTRIES</span
            >
          </div>
          <div class="col-span-2">
            <span class="text-sm font-medium text-gray-900"
              >{{ worklog?.percentOfDay }}% ({{
                worklog.formattedDuration
              }})</span
            >
          </div>
          <div class="col-span-2">
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-white rounded-full h-2">
                <div
                  :class="getProgressColor(worklog?.percentOfDay)"
                  class="h-2 rounded-full transition-all duration-300"
                  :style="{
                    width: `${Math.min(100, worklog?.percentOfDay || 0)}%`,
                  }"
                ></div>
              </div>
              <span class="text-sm text-gray-600 font-medium min-w-[3rem]"
                >{{ worklog?.percentOfDay }}%</span
              >
            </div>
          </div>
          <div class="col-span-2">
            <div class="flex justify-end">
              <button
                @click="viewWorklog(worklog)"
                class="p-2 text-blue-500 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-100"
                title="View day details"
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Sub-rows for projects and categories -->
        <div class="mt-3 space-y-2">
          <div
            v-for="entry in worklog.entries"
            :key="entry.id"
            class="grid grid-cols-12 gap-4 items-center pl-6 py-2 bg-gray-50 rounded"
          >
            <div class="col-span-2"></div>
            <div class="col-span-2">
              <div class="flex items-center gap-2">
                <div
                  v-if="
                    entry.project_name !== 'Unknown Project' &&
                    entry.project_name !== ''
                  "
                  class="w-2 h-2 rounded-full"
                  :style="{ backgroundColor: entry.color || '#3B82F6' }"
                ></div>

                <TruncateText
                  :name="
                    entry.project_name === 'Unknown Project'
                      ? ''
                      : entry.project_name
                  "
                  text-class="text-sm font-medium text-gray-700"
                />
              </div>
            </div>
            <div class="col-span-2">
              <div class="flex items-center gap-2">
                <TruncateText
                  :name="entry.category"
                  text-class="text-sm text-gray-700"
                />
                <TruncateText
                  :name="entry.category_type"
                  text-class="text-xs text-gray-500"
                />
              </div>
            </div>
            <div class="col-span-2">
              <span class="text-sm text-gray-600">{{ entry.time_spent }}</span>
            </div>
            <div class="col-span-2">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    :class="entry.progress > 100 ? 'bg-red-500' : 'bg-gray-800'"
                    class="h-1.5 rounded-full transition-all duration-300"
                    :style="{ width: `${Math.min(100, entry.progress || 0)}%` }"
                  ></div>
                </div>
                <span class="text-xs text-gray-600 font-medium min-w-[2.5rem]">
                  {{ entry.progress }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!transformedData?.length" class="text-center py-12">
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
      <h3 class="mt-2 text-sm font-medium text-gray-900">No worklogs found</h3>
      <p class="mt-1 text-sm text-gray-500">
        Get started by logging your first work entry.
      </p>
    </div>

    <!-- Worklog Detail Modal -->
    <WorklogDetailModal
      :is-open="showDetailModal"
      :worklog-id="selectedWorklogId"
      :date="selectedWorklogDate"
      @close="closeDetailModal"
      @refresh="$emit('refresh')"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-model="showDeleteConfirmation"
      title="Delete Worklog"
      :message="deleteConfirmMessage"
      confirm-text="Delete"
      @confirm="confirmDeleteWorklog"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import WorklogDetailModal from "./WorklogDetailModal.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import TruncateText from "@/components/ui/TruncateText.vue";
import { deleteWorklog as deleteWorklogAPI } from "../services/worklogService";
import { useWorklogData } from "../composables/useWorklogData";

// Props definition
const props = defineProps({
  worklogs: {
    type: Object,
    default: () => ({ data: [], total: 0 }),
  },
});

// Emit events
const emit = defineEmits(["refresh"]);

// States
const transformedData = ref([]);
const activeActionMenu = ref(null);
const showDetailModal = ref(false);
const selectedWorklogId = ref(null);
const selectedWorklogDate = ref("");
const showDeleteConfirmation = ref(false);
const worklogToDelete = ref(null);
const deleteConfirmMessage = ref("");

// Use worklog data composable
const {
  formatDuration,
  formatDate,
  getProgressColor,
  getProjectName,
  transformWorklogData,
} = useWorklogData();

// Functions
const viewWorklog = (worklog) => {
  selectedWorklogId.value = worklog.id;
  selectedWorklogDate.value = worklog.date;
  showDetailModal.value = true;
  activeActionMenu.value = null;
};

// Delete worklog confirmation
const confirmDeleteWorklog = async () => {
  if (!worklogToDelete.value) return;

  try {
    await deleteWorklogAPI(worklogToDelete.value);
    worklogToDelete.value = null;
    emit("refresh");
  } catch (error) {
    console.error("Failed to delete worklog:", error);
  }
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedWorklogId.value = null;
};

// Watch for changes in the worklogs prop
watch(
  () => props.worklogs,
  (newWorklogs) => {
    transformedData.value = transformWorklogData(newWorklogs);
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
/* Custom scrollbar styles */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Hide scrollbar for Firefox */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}
</style>
