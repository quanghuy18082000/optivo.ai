<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { useI18n } from "vue-i18n";
import { useQuery } from "@tanstack/vue-query";
import { useRouter, useRoute } from "vue-router";
import {
  useLoadingIntegration,
  LOADING_KEYS,
} from "@/composables/useLoadingIntegration.js";

import MainLayout from "@/layouts/MainLayout.vue";
import Input from "@/components/ui/Input.vue";
import Select from "@/components/ui/Select.vue";
import Button from "@/components/ui/Button.vue";
import HoursMinutesInput from "@/components/ui/HoursMinutesInput.vue";
import { useWorklog } from "../composables/useWorklog";
import {
  getProjects,
  getWorklogDetailsByDate,
} from "../services/worklogService";
import { useToast } from "@/composables/useToast";
import { usePageInitLoading } from "@/composables/usePageLoading";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();

// Page loading management
const { stopLoading } = usePageInitLoading("edit-worklog");

const worklogId = route.params.id;
const worklogDate = route.query.date;
const isLoading = ref(true);
const isError = ref(false);
const errorMessage = ref("");
const worklogData = ref(null);
const originalFormData = ref(null); // Store original data for comparison
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

// Integrate projects loading with global loading screen
useLoadingIntegration(LOADING_KEYS.PROJECTS, isLoadingProjects);

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
    stopLoading();
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
      worklogGroups: yup.array().of(worklogGroupSchema).min(1),
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
            can_edited: true,
            can_deleted: true,
          },
        ],
      },
    ],
  },
  validateOnMount: false,
  validateOnBlur: false, // Don't validate on blur initially
  validateOnChange: false, // Don't validate on change initially
  validateOnInput: false, // Don't validate on every keystroke
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
            can_edited: entry.can_edited || false,
            can_deleted: entry.can_deleted || false,
          };
        }),
      };
    });

    // If no data was returned, initialize with an empty group
    if (formData.worklogGroups.length === 0) {
      formData.worklogGroups.push({
        id: "new_group", // Temporary ID for new group
        projectId: null,
        workEntries: [
          {
            id: "0",
            description: "",
            hours: 0,
            minutes: 0,
            can_edited: true, // New entries can always be edited
            can_deleted: true, // New entries can always be deleted
          },
        ], // Use "0" for new entries
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

  // Store original data for comparison (deep clone)
  originalFormData.value = JSON.parse(JSON.stringify(formData));

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
    workEntries: [
      {
        id: "0",
        description: "",
        hours: 0,
        minutes: 0,
        can_edited: true, // New entries can always be edited
        can_deleted: true, // New entries can always be deleted
      },
    ], // Use "0" for new entries
  });

  // Note: We don't update originalFormData here because adding new groups/entries
  // should be considered as changes that need to be saved
};

const addWorkEntry = (groupIndex) => {
  worklogGroups.value[groupIndex].value.workEntries.push({
    id: "0", // Use "0" for new entries
    description: "",
    hours: 0,
    minutes: 0,
    can_edited: true, // New entries can always be edited
    can_deleted: true, // New entries can always be deleted
  });
};

const removeWorklogGroup = (index) => {
  // Check if group has any deletable entries
  if (!hasGroupDeletableEntries(index)) {
    toast.error(
      "This project group cannot be deleted - all entries are protected"
    );
    return;
  }

  const group = worklogGroups.value[index];
  const deletableEntries = group.value.workEntries.filter(
    (entry) => entry.can_deleted
  );
  const protectedEntries = group.value.workEntries.filter(
    (entry) => !entry.can_deleted
  );

  // If there are protected entries, only remove deletable ones
  if (protectedEntries.length > 0) {
    // Update the group to only contain protected entries
    group.value.workEntries = protectedEntries;

    toast.info(
      `Removed ${deletableEntries.length} deletable entries. ${protectedEntries.length} protected entries remain.`
    );
  } else {
    // If no protected entries, remove the entire group
    remove(index);
    toast.success("Project group deleted successfully");
  }

  // Update the selected projects map after removing entries/group
  updateSelectedProjects();
};

