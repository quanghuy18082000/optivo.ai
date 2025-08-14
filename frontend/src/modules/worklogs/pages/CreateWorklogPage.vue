<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { v4 as uuidv4 } from "uuid";
import { useI18n } from "vue-i18n";
import { useQuery } from "@tanstack/vue-query";
import { useRouter } from "vue-router";
import {
  useLoadingIntegration,
  LOADING_KEYS,
} from "@/composables/useLoadingIntegration.js";

import MainLayout from "@/layouts/MainLayout.vue";
import Input from "@/components/ui/Input.vue";
import Select from "@/components/ui/Select.vue";
import Button from "@/components/ui/Button.vue";
import DatePicker from "@/components/ui/DatePicker.vue";
import HoursMinutesInput from "@/components/ui/HoursMinutesInput.vue";
import { useWorklog } from "../composables/useWorklog";
import { getProjects } from "../services/worklogService";
import { useToast } from "@/composables/useToast";
import { usePageInitLoading } from "@/composables/usePageLoading";

const router = useRouter();
const route = useRouter().currentRoute.value;
const { t } = useI18n();
const toast = useToast();

// Page loading management
const { stopLoading } = usePageInitLoading("create-worklog");

// Get date from query parameter or use current date
const selectedDate = ref(
  route.query.date || new Date().toISOString().split("T")[0]
);

// Update URL when date changes
const updateDateInURL = (date) => {
  router.replace({
    query: {
      ...route.query,
      date,
    },
  });
};

// Use the worklog composable with fetchWorklogs set to false to prevent unnecessary API calls
const { createNewWorklog, createBatchWorklogs, isCreating, createError } =
  useWorklog({
    fetchWorklogs: false,
  });

// Fetch projects only
const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
  queryKey: ["projects"],
  queryFn: getProjects,
});

// Integrate projects loading with global loading screen
useLoadingIntegration(LOADING_KEYS.PROJECTS, isLoadingProjects);

// All available projects
const allProjectOptions = computed(() => {
  return (
    projectsData.value?.data?.map((p) => ({
      label: p.name,
      value: String(p.id), // Ensure it's a string for consistent comparison
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
const workEntrySchema = yup.object({
  id: yup.string().required(),
  description: yup.string().required("Description is required"),
  hours: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      // Convert empty string to null
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return null;
      }
      return value;
    })
    .min(0, "Cannot be negative")
    .max(23, "Max 23 hours"),
  minutes: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      // Convert empty string to null
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return null;
      }
      return value;
    })
    .min(0, "Cannot be negative")
    .max(59, "Max 59 minutes"),
  can_edited: yup.boolean().optional(),
  can_deleted: yup.boolean().optional(),
});

const worklogGroupSchema = yup.object({
  id: yup.string().required(),
  projectId: yup.string().required("Project selection is required"),
  workEntries: yup
    .array()
    .of(workEntrySchema)
    .min(1, "At least one work entry is required for each project"),
});

const formSchema = toTypedSchema(
  yup
    .object({
      worklogGroups: yup
        .array()
        .of(worklogGroupSchema)
        .min(1, "At least one worklog group is required"),
    })
    .test("total-time-validation", "Time validation", function (value) {
      const { worklogGroups } = value;
      const errors = [];

      for (
        let groupIndex = 0;
        groupIndex < worklogGroups.length;
        groupIndex++
      ) {
        const group = worklogGroups[groupIndex];

        for (
          let entryIndex = 0;
          entryIndex < group.workEntries.length;
          entryIndex++
        ) {
          const entry = group.workEntries[entryIndex];
          const { hours, minutes } = entry;

          // Convert null/undefined to 0 for calculation
          const hoursValue = hours === null || hours === undefined ? 0 : hours;
          const minutesValue =
            minutes === null || minutes === undefined ? 0 : minutes;

          if (hoursValue === 0 && minutesValue === 0) {
            errors.push({
              path: `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`,
              message: "Enter time worked",
            });
          }
        }
      }

      // Create multiple errors using Yup's ValidationError
      if (errors.length > 0) {
        const validationError = new yup.ValidationError(
          "Multiple time validation errors",
          value,
          "worklogGroups"
        );

        // Add inner errors for each field
        validationError.inner = errors.map(
          (error) => new yup.ValidationError(error.message, value, error.path)
        );

        throw validationError;
      }

      return true;
    })
);

// VeeValidate form setup with validation mode set to submit
const { handleSubmit, errors, resetForm, validate } = useForm({
  validationSchema: formSchema,
  initialValues: {
    worklogGroups: [
      {
        id: uuidv4(),
        projectId: null,
        workEntries: [
          {
            id: uuidv4(),
            description: "",
            hours: null,
            minutes: null,
          },
        ],
      },
    ],
  },
  validateOnMount: false, // Don't validate on component mount
  validateOnBlur: false, // Don't validate on blur initially
  validateOnChange: false, // Don't validate on change initially
  validateOnInput: false, // Don't validate on every keystroke
});

const { fields: worklogGroups, push, remove } = useFieldArray("worklogGroups");

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
    id: uuidv4(),
    projectId: null,
    workEntries: [
      { id: uuidv4(), description: "", hours: null, minutes: null },
    ],
  });

  // Update the selected projects map after adding a new group
  updateSelectedProjects();
};

