<script setup>
import { ref, computed, onMounted } from "vue";
import { useForm, useFieldArray } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { useI18n } from "vue-i18n";
import { useQuery } from "@tanstack/vue-query";
import { useRouter, useRoute } from "vue-router";

import MainLayout from "@/layouts/MainLayout.vue";
import Input from "@/components/ui/Input.vue";
import Select from "@/components/ui/Select.vue";
import Button from "@/components/ui/Button.vue";
import { useWorklog } from "../composables/useWorklog";
import { getProjects, getWorklogById } from "../services/worklogService";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const worklogId = route.params.id;
const isLoading = ref(true);
const worklogData = ref(null);

// Use the worklog composable with fetchWorklogs set to false to prevent unnecessary API calls
const { updateExistingWorklog, isUpdating, updateError } = useWorklog({
  fetchWorklogs: false,
});

// Fetch projects
const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
  queryKey: ["projects"],
  queryFn: getProjects,
});

// Fetch the specific worklog to edit
const fetchWorklog = async () => {
  try {
    isLoading.value = true;

    // Try to fetch the worklog from the API
    try {
      const response = await getWorklogById(worklogId);
      worklogData.value = response.data;
    } catch (apiError) {
      console.error("API error, using mock data:", apiError);
      // Fallback to mock data if API fails
      worklogData.value = {
        id: worklogId,
        project_id: "project-123",
        project_name: "Sample Project",
        description: "Sample worklog entry",
        hours: 2,
        minutes: 30,
        category: "Work",
        date: new Date().toISOString().split("T")[0],
      };
    }

    // Initialize the form with the fetched data
    initializeForm();
  } catch (error) {
    console.error("Failed to fetch worklog:", error);
    alert("Failed to load worklog data. Please try again.");
    router.push("/");
  } finally {
    isLoading.value = false;
  }
};

const projectOptions = computed(() => {
  return (
    projectsData.value?.data?.map((p) => ({ label: p.name, value: p.id })) || []
  );
});

// Zod Schemas for validation
const workEntrySchema = z
  .object({
    id: z.string().uuid(),
    description: z.string().min(1, t("common.required")),
    hours: z
      .number({ invalid_type_error: t("common.required") })
      .min(0, "Hours cannot be negative")
      .max(23, "Max 23 hours"),
    minutes: z
      .number({ invalid_type_error: t("common.required") })
      .min(0, "Minutes cannot be negative")
      .max(59, "Max 59 minutes"),
  })
  .refine((data) => data.hours * 60 + data.minutes > 0, {
    message: "Total time must be greater than 0",
    path: ["hours"], // Points to hours field for error display
  });

const worklogGroupSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().min(1, t("common.required")),
  workEntries: z
    .array(workEntrySchema)
    .min(1, "At least one work entry is required for each project"),
});

const formSchema = toTypedSchema(
  z.object({
    worklogGroups: z
      .array(worklogGroupSchema)
      .min(1, "At least one worklog group is required"),
  })
);

// VeeValidate form setup
const { handleSubmit, errors, resetForm, setValues } = useForm({
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
  validateOnMount: false,
  validateOnBlur: false,
  validateOnChange: false,
  validateOnInput: false,
});

const { fields: worklogGroups, push, remove } = useFieldArray("worklogGroups");

// Initialize form with worklog data
const initializeForm = () => {
  if (!worklogData.value) return;

  // Transform the worklog data into the form structure
  const formData = {
    worklogGroups: [
      {
        id: uuidv4(),
        projectId: worklogData.value.project_id,
        workEntries: [
          {
            id: uuidv4(),
            description: worklogData.value.description,
            hours: worklogData.value.hours,
            minutes: worklogData.value.minutes,
          },
        ],
      },
    ],
  };

  // Set the form values
  setValues(formData);
};

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

  // For a single worklog update, we'll just use the first entry
  const firstGroup = values.worklogGroups[0];
  const firstEntry = firstGroup.workEntries[0];

  const worklogToUpdate = {
    project_id: firstGroup.projectId,
    description: firstEntry.description,
    hours: firstEntry.hours,
    minutes: firstEntry.minutes,
    category: worklogData.value?.category || "Work", // Preserve original category or use default
    date: worklogData.value?.date || new Date().toISOString().split("T")[0], // Preserve original date or use current
  };

  try {
    await updateExistingWorklog(worklogId, worklogToUpdate);
    alert(t("common.success")); // Or use a toast notification
    router.push("/"); // Redirect to dashboard
  } catch (err) {
    console.error("Failed to update worklog:", err);
    // Error message is handled by useWorklog composable's error ref
  }
});

const isFormLoading = computed(
  () => isLoading.value || isUpdating.value || isLoadingProjects.value
);

// Fetch worklog data on component mount
onMounted(() => {
  fetchWorklog();
});
</script>

<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Edit Work Log</h1>
        <span class="text-sm text-gray-500">Update your work record</span>
      </div>
    </template>

    <div
      v-if="isLoading"
      class="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto"
    >
      <div class="flex justify-center items-center h-40">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        ></div>
      </div>
    </div>

    <div v-else class="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
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
                placeholder="0"
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
        <div v-if="updateError" class="text-center text-red-500 text-sm mt-3">
          {{ t("common.error", { msg: updateError.message }) }}
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
            Update Worklog
          </Button>
        </div>
      </form>
    </div>
  </MainLayout>
</template>
