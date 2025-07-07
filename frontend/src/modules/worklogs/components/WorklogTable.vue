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
        <div class="col-span-2">Actions</div>
      </div>
    </div>

    <!-- Table Body -->
    <div class="divide-y divide-gray-200">
      <div
        v-for="worklog in transformedData"
        :key="worklog.id"
        class="px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <!-- Main Row -->
        <div class="grid grid-cols-12 gap-4 items-center">
          <div class="col-span-2">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span class="text-sm font-medium text-gray-900">
                {{ worklog.formattedDate }}
              </span>
            </div>
          </div>

          <div class="col-span-2">
            <span class="text-sm font-medium text-gray-900">
              {{ worklog.project?.name }}
            </span>
          </div>

          <div class="col-span-2">
            <div class="flex items-center gap-2">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: worklog.project?.color }"
              ></div>
              <span class="text-sm text-gray-700">
                {{ worklog.category }}
              </span>
            </div>
          </div>

          <div class="col-span-2">
            <span class="text-sm font-medium text-gray-900">
              {{ worklog?.percentOfDay }}% ({{ worklog.formattedDuration }})
            </span>
          </div>

          <div class="col-span-2">
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  :class="getProgressColor(worklog.overall_progress)"
                  class="h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${worklog.overall_progress}%` }"
                ></div>
              </div>
              <span class="text-sm text-gray-600 font-medium min-w-[3rem]"
                >{{ worklog.overall_progress }}%</span
              >
            </div>
          </div>

          <div class="col-span-2">
            <div class="relative">
              <button
                @click="toggleActions(worklog.id)"
                class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                  />
                </svg>
              </button>

              <!-- Actions Dropdown -->
              <div
                v-if="activeActionMenu === worklog.id"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              >
                <button
                  @click="viewWorklog(worklog.id)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg
                    class="w-4 h-4"
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
                  View Details
                </button>
                <button
                  @click="editWorklog(worklog.id)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg
                    class="w-4 h-4"
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
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sub-rows for categories -->
        <div class="mt-3 space-y-2">
          <div
            v-for="entry in worklog.entries"
            :key="entry.id"
            class="grid grid-cols-12 gap-4 items-center pl-6 py-2 bg-gray-25 rounded"
          >
            <div class="col-span-2"></div>
            <div class="col-span-2"></div>
            <div class="col-span-2">
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: getCategoryColor(entry.category) }"
                ></div>
                <span class="text-sm text-gray-700">{{ entry.category }}</span>
              </div>
            </div>
            <div class="col-span-2">
              <span class="text-sm text-gray-600">{{ entry.time_spent }}</span>
            </div>
            <div class="col-span-2">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    class="bg-gray-800 h-1.5 rounded-full transition-all duration-300"
                    :style="{ width: `${entry.progress}%` }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="col-span-2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!worklogs?.length" class="text-center py-12">
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
import { deleteWorklog as deleteWorklogAPI } from "../services/worklogService";

const props = defineProps({
  worklogs: {
    type: Object,
    default: () => ({ data: [], total: 0 }),
  },
});

// Store transformed data
const transformedData = ref([]);

const emit = defineEmits(["refresh"]);

const router = useRouter();
const activeActionMenu = ref(null);
const showDetailModal = ref(false);
const selectedWorklogId = ref(null);
const showDeleteConfirmation = ref(false);
const worklogToDelete = ref(null);
const deleteConfirmMessage = ref("");

// Project mapping - in a real app, this would come from your API or store
const projectMap = {
  1: { name: "Website Redesign", color: "bg-blue-500" },
  2: { name: "Mobile App", color: "bg-green-500" },
  3: { name: "API Integration", color: "bg-purple-500" },
};

// Format minutes to hours and minutes
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Get project name
const getProjectName = (projectId) => {
  return projectMap[projectId]?.name || `Project ${projectId}`;
};

