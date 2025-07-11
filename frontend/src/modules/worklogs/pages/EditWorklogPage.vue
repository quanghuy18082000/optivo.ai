<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { v4 as uuidv4 } from "uuid";
import { useI18n } from "vue-i18n";
import { useQuery } from "@tanstack/vue-query";
import { useRouter, useRoute } from "vue-router";

import MainLayout from "@/layouts/MainLayout.vue";
import Input from "@/components/ui/Input.vue";
import Select from "@/components/ui/Select.vue";
import Button from "@/components/ui/Button.vue";
import { useWorklog } from "../composables/useWorklog";
import {
  getProjects,
  getWorklogDetailsByDate,
} from "../services/worklogService";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();
const worklogId = route.params.id;
const worklogDate = route.query.date;
const isLoading = ref(true);
const isError = ref(false);
const errorMessage = ref("");
const worklogData = ref(null);
const isBatchMode = ref(!!worklogDate); // If date is provided, we're in batch mode

// Use the worklog composable with fetchWorklogs set to false to prevent unnecessary API calls
const {
  updateBatchWorklogs,
  isUpdating,
  isCreating,
  updateError,
  createError,
} = useWorklog({
  fetchWorklogs: false,
});

// Fetch projects
const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
  queryKey: ["projects"],
  queryFn: getProjects,
});

// Fetch the worklog data to edit (either by ID or by date)
const fetchWorklog = async () => {
  try {
    isLoading.value = true;

    // Fetch the worklog from the API
    try {
      // Fetch worklogs by date
      const response = await getWorklogDetailsByDate(worklogDate);
      worklogData.value = response.data;
    } catch (error) {
      console.error("Failed to fetch worklog:", error);
      isError.value = true;
      errorMessage.value = error.message || "Failed to fetch worklog details";
    }

    // Initialize the form with the fetched data
    initializeForm();
  } catch (error) {
    console.error("Failed to fetch worklog:", error);
    toast.error("Failed to load worklog data. Please try again.");
    router.push("/");
  } finally {
    isLoading.value = false;
  }
};

// All available projects
const allProjectOptions = computed(() => {
  // Make sure project IDs are strings for the select component
  return (
    projectsData.value?.data?.map((p) => ({
      label: p.name,
      value: String(p.id),
    })) || []
  );
});

// Track selected projects for dropdown filtering
const selectedProjects = ref(new Map());

// Update the selected projects map when a project is selected
const updateSelectedProjects = () => {
  // Clear the current map
  selectedProjects.value.clear();

  // Rebuild the map with current selections
  if (worklogGroups.value && worklogGroups.value.length > 0) {
    worklogGroups.value.forEach((group, index) => {
      if (group.value.projectId) {
        selectedProjects.value.set(group.value.projectId, index);
      }
    });
  }
};

// Function to get available project options for a specific group
const getAvailableProjectOptions = (currentGroupIndex) => {
  // If there are no worklog groups yet, return all projects
  if (!worklogGroups.value || worklogGroups.value.length === 0) {
    return allProjectOptions.value;
  }

  // Filter out already selected projects
  const result = allProjectOptions.value.map((option) => {
    // Check if this project is selected in any group other than the current one
    const selectedInGroupIndex = selectedProjects.value.get(option.value);
    const isDisabled =
      selectedInGroupIndex !== undefined &&
      selectedInGroupIndex !== currentGroupIndex;

    return {
      ...option,
      disabled: isDisabled,
      // Keep the original label - the Select component will handle showing the disabled state
      label: option.label,
    };
  });

  return result;
};

// Yup Schemas for validation
const workEntrySchema = yup
  .object({
    id: yup.string().required(), // ID can be a string or number
    description: yup.string().required(t("common.required")),
    hours: yup
      .number()
      .typeError(t("common.required"))
      .min(0, "Hours cannot be negative")
      .max(23, "Max 23 hours")
      .required(t("common.required")),
    minutes: yup
      .number()
      .typeError(t("common.required"))
      .min(0, "Minutes cannot be negative")
      .max(59, "Max 59 minutes")
      .required(t("common.required")),
  })
  .test("total-time", "Total time must be greater than 0", function (value) {
    return value.hours * 60 + value.minutes > 0;
  });

