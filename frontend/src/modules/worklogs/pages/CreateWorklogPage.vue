<script setup>
import { ref, computed, watch, onMounted } from "vue";
// import { useForm, useFieldArray } from "vee-validate";
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
import { useAuthStore } from "@/modules/auth/store";
import {
  getSystemConfiguration,
  getGlobalSystemConfiguration,
} from "@/modules/system-config/services/systemConfigService";
import HourSlider from "@/components/ui/HourSlider.vue";
import { useWorklog } from "../composables/useWorklog";
import { getProjects } from "../services/worklogService";
import { useToast } from "@/composables/useToast";
import { usePageInitLoading } from "@/composables/usePageLoading";
import WorklogSection from "../components/WorklogSection.vue";
import { getCategories } from "../services/worklogService";

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

// System configuration based date limits
const authStore = useAuthStore();
const minDate = ref(null); // 'yyyy-MM-dd'
// Default: always disable future dates even if config not loaded
const maxDate = ref(new Date().toISOString().split("T")[0]); // 'yyyy-MM-dd'

const loadDateLimits = async () => {
  try {
    const companyId = authStore.user?.company_id;
    const cfgRes = companyId
      ? await getSystemConfiguration(companyId)
      : await getGlobalSystemConfiguration();
    const cfg = cfgRes?.data || {};

    // Strictest window among edit/delete (minutes) -> inclusive days
    const minutesEdit = Number(cfg.worklog_edit_time_limit_minutes ?? NaN);
    const minutesDelete = Number(cfg.worklog_delete_time_limit_minutes ?? NaN);

    const toDaysInclusive = (mins) =>
      Number.isFinite(mins)
        ? Math.max(1, Math.ceil(mins / (60 * 24)))
        : Infinity;

    const daysEdit = toDaysInclusive(minutesEdit);
    const daysDelete = toDaysInclusive(minutesDelete);

    // N includes today: [today - (N - 1), today]
    const n = Math.min(daysEdit, daysDelete);
    const today = new Date();

    if (Number.isFinite(n)) {
      const start = new Date(today);
      start.setDate(today.getDate() - (n - 1));
      const y = start.getFullYear();
      const m = String(start.getMonth() + 1).padStart(2, "0");
      const d = String(start.getDate()).padStart(2, "0");
      minDate.value = `${y}-${m}-${d}`;

      const y2 = today.getFullYear();
      const m2 = String(today.getMonth() + 1).padStart(2, "0");
      const d2 = String(today.getDate()).padStart(2, "0");
      maxDate.value = `${y2}-${m2}-${d2}`;
    } else {
      // Fallback to today only
      const y2 = today.getFullYear();
      const m2 = String(today.getMonth() + 1).padStart(2, "0");
      const d2 = String(today.getDate()).padStart(2, "0");
      minDate.value = `${y2}-${m2}-${d2}`;
      maxDate.value = `${y2}-${m2}-${d2}`;
    }

    // Clamp selectedDate to range if needed
    const clampToRange = (dateStr) => {
      const date = new Date(dateStr);
      const min = minDate.value ? new Date(minDate.value) : null;
      const max = maxDate.value ? new Date(maxDate.value) : null;
      if (min && date < min) return minDate.value;
      if (max && date > max) return maxDate.value;
      return dateStr;
    };
    selectedDate.value = clampToRange(selectedDate.value);
  } catch (e) {
    console.error("Failed to load date limits:", e);
  }
};

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

// Fetch projects and categories
const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
  queryKey: ["projects"],
  queryFn: getProjects,
});
const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
  queryKey: ["categories", authStore.user?.company_id],
  queryFn: () => getCategories({ company_id: authStore.user?.company_id }),
  enabled: computed(() => Boolean(authStore.user?.company_id)),
});

// Integrate loading with global loading screen
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

// All available categories (strings -> options)
const allCategoryOptions = computed(() => {
  const raw = categoriesData?.value?.data || [];
  // backend may return [{name, id}] or strings; normalize to label/value
  return raw.map((c) => {
    if (typeof c === "string") return { label: c, value: c };
    if (c && typeof c === "object")
      return {
        label: c.name ?? String(c.id),
        value: c.name ?? String(c.id),
        id: c.id,
      };
    return { label: String(c), value: String(c) };
  });
});

// Helper: find category_id by category name from fetched list
const findCategoryIdByName = (name) => {
  const raw = categoriesData?.value?.data || [];
  for (const c of raw) {
    if (c && typeof c === "object" && c.name === name) return c.id ?? null;
  }
  return null;
};

// Track selected projects for dropdown filtering (handled inside WorklogSection)
const selectedProjects = ref(new Map());