const removeWorkEntry = (groupIndex, entryIndex) => {
  const entry = worklogGroups.value[groupIndex].value.workEntries[entryIndex];

  // Check if entry can be deleted (for existing entries)
  if (entry.id !== "0" && !entry.can_deleted) {
    toast.error("This entry cannot be deleted");
    return;
  }

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

// Custom validation function for editable entries only
const validateEditableEntries = () => {
  const validationErrors = [];

  worklogGroups.value.forEach((group, groupIndex) => {
    // Check if group has editable entries and needs project selection
    const hasEditableEntries = group.value.workEntries.some(
      (entry) => entry.can_edited
    );

    if (hasEditableEntries && !group.value.projectId) {
      validationErrors.push(
        `Project selection is required for group ${groupIndex + 1}`
      );
    }

    group.value.workEntries.forEach((entry, entryIndex) => {
      if (entry.can_edited) {
        // Validate description
        if (!entry.description || entry.description.trim() === "") {
          validationErrors.push(
            `Description is required for entry ${entryIndex + 1} in group ${
              groupIndex + 1
            }`
          );
        }

        // Validate time
        const totalMinutes = (entry.hours || 0) * 60 + (entry.minutes || 0);
        if (totalMinutes <= 0) {
          validationErrors.push(
            `Total time must be greater than 0 for entry ${
              entryIndex + 1
            } in group ${groupIndex + 1}`
          );
        }

        // Validate hours and minutes ranges
        if (entry.hours < 0 || entry.hours > 23) {
          validationErrors.push(
            `Hours must be between 0-23 for entry ${entryIndex + 1} in group ${
              groupIndex + 1
            }`
          );
        }

        if (entry.minutes < 0 || entry.minutes > 59) {
          validationErrors.push(
            `Minutes must be between 0-59 for entry ${
              entryIndex + 1
            } in group ${groupIndex + 1}`
          );
        }
      }
    });
  });

  return validationErrors;
};

// Form submission handler
const onSubmit = handleSubmit(async (values) => {
  // Set submission attempt flag to true to show validation errors if any
  hasAttemptedSubmit.value = true;

  console.log("Form submission started", values);
  console.log("Form errors:", errors.value);

  // Custom validation for editable entries
  const customValidationErrors = validateEditableEntries();
  if (customValidationErrors.length > 0) {
    console.log("Custom validation errors:", customValidationErrors);
    toast.error(`Validation errors: ${customValidationErrors.join(", ")}`);
    return;
  }

  try {
    console.log(
      "EditWorklogPage form submission started, isUpdating:",
      isUpdating.value
    );

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

    console.log(
      "About to call updateBatchWorklogs, isUpdating:",
      isUpdating.value
    );

    // Submit the batch data using PUT update
    await updateBatchWorklogs(batchData, worklogDate);

    console.log("updateBatchWorklogs completed, isUpdating:", isUpdating.value);

    // Update original data to current data after successful save
    const currentData = {
      worklogGroups: worklogGroups.value.map((group) => ({
        id: group.value.id,
        projectId: group.value.projectId,
        workEntries: group.value.workEntries.map((entry) => ({
          id: entry.id,
          description: entry.description,
          hours: entry.hours,
          minutes: entry.minutes,
          can_edited: entry.can_edited,
          can_deleted: entry.can_deleted,
        })),
      })),
    };
    originalFormData.value = JSON.parse(JSON.stringify(currentData));

    // Show success toast
    toast.success("Worklogs updated successfully");
    router.push("/"); // Redirect to dashboard
  } catch (err) {
    console.error("Failed to update worklog:", err);
    console.log("updateBatchWorklogs failed, isUpdating:", isUpdating.value);

    // Show error toast
    toast.error(err.message || "Failed to update worklog");

    // Error message is handled by useWorklog composable's error ref
  }
});

const isFormLoading = computed(() => {
  const loading =
    isLoading.value ||
    isUpdating.value ||
    isCreating.value ||
    isLoadingProjects.value;

  console.log("EditWorklogPage isFormLoading computed:", {
    isLoading: isLoading.value,
    isUpdating: isUpdating.value,
    isCreating: isCreating.value,
    isLoadingProjects: isLoadingProjects.value,
    loading,
  });

  return loading;
});

// Check if at least one entry can be edited
const hasEditableEntries = computed(() => {
  return (
    worklogGroups.value?.some((group) =>
      group.value.workEntries?.some((entry) => entry.can_edited)
    ) || false
  );
});

// Check if a specific group has any editable entries
const isGroupEditable = (groupIndex) => {
  const group = worklogGroups.value?.[groupIndex];
  return group?.value.workEntries?.some((entry) => entry.can_edited) || false;
};

// Check if a specific group has any deletable entries
const hasGroupDeletableEntries = (groupIndex) => {
  const group = worklogGroups.value?.[groupIndex];
  return group?.value.workEntries?.some((entry) => entry.can_deleted) || false;
};

// Compare current form data with original data to detect changes
const hasFormChanges = computed(() => {
  if (!originalFormData.value || !worklogGroups.value) {
    return false;
  }

  // Helper function to normalize data for comparison (only editable fields)
  const normalizeDataForComparison = (data) => {
    return {
      worklogGroups: data.worklogGroups.map((group) => ({
        id: group.id,
        projectId: group.projectId,
        workEntries: group.workEntries
          .filter((entry) => entry.can_edited) // Only compare editable entries
          .map((entry) => ({
            id: entry.id,
            description: entry.description,
            hours: entry.hours,
            minutes: entry.minutes,
          })),
      })),
    };
  };

  // Get current form data (normalized)
  const currentData = {
    worklogGroups: worklogGroups.value.map((group) => ({
      id: group.value.id,
      projectId: group.value.projectId,
      workEntries: group.value.workEntries.map((entry) => ({
        id: entry.id,
        description: entry.description,
        hours: entry.hours,
        minutes: entry.minutes,
        can_edited: entry.can_edited,
        can_deleted: entry.can_deleted,
      })),
    })),
  };

  // Normalize both datasets for comparison
  const normalizedCurrent = normalizeDataForComparison(currentData);
  const normalizedOriginal = normalizeDataForComparison(originalFormData.value);

  // Compare normalized data
  return (
    JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedOriginal)
  );
});

