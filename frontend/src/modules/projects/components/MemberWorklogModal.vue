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

      <!-- Worklog List -->
      <div class="flex-1 overflow-y-auto">
        <div class="divide-y divide-gray-200">
          <div
            v-for="dayLog in processedWorklogData"
            :key="dayLog.date"
            class="p-6"
          >
            <!-- Day Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ dayLog.dayName }}
                </h3>
                <span class="text-sm text-gray-500">{{ dayLog.formattedDate }}</span>
              </div>
              <div class="text-sm text-gray-600">
                Total: {{ dayLog.totalTime }}
              </div>
            </div>

            <!-- Activities for the day -->
            <div class="space-y-3">
              <div
                v-for="activity in dayLog.activities"
                :key="activity.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-4 flex-1">
                  <!-- Category -->
                  <div
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    :class="getCategoryStyle(activity.category)"
                  >
                    {{ activity.category }}
                  </div>

                  <!-- Time and Progress Bar -->
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium text-gray-900">
                        {{ activity.timeSpent }}
                      </span>
                      <span class="text-sm text-gray-500">
                        {{ activity.percentage }}
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        :style="{ width: activity.percentage }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No activities state -->
              <div v-if="dayLog.activities.length === 0" class="text-center py-4">
                <span class="text-gray-500 text-sm">N/A</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!processedWorklogData.length" class="text-center py-12">
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
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Modal from "@/components/ui/Modal.vue";
import { getWorklogs } from "../services/projectService";
import { format, parseISO } from "date-fns";

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
});

const emit = defineEmits(["close"]);

const isLoading = ref(false);
const error = ref(null);
const worklogData = ref(null);

// Category color mapping
const getCategoryStyle = (category) => {
  const styles = {
    Communication: "bg-blue-100 text-blue-800",
    Coding: "bg-green-100 text-green-800",
    Testing: "bg-yellow-100 text-yellow-800",
    Meeting: "bg-purple-100 text-purple-800",
    Design: "bg-pink-100 text-pink-800",
    Documentation: "bg-indigo-100 text-indigo-800",
    Research: "bg-gray-100 text-gray-800",
    Planning: "bg-orange-100 text-orange-800",
    Review: "bg-teal-100 text-teal-800",
    Learning: "bg-red-100 text-red-800",
  };
  return styles[category] || "bg-gray-100 text-gray-800";
};