// No-op to keep compatibility with old calls
const updateSelectedProjects = () => {};

// Always return all options; uniqueness is handled at section level
const getAvailableProjectOptions = () => allProjectOptions.value;

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

// Remove old VeeValidate schema because we moved to slider-based simple validation
const formSchema = null;

// UI state for new sections
const projectRows = ref([
  {
    id: uuidv4(),
    name: null, // projectId as string
    hours: 0,
    minutes: 0,
    desc: "",
  },
]);

const generalRows = ref([
  {
    id: uuidv4(),
    name: "", // category_name free text
    hours: 0,
    minutes: 0,
    desc: "",
  },
]);

const totalMinutes = computed(() => {
  const sumRows = (rows) =>
    rows.reduce(
      (acc, r) => acc + (Number(r.hours || 0) * 60 + Number(r.minutes || 0)),
      0
    );
  return sumRows(projectRows.value) + sumRows(generalRows.value);
});
const totalHoursDisplay = computed(
  () => (totalMinutes.value / 60).toFixed(2) + "h"
);

// Add-row helpers for "Khác" buttons
const addProjectRow = () => {
  projectRows.value = [
    ...projectRows.value,
    { id: uuidv4(), name: null, hours: 0, minutes: 0, desc: "" },
  ];
};
const addGeneralRow = () => {
  generalRows.value = [
    ...generalRows.value,
    { id: uuidv4(), name: "", hours: 0, minutes: 0, desc: "" },
  ];
};

// Track if form has been submitted (for simple validation messaging if needed)
const hasAttemptedSubmit = ref(false);

const isFormLoading = ref(false);

// Form submission handler (no vee-validate wrapper)
const onSubmit = async () => {
  isFormLoading.value = true;
  hasAttemptedSubmit.value = true;

  // Clear previous inline errors
  const clearErrors = (rows) => {
    rows.forEach((r) => {
      delete r.errorName;
      delete r.errorTime;
      delete r.errorDesc;
    });
  };
  clearErrors(projectRows.value);
  clearErrors(generalRows.value);

  // Normalize project selection: map typed label -> id
  const projectOptions = allProjectOptions.value || [];
  const findProjectIdByLabel = (label) => {
    const m = projectOptions.find((o) => o.label === label);
    return m ? m.value : null;
  };
  projectRows.value = projectRows.value.map((r) => {
    if (!r?.name) return r;
    const val = String(r.name);
    const byValue = projectOptions.some((o) => o.value === val);
    if (byValue) return r; // already selected
    const mapped = findProjectIdByLabel(val);
    if (mapped) return { ...r, name: mapped };
    return { ...r, name: null };
  });

  // Row-level validation per requirements
  let hasErrors = false;
  const isNonEmptyText = (s) => (s || "").trim().length > 0;
  const validateProjectRow = (r) => {
    const durMin = Number(r.hours || 0) * 60 + Number(r.minutes || 0);
    const active = r.name != null || durMin > 0 || isNonEmptyText(r.desc);
    if (!active) return; // ignore untouched empty row
    if (!r.name) {
      r.errorName = "Project is required";
      hasErrors = true;
    }
    if (durMin <= 0) {
      r.errorTime = "Time must be > 0";
      hasErrors = true;
    }
    if (!isNonEmptyText(r.desc)) {
      r.errorDesc = "Description is required";
      hasErrors = true;
    }
  };
  const validateGeneralRow = (r) => {
    const durMin = Number(r.hours || 0) * 60 + Number(r.minutes || 0);
    const active =
      (r.name && r.name.trim().length > 0) ||
      durMin > 0 ||
      isNonEmptyText(r.desc);
    if (!active) return; // ignore untouched empty row
    if (!(r.name && r.name.trim().length > 0)) {
      r.errorName = "Category is required";
      hasErrors = true;
    }
    if (durMin <= 0) {
      r.errorTime = "Time must be > 0";
      hasErrors = true;
    }
    if (!isNonEmptyText(r.desc)) {
      r.errorDesc = "Description is required";
      hasErrors = true;
    }
  };

  projectRows.value.forEach(validateProjectRow);
  generalRows.value.forEach(validateGeneralRow);

  if (hasErrors) {
    toast.error("Please fix the highlighted errors");
    isFormLoading.value = false;
    return;
  }

  // Build payload in { root, more } format from slider sections
  // root: project-based entries
  const rootMap = new Map();
  for (const r of projectRows.value) {
    if (!r.name) continue; // require project selection
    const durMin = Number(r.hours || 0) * 60 + Number(r.minutes || 0);
    if (durMin <= 0) continue; // skip zero time
    const pid = Number(r.name);
    const entry = {
      duration: { hours: r.hours || 0, minutes: r.minutes || 0 },
    };
    const descTrim = (r.desc || "").trim();
    if (descTrim.length > 0) entry.desc = descTrim; // only send desc if non-empty
    if (!rootMap.has(pid)) rootMap.set(pid, []);
    rootMap.get(pid).push(entry);
  }
  const root = Array.from(rootMap.entries()).map(([project_id, worklog]) => ({
    project_id,
    worklog,
  }));

  // more: general work entries (category_name free text)
  const more = generalRows.value
    .filter(
      (r) =>
        r.name &&
        r.name.trim().length > 0 &&
        ((r.hours || 0) > 0 || (r.minutes || 0) > 0)
    )
    .map((r) => {
      const worklog = {
        duration: { hours: r.hours || 0, minutes: r.minutes || 0 },
        category_name: r.name.trim(),
      };
      const descTrim = (r.desc || "").trim();
      if (descTrim.length > 0) worklog.desc = descTrim; // only send desc if non-empty
      const categoryId = findCategoryIdByName(r.name.trim());
      if (categoryId) worklog.category_id = categoryId;
      return { worklog };
    });

  // Only include non-empty sections
  const payload = {};
  if (root.length > 0) payload.root = root;
  if (more.length > 0) payload.more = more;

  // Block submit if nothing to send
  if (!payload.root && !payload.more) {
    toast.error("Nothing to submit");
    isFormLoading.value = false;
    return;
  }

  try {
    await createBatchWorklogs(payload, selectedDate.value);
    toast.success("Worklog created successfully");
    // reset sections
    projectRows.value = [
      { id: uuidv4(), name: null, hours: 0, minutes: 0, desc: "" },
    ];
    generalRows.value = [
      { id: uuidv4(), name: "", hours: 0, minutes: 0, desc: "" },
    ];
    hasAttemptedSubmit.value = false;
    router.push("/");
  } catch (err) {
    toast.error(err.message || "Failed to create worklog");
  } finally {
    isFormLoading.value = false;
  }
};

