<template>
  <Modal
    :is-open="isOpen"
    :title="`${memberName} - Worklog`"
    :subtitle="`View work activities for ${projectName}`"
    size="large"
    @close="closeModal"
  >
    <template #header-right>
      <div class="flex items-center gap-3">
        <!-- Date Range Info -->
        <div class="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {{ dateRangeText }}
        </div>
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
        <span class="text-gray-600">Loading member worklog...</span>
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
          Failed to load worklog data
        </h3>
        <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
        <button
          @click="fetchMemberWorklog"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="worklogData" class="flex-1 flex flex-col min-h-0">
      <!-- Summary Stats -->
      <div class="p-6 bg-blue-50 border-b border-gray-200 flex-shrink-0">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Total Days Logged -->
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Days</p>
              <p class="text-lg font-semibold text-blue-600">
                {{ totalDays }}
              </p>
            </div>
          </div>

          <!-- Total Time Logged -->
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Time</p>
              <p class="text-lg font-semibold text-blue-600">
                {{ totalTimeLogged }}
              </p>
            </div>
          </div>

          <!-- Average per Day -->
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
              <p class="text-sm font-medium text-gray-500">Avg per Day</p>
              <p class="text-lg font-semibold text-blue-600">
                {{ averagePerDay }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Worklog Table (same as WorklogTable component) -->
      <div class="flex-1 overflow-y-auto">
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
            <div class="col-span-2">Actions</div>
          </div>
        </div>

        <!-- Table Body -->
        <div class="divide-y divide-gray-200">
          <div
            v-for="worklog in filteredData"
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
              <div class="col-span-2"></div>
              <div class="col-span-2">
                <span class="text-sm font-medium text-gray-900">{{
                  worklog.formattedDuration
                }}</span>
              </div>
              <div class="col-span-2">
                <div class="flex items-center gap-2">
                  <div
                    class="w-full bg-gray-200 rounded-full h-2 max-w-[100px]"
                  >
                    <div
                      class="h-2 rounded-full transition-all duration-300"
                      :class="getProgressColor(worklog.percentOfDay)"
                      :style="{
                        width: Math.min(worklog.percentOfDay, 100) + '%',
                      }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-600 min-w-[40px]"
                    >{{ worklog.percentOfDay }}%</span
                  >
                </div>
              </div>
              <div class="col-span-2">
                <button
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  @click="viewEntry(worklog?.date)"
                >
                  View Details
                </button>
              </div>
            </div>

            <!-- Entries for this date -->
            <div class="mt-2 space-y-1">
              <div
                v-for="entry in worklog.entries"
                :key="entry.id"
                class="grid grid-cols-12 gap-4 items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                @click="viewEntry(entry)"
              >
                <div class="col-span-2"></div>
                <div class="col-span-2">
                  <TruncateText
                    :name="entry.project_name"
                    text-class="text-sm text-gray-900"
                  />
                </div>
                <div class="col-span-2">
                  <div
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium max-w-full"
                    :class="getCategoryStyle(entry.category)"
                  >
                    <TruncateText
                      :name="entry.category"
                      text-class="text-xs font-medium"
                    />
                  </div>
                </div>
                <div class="col-span-2">
                  <span class="text-sm text-gray-900">{{
                    entry.formattedDuration
                  }}</span>
                </div>
                <div class="col-span-2">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-full bg-gray-200 rounded-full h-2 max-w-[100px]"
                    >
                      <div
                        class="h-2 rounded-full transition-all duration-300"
                        :class="getProgressColor(entry.progress)"
                        :style="{ width: Math.min(entry.progress, 100) + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-600 min-w-[40px]"
                      >{{ entry.progress }}%</span
                    >
                  </div>
                </div>
                <div class="col-span-2"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!filteredData.length" class="text-center py-12">
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
            No worklog data found
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            This member hasn't logged any work for this project yet.
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
        </div>
      </div>
    </div>
  </Modal>

  <!-- Worklog Detail Modal -->
  <WorklogDetailModal
    :is-open="showWorklogDetailModal"
    :worklog-id="selectedWorklogId"
    :date="selectedWorklogDate"
    @close="closeWorklogDetailModal"
    @refresh="fetchMemberWorklog"
  />
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Modal from "@/components/ui/Modal.vue";
import TruncateText from "@/components/ui/TruncateText.vue";
import WorklogDetailModal from "@/modules/worklogs/components/WorklogDetailModal.vue";
import { getWorklogs } from "@/modules/worklogs/services/worklogService";
import { format, parseISO } from "date-fns";
import { useWorklogData } from "@/modules/worklogs/composables/useWorklogData";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  memberId: {
    type: [String, Number],
    default: null,
  },
  memberName: {
    type: String,
    default: "",
  },
  projectId: {
    type: [String, Number],
    default: null,
  },
  projectName: {
    type: String,
    default: "",
  },
  createdAfter: {
    type: String,
    default: null,
  },
  createdBefore: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["close"]);

