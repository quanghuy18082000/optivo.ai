<template>
  <div class="bg-white rounded-lg shadow overflow-hidden relative">
    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center"
    >
      <div class="flex items-center gap-3">
        <svg
          class="animate-spin h-6 w-6 text-blue-600"
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
        <span class="text-gray-600">Refreshing projects...</span>
      </div>
    </div>

    <!-- Table Header -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div
        class="flex items-center gap-4 mb-4 text-sm font-medium text-gray-700"
      >
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-blue-600"></span>
          <span>Quotation</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-green-600"></span>
          <span>Plan</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-red-600"></span>
          <span>Actual</span>
        </div>
      </div>
      <div
        class="grid grid-cols-[1fr_1fr_1fr_4fr_0.5fr] gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider"
      >
        <div>Project name</div>
        <div>Member</div>
        <div>Position</div>
        <div class="text-center">Workload</div>
        <div>Actions</div>
      </div>
    </div>

    <!-- Table Body -->
    <div class="divide-y divide-gray-200">
      <div v-for="project in projects" :key="project.id">
        <!-- Project Row -->
        <div
          class="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="toggleProject(project.id)"
        >
          <div
            class="grid grid-cols-[1fr_1fr_1fr_4fr_0.5fr] gap-4 items-center"
          >
            <div class="flex items-center gap-2">
              <button class="p-1 text-gray-400 hover:text-gray-600">
                <svg
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-90': expandedProjects[project.id] }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <span class="text-sm font-medium text-gray-900">{{
                project.name
              }}</span>
            </div>
            <div></div>
            <div></div>
            <div></div>
            <div class="flex justify-end">
              <PopupMenu
                v-model="projectMenus[project.id]"
                placement="bottom-end"
                :offset="8"
                width="48"
                min-width="12rem"
              >
                <template #trigger>
                  <button
                    @click.stop="toggleProjectMenu(project.id)"
                    class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                      />
                    </svg>
                  </button>
                </template>

                <PopupMenuItem>Project Actions</PopupMenuItem>
                <PopupMenuItem @click="editProject(project)">
                  <template #icon>
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
                  </template>
                  Edit Project
                </PopupMenuItem>
                <PopupMenuItem
                  variant="danger"
                  @click="confirmDeleteProject(project)"
                >
                  <template #icon>
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </template>
                  Delete
                </PopupMenuItem>
              </PopupMenu>
            </div>
          </div>
        </div>

        <!-- Member Rows (Expanded) -->
        <div v-if="expandedProjects[project.id]" class="bg-gray-50">
          <div
            v-for="member in project.members"
            :key="member.id"
            class="px-6 py-4 border-t border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div
              class="grid grid-cols-[1fr_1fr_1fr_4fr_0.5fr] gap-4 items-center"
            >
              <div></div>
              <div>
                <span class="text-sm font-medium text-gray-900">{{
                  member.name
                }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-600">{{ member.position }}</span>
              </div>
              <div class="relative overflow-hidden">
                <WorkloadGraph :workload="member.workload" />
              </div>
              <div class="flex justify-end gap-2">
                <!-- View Worklog Button -->
                <button
                  @click.stop="viewMemberWorklog(member, project)"
                  class="p-2 text-blue-500 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
                  title="View Worklog"
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

                <!-- Actions Menu -->
                <PopupMenu
                  v-model="memberMenus[member.id]"
                  placement="bottom-end"
                  :offset="8"
                  width="48"
                  min-width="12rem"
                >
                  <template #trigger>
                    <button
                      @click.stop="toggleMemberMenu(member.id)"
                      class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <svg
                        class="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                        />
                      </svg>
                    </button>
                  </template>

                  <PopupMenuItem @click="viewMemberWorklog(member, project)">
                    <template #icon>
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
                    </template>
                    View Worklog
                  </PopupMenuItem>
                  <PopupMenuItem>Edit Member</PopupMenuItem>
                  <PopupMenuItem>Remove Member</PopupMenuItem>
                </PopupMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!projects.length" class="text-center py-12">
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
      <h3 class="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
      <p class="mt-1 text-sm text-gray-500">
        Get started by adding your first project.
      </p>
    </div>

    <!-- Member Worklog Modal -->
    <MemberWorklogModal
      :is-open="showMemberWorklogModal"
      :member-id="selectedMember?.id"
      :member-name="selectedMember?.name"
      :project-id="selectedProject?.id"
      :project-name="selectedProject?.name"
      @close="closeMemberWorklogModal"
    />

    <!-- Delete Project Confirmation Dialog -->
    <ConfirmDialog
      :is-open="showDeleteConfirm"
      title="Delete Project"
      :message="
        projectToDelete
          ? `Are you sure you want to delete '${projectToDelete.name}'? This action cannot be undone.`
          : ''
      "
      confirm-text="Delete"
      cancel-text="Cancel"
      :is-loading="isDeleting"
      @confirm="handleDeleteProject"
      @cancel="cancelDeleteProject"
    >
      <div
        v-if="deleteError"
        class="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded"
      >
        {{ deleteError }}
      </div>
    </ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import WorkloadGraph from "./WorkloadGraph.vue";
import MemberWorklogModal from "./MemberWorklogModal.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import PopupMenu from "@/components/ui/PopupMenu.vue";
import PopupMenuItem from "@/components/ui/PopupMenuItem.vue";
import { useProjects } from "../composables/useProjects";
import { useRouter } from "vue-router";

const props = defineProps({
  projects: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["project-deleted", "refresh-projects"]);

const router = useRouter();

const months = [
  "Jan/25",
  "Feb/25",
  "Mar/25",
  "Apr/25",
  "May/25",
  "Jun/25",
  "Jul/25",
  "Aug/25",
  "Sep/25",
  "Oct/25",
  "Nov/25",
  "Dec/25",
];

// Get the removeProject function and refetch from the useProjects composable
const { removeProject, isDeleting, refetch, isLoading } = useProjects();

const expandedProjects = ref({});
const activeActionMenu = ref(null); // Keep this for backward compatibility during transition
const showMemberWorklogModal = ref(false);
const selectedMember = ref(null);
const selectedProject = ref(null);

// Popup menus state
const projectMenus = ref({});
const memberMenus = ref({});

// Delete project state
const showDeleteConfirm = ref(false);
const projectToDelete = ref(null);
const deleteError = ref(null);

const toggleProject = (projectId) => {
  expandedProjects.value[projectId] = !expandedProjects.value[projectId];
};

const toggleProjectMenu = (projectId) => {
  // Create the property if it doesn't exist
  if (projectMenus.value[projectId] === undefined) {
    projectMenus.value[projectId] = false;
  }

  // Toggle the menu
  projectMenus.value[projectId] = !projectMenus.value[projectId];

  // Close all other menus
  Object.keys(projectMenus.value).forEach((id) => {
    if (id !== projectId.toString() && projectMenus.value[id]) {
      projectMenus.value[id] = false;
    }
  });

  // Close all member menus
  Object.keys(memberMenus.value).forEach((id) => {
    if (memberMenus.value[id]) {
      memberMenus.value[id] = false;
    }
  });
};

const toggleMemberMenu = (memberId) => {
  // Create the property if it doesn't exist
  if (memberMenus.value[memberId] === undefined) {
    memberMenus.value[memberId] = false;
  }

  // Toggle the menu
  memberMenus.value[memberId] = !memberMenus.value[memberId];

  // Close all other menus
  Object.keys(memberMenus.value).forEach((id) => {
    if (id !== memberId.toString() && memberMenus.value[id]) {
      memberMenus.value[id] = false;
    }
  });

  // Close all project menus
  Object.keys(projectMenus.value).forEach((id) => {
    if (projectMenus.value[id]) {
      projectMenus.value[id] = false;
    }
  });
};

const viewMemberWorklog = (member, project) => {
  selectedMember.value = member;
  selectedProject.value = project;
  showMemberWorklogModal.value = true;

  // Close all menus
  Object.keys(memberMenus.value).forEach((id) => {
    memberMenus.value[id] = false;
  });
  Object.keys(projectMenus.value).forEach((id) => {
    projectMenus.value[id] = false;
  });
};

const closeMemberWorklogModal = () => {
  showMemberWorklogModal.value = false;
  selectedMember.value = null;
  selectedProject.value = null;
};

const editProject = (project) => {
  // Close all menus
  Object.keys(memberMenus.value).forEach((id) => {
    memberMenus.value[id] = false;
  });
  Object.keys(projectMenus.value).forEach((id) => {
    projectMenus.value[id] = false;
  });

  // Navigate to edit page
  router.push(`/projects/edit/${project.id}`);
};

// Delete project methods
const confirmDeleteProject = (project) => {
  projectToDelete.value = project;
  showDeleteConfirm.value = true;

  // Close all menus
  Object.keys(memberMenus.value).forEach((id) => {
    memberMenus.value[id] = false;
  });
  Object.keys(projectMenus.value).forEach((id) => {
    projectMenus.value[id] = false;
  });
};

const cancelDeleteProject = () => {
  showDeleteConfirm.value = false;
  projectToDelete.value = null;
  deleteError.value = null;
};

const handleDeleteProject = async () => {
  if (!projectToDelete.value) return;

  try {
    deleteError.value = null;
    const deletedProject = { ...projectToDelete.value };

    // Call the API to delete the project
    await removeProject(deletedProject.id);

    // Close the dialog and clear the selected project
    showDeleteConfirm.value = false;
    projectToDelete.value = null;

    // Explicitly refresh the project list
    await refetch();

    // Emit events to notify parent components
    emit("project-deleted", deletedProject);
    emit("refresh-projects");
  } catch (error) {
    deleteError.value = error.message || "Failed to delete project";
  }
};

// We don't need a click outside handler anymore as the PopupMenu component handles this
// But we'll keep it for backward compatibility during transition
const handleClickOutside = (event) => {
  // This is now handled by the PopupMenu component
};

// We don't need event listeners anymore as the PopupMenu component handles this
// But we'll keep empty lifecycle hooks for backward compatibility during transition
onMounted(() => {
  // This is now handled by the PopupMenu component
});

onBeforeUnmount(() => {
  // This is now handled by the PopupMenu component
});
</script>