// Watch for date changes and update URL
watch(selectedDate, (newDate) => {
  if (newDate) {
    updateDateInURL(newDate);
  }
});

// Watch projectRows to keep uniqueness inside section (handled internally)
watch(projectRows, () => {}, { deep: true });

// Initialize the selected projects map when component is mounted
onMounted(async () => {
  await loadDateLimits();
  updateSelectedProjects();
  stopLoading();
});
</script>

<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ t("worklog.create.title") }}
        </h1>
        <span class="text-sm text-gray-500">
          {{ t("worklog.create.subtitle") }}
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
            {{ t("worklog.common.date_label") }}
          </label>
          <DatePicker
            id="worklog-date"
            v-model="selectedDate"
            class="w-full sm:w-64"
            :disabled="isFormLoading"
            :min-date="minDate"
            :max-date="maxDate"
            @update:modelValue="updateDateInURL"
          />
        </div>

        <!-- Worklog Groups -->
        <!-- New simplified UI using WorklogSection and sliders -->
        <div class="space-y-8">
          <!-- Projects section -->
          <WorklogSection
            :title="t('worklog.create.projects_section')"
            :name-label="t('worklog.create.project_name')"
            :name-input-is-select="true"
            :options="allProjectOptions"
            :enforce-unique="false"
            v-model="projectRows"
            @add="addProjectRow"
            :disabled="isFormLoading"
            :add-at-bottom="true"
            :desc-placeholder="t('worklog.common.description_placeholder')"
            :name-placeholder="t('worklog.create.select_project_placeholder')"
            :add-label="t('worklog.common.add_more')"
          />

          <!-- General work section -->
          <WorklogSection
            :title="t('worklog.create.general_section')"
            :name-label="t('worklog.create.category_name')"
            :name-input-is-select="true"
            :options="allCategoryOptions"
            :enforce-unique="false"
            :allow-free-input="true"
            v-model="generalRows"
            @add="addGeneralRow"
            :disabled="isFormLoading"
            :add-at-bottom="true"
            :desc-placeholder="t('worklog.common.description_placeholder')"
            :name-placeholder="t('worklog.create.select_category_placeholder')"
            :add-label="t('worklog.common.add_more')"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            :disabled="isFormLoading"
            @click="router.push('/')"
          >
            {{ t("common.cancel") }}
          </Button>
          <Button
            type="submit"
            variant="primary"
            :loading="isFormLoading"
            class="bg-blue-600 hover:bg-blue-700"
            @click="hasAttemptedSubmit = true"
          >
            {{ t("worklog.create.save_button") }}
          </Button>
        </div>
      </form>
    </div>
  </MainLayout>
</template>