const worklogGroupSchema = yup.object({
  id: yup.string().required(), // Group ID can be a string or number
  projectId: yup.string().required("Project selection is required"),
  workEntries: yup
    .array()
    .of(workEntrySchema)
    .min(1, "At least one work entry is required for each project"),
});

const formSchema = toTypedSchema(
  yup.object({
    worklogGroups: yup
      .array()
      .of(worklogGroupSchema)
      .min(1, "At least one worklog group is required"),
  })
);

// VeeValidate form setup
const { handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    worklogGroups: [
      {
        id: "new_group",
        projectId: null,
        workEntries: [
          {
            id: "0", // Use "0" for new entries
            description: "",
            hours: 0,
            minutes: 0,
          },
        ],
      },
    ],
  },
  validateOnMount: false,
  validateOnBlur: false,
  validateOnChange: false,
  validateOnInput: false,
});

const { fields: worklogGroups, push, remove } = useFieldArray("worklogGroups");

// Initialize form with worklog data
const initializeForm = () => {
  if (!worklogData.value) return;

  let formData = { worklogGroups: [] };

  if (isBatchMode.value) {
    // Handle batch mode data format (multiple projects with multiple entries)
    // Expected format: [{ project_id, worklog: [{ desc, duration: { hours, minutes } }] }]
    const batchData = Array.isArray(worklogData.value) ? worklogData.value : [];

    formData.worklogGroups = batchData.map((projectGroup) => {
      return {
        id: String(projectGroup.project_id), // Use project_id as the group ID
        projectId: String(projectGroup.project_id), // Ensure it's a string for the select component
        workEntries: projectGroup.worklog.map((entry) => {
          return {
            id: String(entry.id || 0), // Keep the original ID if it exists
            description: entry.desc || "",
            hours: entry.duration?.hours || 0,
            minutes: entry.duration?.minutes || 0,
          };
        }),
      };
    });

    // If no data was returned, initialize with an empty group
    if (formData.worklogGroups.length === 0) {
      formData.worklogGroups.push({
        id: "new_group", // Temporary ID for new group
        projectId: null,
        workEntries: [{ id: "0", description: "", hours: 0, minutes: 0 }], // Use "0" for new entries
      });
    }
  } else {
    // Handle single worklog data format
    formData = {
      worklogGroups: [
        {
          id: String(worklogData.value.project_id || ""),
          projectId: String(worklogData.value.project_id || ""),
          workEntries: [
            {
              id: String(worklogData.value.id || "0"), // Keep the original ID
              description: worklogData.value.description || "",
              hours: worklogData.value.hours || 0,
              minutes: worklogData.value.minutes || 0,
            },
          ],
        },
      ],
    };
  }

  // Set the form values
  setValues(formData);

  // Update the selected projects map
  updateSelectedProjects();
};

// Functions to manage form structure
const addWorklogGroup = () => {
  // Check if there are any available projects left to select
  const currentGroupCount = worklogGroups.value.length;
  const availableProjects = getAvailableProjectOptions(currentGroupCount);
  const hasAvailableProjects = availableProjects.some((p) => !p.disabled);

  if (!hasAvailableProjects) {
    toast.warning(
      "All projects have already been selected. You cannot add more project groups."
    );
    return;
  }

  push({
    id: "new_group_" + Date.now(), // Use timestamp for new groups
    projectId: null,
    workEntries: [{ id: "0", description: "", hours: 0, minutes: 0 }], // Use "0" for new entries
  });
};

const addWorkEntry = (groupIndex) => {
  worklogGroups.value[groupIndex].value.workEntries.push({
    id: "0", // Use "0" for new entries
    description: "",
    hours: 0,
    minutes: 0,
  });
};

const removeWorklogGroup = (index) => {
  remove(index);
  // Update the selected projects map after removing a group
  updateSelectedProjects();
};

const removeWorkEntry = (groupIndex, entryIndex) => {
  worklogGroups.value[groupIndex].value.workEntries.splice(entryIndex, 1);
};

