<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
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
              <button
                @click.stop="toggleActions(project.id)"
                class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                  />
                </svg>
              </button>
              <div
                v-if="activeActionMenu === project.id"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              >
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Delete
                </button>
              </div>
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
              <div class="flex justify-end">
                <button
                  @click.stop="toggleActions(member.id)"
                  class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                    />
                  </svg>
                </button>
                <div
                  v-if="activeActionMenu === member.id"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                >
                  <button
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Edit Member
                  </button>
                  <button
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Remove Member
                  </button>
                </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import WorkloadGraph from "./WorkloadGraph.vue";

defineProps({
  projects: {
    type: Array,
    default: () => [],
  },
});

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

const expandedProjects = ref({});
const activeActionMenu = ref(null);

const toggleProject = (projectId) => {
  expandedProjects.value[projectId] = !expandedProjects.value[projectId];
};

const toggleActions = (id) => {
  activeActionMenu.value = activeActionMenu.value === id ? null : id;
};

// Close action menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest(".relative")) {
    activeActionMenu.value = null;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