// Reset form to original state
const resetFormToOriginal = () => {
  if (originalFormData.value) {
    setValues(originalFormData.value);
    updateSelectedProjects();
  }
};

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
          <div class="col-span-2">Time</div>
          <div class="col-span-1"></div>
          <div class="col-span-1"></div>
        </div>

        <!-- Worklog Groups -->
        <div
          v-for="(group, groupIndex) in worklogGroups"
          :key="group.value.id"
          class="space-y-4 border-b pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0"
          :class="{
            'bg-gray-50 border-gray-200 rounded-lg p-4':
              !isGroupEditable(groupIndex),
            'border-l-4 border-l-gray-400': !isGroupEditable(groupIndex),
          }"
        >
          <!-- Protected Group Indicator -->
          <div
            v-if="!isGroupEditable(groupIndex)"
            class="flex items-center gap-2 mb-4 text-sm text-gray-600"
          >
            <svg
              class="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span class="font-medium">Protected Project Group</span>
            <span class="text-xs text-gray-500"
              >- All entries in this project are read-only</span
            >
          </div>

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
                :disabled="isFormLoading || !isGroupEditable(groupIndex)"
                :error="
                  shouldShowError(`worklogGroups[${groupIndex}].projectId`) &&
                  !!errors[`worklogGroups[${groupIndex}].projectId`]
                "
                :error-message="
                  shouldShowError(`worklogGroups[${groupIndex}].projectId`)
                    ? errors[`worklogGroups[${groupIndex}].projectId`] || ''
                    : ''
                "
                :class="{
                  'w-full': true,
                  'opacity-60': !isGroupEditable(groupIndex),
                }"
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
                :disabled="isFormLoading || !entry.can_edited"
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
                :class="{ 'opacity-60': !entry.can_edited }"
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
                :disabled="isFormLoading || !entry.can_edited"
                :class="{ 'opacity-60': !entry.can_edited }"
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
                v-if="group.value.workEntries.length > 1 && entry.can_deleted"
                type="button"
                variant="danger"
                size="small"
                class="!bg-transparent !text-red-500 hover:!bg-red-50"
                @click="removeWorkEntry(groupIndex, entryIndex)"
                :disabled="isFormLoading"
                title="Delete this entry"
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

              <!-- Disabled indicator for non-deletable entries -->
              <span
                v-if="group.value.workEntries.length > 1 && !entry.can_deleted"
                class="text-xs text-gray-400 italic self-center"
                title="This entry cannot be deleted"
              >
                Protected
              </span>
            </div>
            <div class="col-span-1 flex justify-end gap-2">
              <!-- Remove Group Button (only show for first entry in group) -->
              <Button
                v-if="
                  entryIndex === 0 &&
                  worklogGroups.length > 1 &&
                  hasGroupDeletableEntries(groupIndex)
                "
                type="button"
                variant="danger"
                size="small"
                class="!bg-transparent !text-red-500 hover:!bg-red-50"
                @click="removeWorklogGroup(groupIndex)"
                :disabled="isFormLoading"
                :title="
                  group.value.workEntries.some((entry) => !entry.can_deleted)
                    ? 'Delete deletable entries from this project group'
                    : 'Delete this project group'
                "
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

              <!-- Protected indicator for non-deletable groups -->
              <span
                v-if="
                  entryIndex === 0 &&
                  worklogGroups.length > 1 &&
                  !hasGroupDeletableEntries(groupIndex)
                "
                class="text-xs text-gray-400 italic self-center"
                title="This project group cannot be deleted - all entries are protected"
              >
                Protected Group
              </span>
            </div>
          </div>

          <!-- Add new work description for same project -->
          <div
            v-if="group.value.workEntries.some((entry) => entry.can_edited)"
            class="grid grid-cols-12 gap-4 mt-2"
          >
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
            Add a new work
          </button>
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
          <Button
            v-if="hasFormChanges"
            type="submit"
            variant="primary"
            :loading="isFormLoading"
          >
            {{ isBatchMode ? "Update Worklogs" : "Update Worklog" }}
          </Button>

          <!-- Message when no changes detected -->
          <div
            v-if="!hasFormChanges && worklogGroups.length > 0"
            class="text-sm text-gray-500 italic self-center"
          >
            No changes detected
          </div>
        </div>
      </form>
    </div>
  </MainLayout>
</template>