// Track if form has been submitted (for showing validation errors)
const hasAttemptedSubmit = ref(false);

// Form submission handler
const onSubmit = handleSubmit(async (values) => {
  // Set submission attempt flag to true to show validation errors if any
  hasAttemptedSubmit.value = true;

  try {
    // Handle batch mode submission
    // Transform the form data to match the API format
    const batchData = values.worklogGroups.map((group) => {
      return {
        project_id: Number(group.projectId),
        worklog: group.workEntries.map((entry) => {
          // Include the ID if it's not "0" (not a new entry)
          const worklogEntry = {
            desc: entry.description,
            duration: {
              hours: entry.hours,
              minutes: entry.minutes,
            },
          };

          // Only include ID if it's not a new entry (id !== "0")
          if (entry.id !== "0") {
            worklogEntry.id = Number(entry.id);
          }

          return worklogEntry;
        }),
      };
    });

    // Submit the batch data using PUT update
    await updateBatchWorklogs(batchData, worklogDate);

    // Show success toast
    toast.success("Worklogs updated successfully");
    router.push("/"); // Redirect to dashboard
  } catch (err) {
    console.error("Failed to update worklog:", err);

    // Show error toast
    toast.error(err.message || "Failed to update worklog");

    // Error message is handled by useWorklog composable's error ref
  }
});

const isFormLoading = computed(
  () =>
    isLoading.value ||
    isUpdating.value ||
    isCreating.value ||
    isLoadingProjects.value
);

// Watch for changes in worklog groups to update available project options
watch(
  worklogGroups,
  () => {
    updateSelectedProjects();
  },
  { deep: true, immediate: true }
);

// Fetch worklog data on component mount
onMounted(() => {
  fetchWorklog();
  // Initialize the selected projects map
  updateSelectedProjects();
});
</script>