// Get project initials for the avatar
const getProjectInitials = (projectId) => {
  const name = getProjectName(projectId);
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// Transform worklog data
const transformWorklogData = (worklogs) => {
  if (!worklogs) {
    return [];
  }

  // Define standard work day in minutes (8 hours)
  const STANDARD_WORK_DAY = 8 * 60;

  // First, enhance each worklog with additional information
  const enhancedWorklogs = worklogs?.map((worklog) => {
    // Calculate percentage of standard work day
    const percentOfDay = Math.round(
      (worklog?.duration / STANDARD_WORK_DAY) * 100
    );

    console.log(percentOfDay);

    return {
      id: worklog.worklog_id, // Use worklog_id as id for consistency
      worklog_id: worklog.worklog_id,
      user_id: worklog.user_id,
      project_id: worklog.project_id,
      duration: worklog.duration,
      description: worklog.description,
      created_at: worklog.created_at,
      category: worklog.category,

      // Add formatted duration with percentage
      formattedDuration: formatDuration(worklog.duration),
      time_spent: `${percentOfDay}% (${formatDuration(worklog.duration)})`,
      percentOfDay: percentOfDay,

      // Add project information
      project: {
        id: worklog.project_id,
        name: getProjectName(worklog.project_id),
        initials: getProjectInitials(worklog.project_id),
        color: getCategoryColor(worklog.category), // Use category color
      },

      // Add formatted date
      formattedDate: formatDate(worklog.created_at),

      // Add work date (assuming it's the same as created_at for now)
      workDate: new Date(worklog.created_at).toISOString().split("T")[0],
      date: worklog.created_at, // For delete confirmation

      // Add user information (placeholder - would come from user service in real app)
      user: {
        id: worklog.user_id,
        name: `User ${worklog.user_id}`,
        email: `user${worklog.user_id}@example.com`,
      },

      // Use percentage of day as progress
      progress: percentOfDay,
    };
  });

  // Group worklogs by project_id
  const projectGroups = {};

  enhancedWorklogs.forEach((worklog) => {
    const projectId = worklog.project_id;

    if (!projectGroups[projectId]) {
      // Create a new project group
      projectGroups[projectId] = {
        id: `project-${projectId}`, // Unique ID for the group
        project_id: projectId,
        project: {
          id: projectId,
          name: getProjectName(projectId),
          initials: getProjectInitials(projectId),
          color: projectMap[projectId]?.color || "#6B7280",
        },
        // Use the date of the first worklog in this group
        formattedDate: worklog.formattedDate,
        created_at: worklog.created_at,
        date: worklog.created_at,
        // Initialize counters
        duration: 0,
        entries: [],
        overall_progress: 0,
        category: "Multiple Categories", // Default, will be overridden if all entries have same category
      };
    }

    // Add this worklog's duration to the total
    projectGroups[projectId].duration += worklog.duration;

    // Add this worklog as an entry
    projectGroups[projectId].entries.push({
      id: worklog.worklog_id,
      category: worklog.category,
      time_spent: `${worklog?.percentOfDay}% (${formatDuration(
        worklog.duration
      )})`,
      progress: worklog?.percentOfDay,
      description: worklog.description,
    });
  });

  // Convert the groups object to an array and calculate overall progress
  const groupedWorklogs = Object.values(projectGroups).map((group) => {
    // Calculate overall progress as average of all entries
    const totalProgress = group.entries.reduce(
      (sum, entry) => sum + entry.progress,
      0
    );
    group.overall_progress = Math.round(totalProgress / group.entries.length);

    // Calculate percentage of standard work day (8 hours)
    const STANDARD_WORK_DAY = 8 * 60;
    const percentOfDay = Math.round((group.duration / STANDARD_WORK_DAY) * 100);
    group.percentOfDay = percentOfDay;

    // Format the total duration with percentage
    group.formattedDuration = formatDuration(group.duration);

    // If all entries have the same category, use that category
    const categories = new Set(group.entries.map((entry) => entry.category));
    if (categories.size === 1) {
      group.category = group.entries[0].category;
    }

    return group;
  });

  return groupedWorklogs;
};

const getProgressColor = (progress) => {
  if (progress >= 75) return "bg-blue-500";
  if (progress >= 50) return "bg-green-500";
  if (progress >= 25) return "bg-yellow-500";
  return "bg-gray-400";
};

const getCategoryColor = (category) => {
  const colors = {
    Communication: "#3B82F6",
    Coding: "#10B981",
    Testing: "#F59E0B",
    Meeting: "#EF4444",
    Learning: "#8B5CF6",
  };
  return colors[category] || "#6B7280";
};

const toggleActions = (worklogId) => {
  activeActionMenu.value =
    activeActionMenu.value === worklogId ? null : worklogId;
};

const viewWorklog = (worklogId) => {
  selectedWorklogId.value = worklogId;
  showDetailModal.value = true;
  activeActionMenu.value = null;
};

const editWorklog = (worklogId) => {
  router.push(`/worklog/edit/${worklogId}`);
  activeActionMenu.value = null;
};

// const deleteWorklog = (worklogId) => {
//   // For project groups, we need to handle differently
//   if (worklogId.toString().startsWith("project-")) {
//     // This is a project group, extract the project ID
//     const projectId = parseInt(worklogId.replace("project-", ""));

//     // Set the worklog to delete and show confirmation
//     worklogToDelete.value = worklogId;
//     deleteConfirmMessage.value = `Are you sure you want to delete all worklogs for ${getProjectName(
//       projectId
//     )}? This action cannot be undone.`;
//     showDeleteConfirmation.value = true;
//     activeActionMenu.value = null;
//     return;
//   }

//   // For individual worklogs
//   // Find the worklog to delete in the transformed data
//   const transformedWorklogs = transformWorklogData(props.worklogs);
//   let worklogToDeleteInfo = null;

//   // Look through all project groups and their entries
//   for (const projectGroup of transformedWorklogs) {
//     const entry = projectGroup.entries.find((e) => e.id === worklogId);
//     if (entry) {
//       worklogToDeleteInfo = {
//         projectName: projectGroup.project.name,
//         category: entry.category,
//         time: entry.time_spent,
//       };
//       break;
//     }
//   }

//   if (!worklogToDeleteInfo) return;

//   // Set the worklog to delete and show confirmation
//   worklogToDelete.value = worklogId;
//   deleteConfirmMessage.value = `Are you sure you want to delete the ${worklogToDeleteInfo.category} worklog (${worklogToDeleteInfo.time}) for ${worklogToDeleteInfo.projectName}? This action cannot be undone.`;
//   showDeleteConfirmation.value = true;
//   activeActionMenu.value = null;
// };

const confirmDeleteWorklog = async () => {
  if (!worklogToDelete.value) return;

  try {
    // Call the API to delete the worklog
    await deleteWorklogAPI(worklogToDelete.value);

    // Reset state
    worklogToDelete.value = null;

    // Notify parent component to refresh data
    emit("refresh");
  } catch (error) {
    console.error("Failed to delete worklog:", error);
    alert("Failed to delete worklog. Please try again.");
  }
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedWorklogId.value = null;
};

// Close action menu when clicking outside
document.addEventListener("click", (event) => {
  if (!event.target.closest(".relative")) {
    activeActionMenu.value = null;
  }
});

// Watch for changes in the worklogs prop
watch(
  () => props.worklogs,
  (newWorklogs) => {
    // Transform the data when worklogs change
    transformedData.value = transformWorklogData(newWorklogs);
    console.log("Transformed data:", transformedData.value);
  },
  { immediate: true, deep: true }
);
</script>
