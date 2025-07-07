<script setup>
import { ref, computed } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { v4 as uuidv4 } from "uuid";
import { useI18n } from "vue-i18n";
import { useQuery } from "@tanstack/vue-query";
import { useRouter } from "vue-router";

import MainLayout from "@/layouts/MainLayout.vue";
import Input from "@/components/ui/Input.vue";
import Select from "@/components/ui/Select.vue";
import Button from "@/components/ui/Button.vue";
import { useWorklog } from "../composables/useWorklog";
import { getProjects } from "../services/worklogService";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
// Use the worklog composable with fetchWorklogs set to false to prevent unnecessary API calls
const { createNewWorklog, isCreating, createError } = useWorklog({
  fetchWorklogs: false,
});

// Fetch projects only
const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
  queryKey: ["projects"],
  queryFn: getProjects,
});

const projectOptions = computed(() => {
  return (
    projectsData.value?.data?.map((p) => ({ label: p.name, value: p.id })) || []
  );
});

// Yup Schemas for validation
const workEntrySchema = yup
  .object({
    id: yup.string().required(),
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
  id: yup.string().required(),
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
            hours: 0,
            minutes: 0,
          },
        ],
      },
    ],
  },
  validateOnMount: false, // Don't validate on component mount
  validateOnBlur: false, // Don't validate on blur
  validateOnChange: false, // Don't validate on change
  validateOnInput: false, // Don't validate on input
});

const { fields: worklogGroups, push, remove } = useFieldArray("worklogGroups");

// Functions to manage form structure
const addWorklogGroup = () => {
  push({
    id: uuidv4(),
    projectId: null,
    workEntries: [{ id: uuidv4(), description: "", hours: 0, minutes: 0 }],
  });
};

const addWorkEntry = (groupIndex) => {
  worklogGroups.value[groupIndex].value.workEntries.push({
    id: uuidv4(),
    description: "",
    hours: 0,
    minutes: 0,
  });
};

const removeWorklogGroup = (index) => {
  remove(index);
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

  const worklogsToCreate = values.worklogGroups.flatMap((group) =>
    group.workEntries.map((entry) => ({
      project_id: group.projectId,
      description: entry.description,
      hours: entry.hours,
      minutes: entry.minutes,
      category: "Work", // Default category
      date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD
    }))
  );

  try {
    await createNewWorklog(worklogsToCreate);

    // Show success toast
    toast.success(
      t("common.worklog_created") || "Worklog created successfully"
    );

    resetForm(); // Clear the form
    hasAttemptedSubmit.value = false; // Reset submission attempt flag
    router.push("/"); // Redirect to dashboard
  } catch (err) {
    console.error("Failed to create worklog:", err);

    // Show error toast
    toast.error(
      err.message ||
        t("common.worklog_create_failed") ||
        "Failed to create worklog"
    );

    // Error message is handled by useWorklog composable's error ref
  }
});

const isFormLoading = computed(
  () => isCreating.value || isLoadingProjects.value
);
</script>

<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Log Work</h1>
        <span class="text-sm text-gray-500">Record your daily activities</span>
      </div>
    </template>

    <div class="p-6 bg-white rounded-lg shadow-md w-full mx-auto">
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
                :options="projectOptions"
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
        <div v-if="createError" class="text-center text-red-500 text-sm mt-3">
          {{ t("common.error", { msg: createError.message }) }}
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
