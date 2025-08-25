<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useQuery } from "@tanstack/vue-query";
import { useRouter, useRoute } from "vue-router";
import {
  useLoadingIntegration,
  LOADING_KEYS,
} from "@/composables/useLoadingIntegration.js";

import MainLayout from "@/layouts/MainLayout.vue";
import Button from "@/components/ui/Button.vue";
import DatePicker from "@/components/ui/DatePicker.vue";
import WorklogSection from "../components/WorklogSection.vue";

import { useAuthStore } from "@/modules/auth/store";
import { useToast } from "@/composables/useToast";
import { usePageInitLoading } from "@/composables/usePageLoading";
import { useWorklog } from "../composables/useWorklog";
import {
  getProjects,
  getCategories,
  getWorklogDetailsByDate,
} from "../services/worklogService";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();

// Page loading management
const { stopLoading } = usePageInitLoading("edit-worklog");

// Batch edit by date
const selectedDate = ref(
  String(route.query.date || new Date().toISOString().split("T")[0])
);

// System configuration based date limits (reuse create page behavior)
const authStore = useAuthStore();
const minDate = ref(null); // 'yyyy-MM-dd'
const maxDate = ref(new Date().toISOString().split("T")[0]); // 'yyyy-MM-dd' - disable future dates by default

// Optional: load date window similar to Create page (strictest of edit/delete limits)
import {
  getSystemConfiguration,
  getGlobalSystemConfiguration,
} from "@/modules/system-config/services/systemConfigService";
const loadDateLimits = async () => {
  try {
    const companyId = authStore.user?.company_id;
    const cfgRes = companyId
      ? await getSystemConfiguration(companyId)
      : await getGlobalSystemConfiguration();
    const cfg = cfgRes?.data || {};

    const minutesEdit = Number(cfg.worklog_edit_time_limit_minutes ?? NaN);
    const minutesDelete = Number(cfg.worklog_delete_time_limit_minutes ?? NaN);
    const toDaysInclusive = (mins) =>
      Number.isFinite(mins)
        ? Math.max(1, Math.ceil(mins / (60 * 24)))
        : Infinity;

    const daysEdit = toDaysInclusive(minutesEdit);
    const daysDelete = toDaysInclusive(minutesDelete);
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

const updateDateInURL = (date) => {
  router.replace({ query: { ...route.query, date } });
};

// Mutations
const { updateBatchWorklogs, isUpdating } = useWorklog({
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

// Options
const allProjectOptions = computed(() => {
  return (
    projectsData?.value?.data?.map((p) => ({
      label: p.name,
      value: String(p.id),
    })) || []
  );
});
const allCategoryOptions = computed(() => {
  const raw = categoriesData?.value?.data || [];
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

// Edit UI state (slider sections like Create)
const projectRows = ref([]);
const generalRows = ref([]);
const isFormLoading = ref(false);

// Initialize rows from API details-by-date
const initFromFetchedData = (data) => {
  // Reset
  projectRows.value = [];
  generalRows.value = [];

  // Expected batch format: [{ project_id, worklog: [{ id, desc, duration: { hours, minutes }, can_edited, can_deleted, category or category_name }] }]
  const arr = Array.isArray(data) ? data : [];

  for (const grp of arr) {
    if (!grp || typeof grp !== "object") continue;
    const pid = grp.project_id;
    const entries = Array.isArray(grp.worklog) ? grp.worklog : [];

    // General bucket: project_id === 0 -> one row per worklog item
    if (pid === 0) {
      for (const e of entries) {
        const h = Number(e?.duration?.hours || 0);
        const m = Number(e?.duration?.minutes || 0);
        const catName = e?.category_name || e?.category?.name; // support both shapes
        if (!catName) continue;
        generalRows.value.push({
          id: crypto.randomUUID(),
          name: catName,
          hours: h,
          minutes: m,
          desc: e?.desc || "",
          disabled: e?.can_edited === false,
          __worklogId: e?.id ?? null,
        });
      }
      continue; // skip projectRows for pid === 0
    }

    // Project-specific bucket (pid !== 0) -> one row per worklog item
    if (pid != null && pid !== 0) {
      for (const e of entries) {
        const h = Number(e?.duration?.hours || 0);
        const m = Number(e?.duration?.minutes || 0);
        projectRows.value.push({
          id: crypto.randomUUID(),
          name: String(pid),
          hours: h,
          minutes: m,
          desc: e?.desc || "",
          disabled: e?.can_edited === false,
          __worklogId: e?.id ?? null,
        });
      }
    }
  }

  // Ensure at least one row exists for UX
  if (projectRows.value.length === 0) {
    projectRows.value = [
      { id: crypto.randomUUID(), name: null, hours: 0, minutes: 0, desc: "" },
    ];
  }
  if (generalRows.value.length === 0) {
    generalRows.value = [
      { id: crypto.randomUUID(), name: "", hours: 0, minutes: 0, desc: "" },
    ];
  }
};

// Fetch details and init
const isInitialLoading = ref(true);
const isError = ref(false);
const errorMessage = ref("");
const fetchAndInit = async () => {
  try {
    isInitialLoading.value = true;
    isError.value = false;
    errorMessage.value = "";
    const res = await getWorklogDetailsByDate(selectedDate.value);
    const data = res?.data ?? res; // service returns response.data; defensive
    initFromFetchedData(data);
  } catch (e) {
    console.error("Failed to fetch worklog details:", e);
    isError.value = true;
    errorMessage.value = e?.message || "Failed to fetch worklog details";
  } finally {
    isInitialLoading.value = false;
    stopLoading();
  }
};

// Helpers similar to Create
const addProjectRow = () => {
  projectRows.value = [
    ...projectRows.value,
    { id: crypto.randomUUID(), name: null, hours: 0, minutes: 0, desc: "" },
  ];
};
const addGeneralRow = () => {
  generalRows.value = [
    ...generalRows.value,
    { id: crypto.randomUUID(), name: "", hours: 0, minutes: 0, desc: "" },
  ];
};

const totalMinutes = computed(() => {
  const sumRows = (rows) =>
    rows.reduce(
      (acc, r) => acc + (Number(r.hours || 0) * 60 + Number(r.minutes || 0)),
      0
    );
  return sumRows(projectRows.value) + sumRows(generalRows.value);
});

// Submit -> update batch
const onSubmit = async () => {
  isFormLoading.value = true;
  try {
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

    // Build payload like Create
    const rootMap = new Map();
    for (const r of projectRows.value) {
      if (!r.name) continue; // require project selection
      const durMin = Number(r.hours || 0) * 60 + Number(r.minutes || 0);
      if (durMin <= 0) continue; // skip zero time
      const pid = Number(r.name);
      const entry = {
        desc: r.desc,
        duration: { hours: r.hours || 0, minutes: r.minutes || 0 },
      };
      if (!rootMap.has(pid)) rootMap.set(pid, []);
      rootMap.get(pid).push(entry);
    }
    const root = Array.from(rootMap.entries()).map(([project_id, worklog]) => ({
      project_id,
      worklog,
    }));

    const more = generalRows.value
      .filter((r) => !!r.name && ((r.hours || 0) > 0 || (r.minutes || 0) > 0))
      .map((r) => {
        const payload = {
          worklog: {
            desc: r.desc,
            duration: { hours: r.hours || 0, minutes: r.minutes || 0 },
            category_name: r.name,
          },
        };
        const categoryId = findCategoryIdByName(r.name);
        if (categoryId) payload.worklog.category_id = categoryId;
        return payload;
      });

    const payload = { root, more };

    // Block submit if nothing to send
    if (
      (!payload.root || payload.root.length === 0) &&
      (!payload.more || payload.more.length === 0)
    ) {
      toast.error("Nothing to submit");
      isFormLoading.value = false;
      return;
    }

    await updateBatchWorklogs(payload, selectedDate.value);
    toast.success("Worklog updated");
    router.push("/");
  } catch (err) {
    toast.error(err?.message || "Failed to update worklog");
  } finally {
    isFormLoading.value = false;
  }
};

// Effects
watch(selectedDate, (newDate, oldDate) => {
  if (newDate && newDate !== oldDate) {
    updateDateInURL(newDate);
    fetchAndInit();
  }
});

onMounted(async () => {
  await loadDateLimits();
  await fetchAndInit();
});
</script>

<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ t("worklog.edit.title_batch") }}
        </h1>
        <span class="text-sm text-gray-500">
          {{ t("worklog.edit.subtitle_batch_prefix") }}
          {{ new Date(selectedDate).toLocaleDateString() }}
        </span>
      </div>
    </template>

    <div
      v-if="isInitialLoading"
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
          {{ t("worklog.common.error_loading") }}
        </div>
        <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
        <Button @click="router.push('/')" variant="secondary">
          {{ t("worklog.common.return_to_dashboard") }}
        </Button>
      </div>
    </div>

    <div v-else class="p-6 bg-white rounded-lg shadow-md w-full mx-auto">
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

        <!-- Sections (Projects + General) -->
        <div class="space-y-8">
          <WorklogSection
            :title="t('worklog.create.projects_section')"
            :name-label="t('worklog.create.project_name')"
            :name-input-is-select="true"
            :options="allProjectOptions"
            :enforce-unique="false"
            v-model="projectRows"
            @add="addProjectRow"
            :disabled="isFormLoading || isUpdating"
            :add-at-bottom="true"
            :desc-placeholder="t('worklog.common.description_placeholder')"
            :name-placeholder="t('worklog.create.select_project_placeholder')"
            :add-label="t('worklog.common.add_more')"
          />

          <WorklogSection
            :title="t('worklog.create.general_section')"
            :name-label="t('worklog.create.category_name')"
            :name-input-is-select="true"
            :options="allCategoryOptions"
            :enforce-unique="false"
            :allow-free-input="true"
            v-model="generalRows"
            @add="addGeneralRow"
            :disabled="isFormLoading || isUpdating"
            :add-at-bottom="true"
            :desc-placeholder="t('worklog.common.description_placeholder')"
            :name-placeholder="t('worklog.create.select_category_placeholder')"
            :add-label="t('worklog.common.add_more')"
          />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            :disabled="isFormLoading || isUpdating"
            @click="router.push('/')"
          >
            {{ t("common.cancel") }}
          </Button>
          <Button
            type="submit"
            variant="primary"
            :loading="isFormLoading || isUpdating"
            class="bg-blue-600 hover:bg-blue-700"
          >
            {{ t("worklog.create.save_button") }}
          </Button>
        </div>
      </form>
    </div>
  </MainLayout>
</template>