const addWorkEntry = (groupIndex) => {
  worklogGroups.value[groupIndex].value.workEntries.push({
    id: uuidv4(),
    description: "",
    hours: null,
    minutes: null,
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

// Track which fields have been touched by user
const touchedFields = ref(new Set());

// Function to mark field as touched and enable validation
const markFieldTouched = (fieldPath) => {
  touchedFields.value.add(fieldPath);
};

// Function to check if field should show error
const shouldShowError = (fieldPath) => {
  return hasAttemptedSubmit.value || touchedFields.value.has(fieldPath);
};

const isFormLoading = ref(false);

// Form submission handler
const onSubmit = handleSubmit(async (values) => {
  isFormLoading.value = true; // Set loading state to true
  // Set submission attempt flag to true to show validation errors if any
  hasAttemptedSubmit.value = true;

  const worklogsToCreate = values.worklogGroups.flatMap((group) =>
    group.workEntries?.map((entry) => ({
      project_id: Number(group.projectId), // Convert to number for API
      description: entry.description,
      hours: entry.hours,
      minutes: entry.minutes,
      // Remove date from individual entries as it will be passed separately
    }))
  );

  try {
    // Use the batch API endpoint if there are multiple entries
    await createBatchWorklogs(worklogsToCreate, selectedDate.value);

    toast.success("Worklog created successfully");

    resetForm(); // Clear the form
    hasAttemptedSubmit.value = false; // Reset submission attempt flag
    router.push("/"); // Redirect to dashboard
  } catch (err) {
    // Show error toast
    toast.error(err.message || "Failed to create worklog");

    // Error message is handled by useWorklog composable's error ref
  } finally {
    isFormLoading.value = false; // Reset loading state
  }
});

// Watch for date changes and update URL
watch(selectedDate, (newDate) => {
  if (newDate) {
    updateDateInURL(newDate);
  }
});

// Watch for changes in worklog groups to update available project options
watch(
  worklogGroups,
  () => {
    updateSelectedProjects();
  },
  { deep: true, immediate: true }
);

// Initialize the selected projects map when component is mounted
onMounted(() => {
  updateSelectedProjects();
  stopLoading();
});
</script>

<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Log Work</h1>
        <span class="text-sm text-gray-500">
          Record activities for
          {{ new Date(selectedDate).toLocaleDateString() }}
        </span>
      </div>
    </template>

    <div class="p-6 bg-white rounded-lg shadow-md w-full mx-auto">
      <form @submit.prevent="onSubmit" class="space-y-8">
        <!-- Date Selection -->
        <div class="mb-6">
          <label
            for="worklog-date"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Worklog Date
          </label>
          <DatePicker
            id="worklog-date"
            v-model="selectedDate"
            class="w-full sm:w-64"
            :disabled="isFormLoading"
            @update:modelValue="updateDateInURL"
          />
        </div>

        <!-- Form Header -->
        <div class="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
          <div class="col-span-3">Project</div>
          <div class="col-span-5">Description</div>
          <div class="col-span-2">Time</div>
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
                searchable
                search-placeholder="Search projects..."
                :disabled="isFormLoading"
                :error="
                  shouldShowError(`worklogGroups[${groupIndex}].projectId`) &&
                  !!errors[`worklogGroups[${groupIndex}].projectId`]
                "
                :error-message="
                  shouldShowError(`worklogGroups[${groupIndex}].projectId`)
                    ? errors[`worklogGroups[${groupIndex}].projectId`] || ''
                    : ''
                "
                class="w-full"
                @change="updateSelectedProjects"
                @blur="
                  markFieldTouched(`worklogGroups[${groupIndex}].projectId`)
                "
              />
            </div>

            <!-- Description -->
            <div class="col-span-5">
              <Input
                v-model="entry.description"
                placeholder="Work description"
                :disabled="isFormLoading"
                :error="
                  shouldShowError(
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].description`
                  ) &&
                  !!errors[
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].description`
                  ]
                "
                :error-message="
                  shouldShowError(
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].description`
                  )
                    ? errors[
                        `worklogGroups[${groupIndex}].workEntries[${entryIndex}].description`
                      ] || ''
                    : ''
                "
                class="w-full"
                @blur="
                  markFieldTouched(
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].description`
                  )
                "
              />
            </div>

            <!-- Time Input (Hours & Minutes) -->
            <div class="col-span-2">
              <HoursMinutesInput
                v-model:hours="entry.hours"
                v-model:minutes="entry.minutes"
                :disabled="isFormLoading"
                :error="
                  shouldShowError(
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`
                  ) &&
                  !!errors[
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`
                  ]
                "
                :error-message="
                  shouldShowError(
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`
                  )
                    ? errors[
                        `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`
                      ] || ''
                    : ''
                "
                :hours-error="
                  shouldShowError(
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`
                  ) &&
                  !!errors[
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`
                  ]
                "
                :hours-error-message="
                  shouldShowError(
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`
                  )
                    ? errors[
                        `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`
                      ] || ''
                    : ''
                "
                :minutes-error="
                  shouldShowError(
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].minutes`
                  ) &&
                  !!errors[
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].minutes`
                  ]
                "
                :minutes-error-message="
                  shouldShowError(
                    `worklogGroups[${groupIndex}].workEntries[${entryIndex}].minutes`
                  )
                    ? errors[
                        `worklogGroups[${groupIndex}].workEntries[${entryIndex}].minutes`
                      ] || ''
                    : ''
                "
                @blur="
                  (field) => {
                    if (field === 'hours') {
                      markFieldTouched(
                        `worklogGroups[${groupIndex}].workEntries[${entryIndex}].hours`
                      );
                    } else if (field === 'minutes') {
                      markFieldTouched(
                        `worklogGroups[${groupIndex}].workEntries[${entryIndex}].minutes`
                      );
                    }
                  }
                "
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
            <div class="col-span-10 text-right">
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
            Add a new work
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            :disabled="isFormLoading"
            @click="router.push('/')"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            :loading="isFormLoading"
            class="bg-blue-600 hover:bg-blue-700"
            @click="hasAttemptedSubmit = true"
          >
            Save Worklog
          </Button>
        </div>
      </form>
    </div>
  </MainLayout>
</template>