<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ isBatchMode ? "Edit Daily Work Logs" : "Edit Work Log" }}
        </h1>
        <span class="text-sm text-gray-500">
          {{
            isBatchMode
              ? `Update your work records for ${new Date(
                  worklogDate
                ).toLocaleDateString()}`
              : "Update your work record"
          }}
        </span>
      </div>
    </template>

    <div
      v-if="isLoading"
      class="p-6 bg-white rounded-lg shadow-md w-full mx-auto"
    >
      <div class="flex justify-center items-center h-40">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        ></div>
      </div>
    </div>

    <div
      v-else-if="isError"
      class="p-6 bg-white rounded-lg shadow-md w-full mx-auto"
    >
      <div class="flex flex-col items-center justify-center h-40">
        <div class="text-red-500 text-xl mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Error loading worklog
        </div>
        <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
        <Button @click="router.push('/')" variant="secondary">
          Return to Dashboard
        </Button>
      </div>
    </div>

    <div v-else class="p-6 bg-white rounded-lg shadow-md w-full mx-auto">
      <form @submit.prevent="onSubmit" class="space-y-8">
        <!-- Form Header -->
        <div class="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
          <div class="col-span-3">Project</div>
          <div class="col-span-5">Description</div>
          <div class="col-span-1">Hours</div>
          <div class="col-span-1">Minutes</div>
          <div class="col-span-1"></div>
          <div class="col-span-1"></div>
        </div>

        <!-- Worklog Groups -->
        <div
          v-for="(group, groupIndex) in worklogGroups"
          :key="group.value.id"
          class="space-y-4 border-b pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0"
        >
          <!-- Work Entries with Project Selection -->
          <div
            v-for="(entry, entryIndex) in group.value.workEntries"
            :key="entry.id"
            class="grid grid-cols-12 gap-4 items-start"
          >
            <!-- Project Selection (only show for first entry in group) -->
            <div class="col-span-3">
              <Select
                v-if="entryIndex === 0"
                v-model="group.value.projectId"
                :options="getAvailableProjectOptions(groupIndex)"
                placeholder="Select project"
                :disabled="isFormLoading"
                :error="
                  hasAttemptedSubmit &&
                  !!errors[`worklogGroups[${groupIndex}].projectId`]
                "
                :error-message="
                  hasAttemptedSubmit
                    ? errors[`worklogGroups[${groupIndex}].projectId`]
                    : ''
                "
                class="w-full"
                @change="updateSelectedProjects"
              />
            </div>

            <!-- Description -->
            <div class="col-span-5">
              <Input
                v-model="entry.description"
                placeholder="Work description"
                :disabled="isFormLoading"
                :error="
                  hasAttemptedSubmit &&
                  !!errors[
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].description`
                  ]
                "
                :error-message="
                  hasAttemptedSubmit
                    ? errors[
                        `worklogGroups[${groupIndex}].workEntries[${entryIndex}].description`
                      ]
                    : ''
                "
                class="w-full"
              />
            </div>

            <!-- Hours -->
            <div class="col-span-1">
              <Input
                v-model.number="entry.hours"
                type="number"
                placeholder="00"
                :min="0"
                :max="23"
                :disabled="isFormLoading"
                :error="
                  hasAttemptedSubmit &&
                  !!errors[
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`
                  ]
                "
                :error-message="
                  hasAttemptedSubmit
                    ? errors[
                        `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`
                      ]
                    : ''
                "
                class="w-full"
              />
            </div>

            <!-- Minutes -->
            <div class="col-span-1">
              <Input
                v-model.number="entry.minutes"
                type="number"
                placeholder="00"
                :min="0"
                :max="59"
                :disabled="isFormLoading"
                :error="
                  hasAttemptedSubmit &&
                  !!errors[
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].minutes`
                  ]
                "
                :error-message="
                  hasAttemptedSubmit
                    ? errors[
                        `worklogGroups[${groupIndex}].workEntries[${entryIndex}].minutes`
                      ]
                    : ''
                "
                class="w-full"
              />
            </div>

            <!-- Action Buttons -->
            <div class="col-span-1 flex justify-start gap-2">
              <!-- Remove Entry Button -->
              <Button
                v-if="group.value.workEntries.length > 1"
                type="button"
                variant="danger"
                size="small"
                class="!bg-transparent !text-red-500 hover:!bg-red-50"
                @click="removeWorkEntry(groupIndex, entryIndex)"
                :disabled="isFormLoading"
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
              </Button>
            </div>
            <div class="col-span-1 flex justify-end gap-2">
              <!-- Remove Group Button (only show for first entry in group) -->
              <Button
                v-if="entryIndex === 0 && worklogGroups.length > 1"
                type="button"
                variant="danger"
                size="small"
                class="!bg-transparent !text-red-500 hover:!bg-red-50"
                @click="removeWorklogGroup(groupIndex)"
                :disabled="isFormLoading"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 7l16 0" />
                  <path d="M10 11l0 6" />
                  <path d="M14 11l0 6" />
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                </svg>
              </Button>
            </div>
          </div>

          <!-- Add new work description for same project -->
          <div class="grid grid-cols-12 gap-4 mt-2">
            <div class="col-span-12">
              <button
                type="button"
                @click="addWorkEntry(groupIndex)"
                class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors ml-3"
                :disabled="isFormLoading"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add a new work description for the same project
              </button>
            </div>
          </div>
        </div>

        <!-- Add a new line (for a new project) -->
        <div class="flex justify-start mt-4">
          <button
            type="button"
            @click="addWorklogGroup"
            class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors px-4 py-2 border border-blue-600 rounded-md"
            :disabled="isFormLoading"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add a new project
          </button>
        </div>

        <!-- Error message -->
        <div
          v-if="updateError || createError"
          class="text-center text-red-500 text-sm mt-3"
        >
          {{
            t("common.error", { msg: (updateError || createError)?.message })
          }}
        </div>
        <div
          v-if="hasAttemptedSubmit && Object.keys(errors).length > 0"
          class="text-center text-red-500 text-sm mt-3"
        >
          Please correct the errors in the form.
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            @click="router.push('/')"
            :disabled="isFormLoading"
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" :loading="isFormLoading">
            {{ isBatchMode ? "Update Worklogs" : "Update Worklog" }}
          </Button>
        </div>
      </form>
    </div>
  </MainLayout>
</template>