// Format time duration
const formatDuration = (hours, minutes) => {
  if (hours === 0 && minutes === 0) return "0h";
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

// Calculate percentage of 8-hour workday
const calculatePercentage = (hours, minutes) => {
  const totalMinutes = hours * 60 + minutes;
  const workdayMinutes = 8 * 60; // 8 hours
  return Math.round((totalMinutes / workdayMinutes) * 100);
};

// Process worklog data for display
const processedWorklogData = computed(() => {
  if (!worklogData.value || !worklogData.value.worklog) return [];

  const days = [];
  const worklogEntries = worklogData.value.worklog;

  // Get all unique dates and sort them
  const allDates = Object.keys(worklogEntries).sort((a, b) => new Date(b) - new Date(a));

  allDates.forEach(date => {
    const dayEntries = worklogEntries[date] || [];
    const activities = [];

    // Process each day's entries
    dayEntries.forEach(dayEntry => {
      Object.entries(dayEntry).forEach(([projectName, projectData]) => {
        if (Array.isArray(projectData)) {
          projectData.forEach(categoryData => {
            Object.entries(categoryData).forEach(([category, details]) => {
              const hours = Math.floor(details.work_time);
              const minutes = Math.round((details.work_time - hours) * 60);
              const percentage = calculatePercentage(hours, minutes);

              activities.push({
                id: `${date}-${category}-${Math.random()}`,
                category,
                timeSpent: formatDuration(hours, minutes),
                percentage: `${percentage}%`,
                hours,
                minutes,
              });
            });
          });
        }
      });
    });

    // Calculate total time for the day
    const totalMinutes = activities.reduce((sum, activity) => {
      return sum + (activity.hours * 60 + activity.minutes);
    }, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    days.push({
      date,
      dayName: format(parseISO(date), 'EEEE'),
      formattedDate: format(parseISO(date), 'dd/MMM/yyyy'),
      activities,
      totalTime: formatDuration(totalHours, remainingMinutes),
      totalMinutes,
    });
  });

  return days;
});

// Computed statistics
const totalDays = computed(() => {
  return processedWorklogData.value.length;
});

const totalTimeLogged = computed(() => {
  const totalMinutes = processedWorklogData.value.reduce((sum, day) => {
    return sum + day.totalMinutes;
  }, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return formatDuration(hours, minutes);
});

const averagePerDay = computed(() => {
  if (totalDays.value === 0) return "0h";
  const totalMinutes = processedWorklogData.value.reduce((sum, day) => {
    return sum + day.totalMinutes;
  }, 0);
  const avgMinutes = Math.round(totalMinutes / totalDays.value);
  const hours = Math.floor(avgMinutes / 60);
  const minutes = avgMinutes % 60;
  return formatDuration(hours, minutes);
});

const dateRangeText = computed(() => {
  if (!processedWorklogData.value.length) return "No data";
  const dates = processedWorklogData.value.map(d => d.date).sort();
  const startDate = format(parseISO(dates[0]), 'dd/MM/yyyy');
  const endDate = format(parseISO(dates[dates.length - 1]), 'dd/MM/yyyy');
  return dates.length === 1 ? startDate : `${startDate} - ${endDate}`;
});

// Fetch member worklog data
const fetchMemberWorklog = async () => {
  if (!props.memberId || !props.projectId) return;

  isLoading.value = true;
  error.value = null;

  try {
    // Call the worklog API with filters for user_id and project_id
    const response = await getWorklogs({
      user_id: props.memberId,
      project_id: props.projectId,
      // Add date range if needed
      // created_after: '2025-01-01T00:00:00Z',
      // created_before: '2025-12-31T23:59:59Z',
    });

    worklogData.value = response.data;
  } catch (err) {
    console.error("Failed to fetch member worklog:", err);
    error.value = err.message || "Failed to fetch worklog data";
    
    // Fallback to mock data for demonstration
    worklogData.value = getMockMemberWorklog(props.memberId, props.projectId);
  } finally {
    isLoading.value = false;
  }
};

// Mock data generator for demonstration
const getMockMemberWorklog = (memberId, projectId) => {
  return {
    worktimeOfday: 8,
    worklog: {
      "2025-02-04": [
        {
          [props.projectName]: [
            {
              "Communication": {
                work_time: 2.0,
                progress: 1.0
              }
            },
            {
              "Coding": {
                work_time: 2.0,
                progress: 1.0
              }
            },
            {
              "Testing": {
                work_time: 1.0,
                progress: 0.5
              }
            },
            {
              "Meeting": {
                work_time: 1.0,
                progress: 0.5
              }
            }
          ]
        }
      ],
      "2025-02-05": [
        {
          [props.projectName]: [
            {
              "Communication": {
                work_time: 2.0,
                progress: 1.0
              }
            },
            {
              "Coding": {
                work_time: 2.0,
                progress: 1.0
              }
            },
            {
              "Testing": {
                work_time: 1.0,
                progress: 0.5
              }
            },
            {
              "Meeting": {
                work_time: 1.0,
                progress: 0.5
              }
            }
          ]
        }
      ],
      "2025-02-06": [
        {
          [props.projectName]: [
            {
              "Communication": {
                work_time: 2.0,
                progress: 1.0
              }
            },
            {
              "Coding": {
                work_time: 2.0,
                progress: 1.0
              }
            },
            {
              "Testing": {
                work_time: 1.0,
                progress: 0.5
              }
            },
            {
              "Meeting": {
                work_time: 1.0,
                progress: 0.5
              }
            }
          ]
        }
      ],
      "2025-02-07": [
        {
          [props.projectName]: [
            {
              "Communication": {
                work_time: 2.0,
                progress: 1.0
              }
            },
            {
              "Coding": {
                work_time: 2.0,
                progress: 1.0
              }
            },
            {
              "Testing": {
                work_time: 1.0,
                progress: 0.5
              }
            },
            {
              "Meeting": {
                work_time: 1.0,
                progress: 0.5
              }
            }
          ]
        }
      ],
      "2025-02-08": [
        {
          [props.projectName]: [
            {
              "Communication": {
                work_time: 2.0,
                progress: 1.0
              }
            },
            {
              "Coding": {
                work_time: 2.0,
                progress: 1.0
              }
            },
            {
              "Testing": {
                work_time: 1.0,
                progress: 0.5
              }
            },
            {
              "Meeting": {
                work_time: 1.0,
                progress: 0.5
              }
            }
          ]
        }
      ]
    }
  };
};

const closeModal = () => {
  emit("close");
};

// Watch for modal open to fetch data
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.memberId && props.projectId) {
      worklogData.value = null;
      fetchMemberWorklog();
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