const isLoading = ref(false);
const error = ref(null);
const worklogData = ref(null);

// WorklogDetailModal state
const showWorklogDetailModal = ref(false);
const selectedWorklogId = ref(null);
const selectedWorklogDate = ref("");

// Use worklog data composable
const {
  getCategoryStyle,
  formatDuration,
  getProgressColor,
  transformWorklogData,
} = useWorklogData();

// Process worklog data for display (same as WorklogTable)
const transformedData = computed(() => {
  return transformWorklogData(worklogData.value);
});

// Filter data by project if needed
const filteredData = computed(() => {
  if (!props.projectName && !props.projectId) {
    return transformedData.value;
  }

  const projectFilter = props.projectName || props.projectId;
  return transformedData.value
    .map((day) => ({
      ...day,
      entries: day.entries.filter(
        (entry) =>
          entry.project_name === projectFilter ||
          entry.project_name.includes(projectFilter) ||
          entry.project_id === projectFilter ||
          projectFilter.toString() === entry.project_name ||
          entry.project_name
            .toLowerCase()
            .includes(projectFilter.toString().toLowerCase())
      ),
    }))
    .filter((day) => day.entries.length > 0);
});

// Calculate summary stats
const totalDays = computed(() => filteredData.value.length);
const totalTimeLogged = computed(() => {
  const totalMinutes = filteredData.value.reduce(
    (sum, day) => sum + day.duration,
    0
  );
  return formatDuration(totalMinutes);
});
const averagePerDay = computed(() => {
  if (totalDays.value === 0) return "0h";
  const totalMinutes = filteredData.value.reduce(
    (sum, day) => sum + day.duration,
    0
  );
  return formatDuration(Math.round(totalMinutes / totalDays.value));
});

const dateRangeText = computed(() => {
  // If we have specific date range from props, use that
  if (props.createdAfter && props.createdBefore) {
    try {
      const startDate = format(parseISO(props.createdAfter), "dd/MM/yyyy");
      const endDate = format(parseISO(props.createdBefore), "dd/MM/yyyy");
      return `${startDate} - ${endDate}`;
    } catch (error) {
      console.error("Error formatting props date range:", error);
    }
  }

  // Otherwise, use data from filtered worklog
  if (!filteredData.value || !filteredData.value.length) {
    return "No data";
  }

  try {
    const dates = filteredData.value.map((d) => d.date).sort();
    if (dates.length === 0) return "No data";

    const startDate = format(parseISO(dates[0]), "dd/MM/yyyy");
    const endDate = format(parseISO(dates[dates.length - 1]), "dd/MM/yyyy");
    return dates.length === 1 ? startDate : `${startDate} - ${endDate}`;
  } catch (error) {
    console.error("Error formatting date range:", error);
    return "Date range unavailable";
  }
});

// Fetch member worklog data
const fetchMemberWorklog = async () => {
  if (!props.memberId || !props.projectId) return;

  isLoading.value = true;
  error.value = null;

  try {
    // Call the worklog API with filters for user_id and project_id
    // The API endpoint is /worklogs/list/grouped-by-date
    const params = {
      user_id: props.memberId,
      project_id: props.projectId,
    };

    // Add date range filters if provided
    if (props.createdAfter) {
      params.created_after = props.createdAfter;
    }
    if (props.createdBefore) {
      params.created_before = props.createdBefore;
    }

    const response = await getWorklogs(params);

    // The response structure might be different from what the component expects
    // Make sure we're handling it correctly
    worklogData.value = response.data;
  } catch (err) {
    console.error("Failed to fetch member worklog:", err);
    error.value = err.message || "Failed to fetch worklog data";
  } finally {
    isLoading.value = false;
  }
};

// View entry details (similar to WorklogTable)
const viewEntry = (entry) => {
  selectedWorklogId.value = entry;
  selectedWorklogDate.value = entry;
  showWorklogDetailModal.value = true;
};

// Close WorklogDetailModal
const closeWorklogDetailModal = () => {
  showWorklogDetailModal.value = false;
  selectedWorklogId.value = null;
  selectedWorklogDate.value = "";
};

const closeModal = () => {
  emit("close");
};

// Fetch data when modal is opened and memberId/projectId are available
watch(
  () => [
    props.isOpen,
    props.memberId,
    props.projectId,
    props.createdAfter,
    props.createdBefore,
  ],
  ([isOpen, memberId, projectId, createdAfter, createdBefore]) => {
    if (isOpen && memberId && projectId) {
      worklogData.value = null; // Reset data before fetching
      fetchMemberWorklog();
    }
  },
  { immediate: true }
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
