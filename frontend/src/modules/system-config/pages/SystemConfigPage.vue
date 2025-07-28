<template>
  <MainLayout>
    <template #header-left>
      <h1 class="text-2xl font-semibold text-white">
        {{ $t("system_config.title") }}
      </h1>
    </template>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">{{ $t("common.loading") }}</div>
    </div>

    <div v-else class="space-y-8 p-6 bg-white rounded-lg shadow">
      <!-- How to group tasks section -->
      <div class="space-y-4">
        <h2 class="text-lg font-medium text-gray-900">
          {{ $t("system_config.how_to_group_tasks") }}
        </h2>

        <!-- <div class="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <p class="text-gray-700 leading-relaxed">
            {{ $t("system_config.description_part1") }}
            <span
              class="bg-blue-200 text-blue-800 px-2 py-1 rounded-md font-medium mx-1"
            >
              {{ $t("system_config.description_worklog_data") }}
            </span>
            {{ $t("system_config.description_part2") }}
            <span
              class="bg-blue-200 text-blue-800 px-2 py-1 rounded-md font-medium mx-1"
            >
              {{ $t("system_config.description_category_list") }}
            </span>
            {{ $t("system_config.description_part3") }}
            <span
              class="bg-blue-200 text-blue-800 px-2 py-1 rounded-md font-medium mx-1"
            >
              {{ $t("system_config.description_worklog_data") }}
            </span>
            {{ $t("system_config.description_part4") }}
            <span
              class="bg-blue-200 text-blue-800 px-2 py-1 rounded-md font-medium mx-1"
            >
              {{ $t("system_config.description_category_list") }}
            </span>
            {{ $t("system_config.description_part5") }}
          </p>
        </div> -->
      </div>

      <!-- Category Lists -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- Current Category List -->
        <div class="border border-gray-300 rounded-lg p-4 bg-white">
          <h3 class="font-medium text-gray-900 mb-3">
            {{ $t("system_config.current_category_list") }}
          </h3>
          <div class="space-y-2">
            <div class="text-blue-600 cursor-pointer hover:underline text-sm">
              {{ $t("system_config.add_new") }}
            </div>
            <div
              v-for="i in 3"
              :key="`current-cat-${i}`"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-700">{{
                $t("system_config.category", {
                  number: String(i).padStart(2, "0"),
                })
              }}</span>
              <span class="text-red-500 cursor-pointer hover:underline">
                ({{ $t("system_config.remove") }})
              </span>
            </div>
          </div>
        </div>

        <!-- Arrow Button -->
        <div class="flex justify-center items-center">
          <Button
            variant="primary"
            class="bg-blue-500 hover:bg-blue-600 rounded-full p-3 min-w-0"
            @click="transferCategories"
          >
            <svg
              class="w-5 h-5 transform rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
          </Button>
        </div>

        <!-- AI Category List -->
        <div class="border border-gray-300 rounded-lg p-4 bg-white">
          <h3 class="font-medium text-gray-900 mb-3">
            {{ $t("system_config.ai_category_list") }}
          </h3>
          <div class="space-y-2">
            <div
              v-for="i in 4"
              :key="`ai-cat-${i}`"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-700">{{
                $t("system_config.ai_category", {
                  number: String(i).padStart(2, "0"),
                })
              }}</span>
              <span class="text-red-500 cursor-pointer hover:underline">
                ({{ $t("system_config.remove") }})
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Worklog Edit Time Limit -->
      <div class="space-y-2">
        <label
          for="edit-worklog-minutes"
          class="block text-sm font-medium text-gray-700"
        >
          {{ $t("system_config.edit_worklog_minutes") }}
        </label>
        <Input
          id="edit-worklog-minutes"
          type="number"
          v-model="formData.worklog_edit_time_limit_minutes"
          class="w-32"
          @blur="handleFieldUpdate"
        />
      </div>

      <!-- Worklog Delete Time Limit -->
      <div class="space-y-2">
        <label
          for="delete-worklog-minutes"
          class="block text-sm font-medium text-gray-700"
        >
          {{ $t("system_config.delete_worklog_minutes") }}
        </label>
        <Input
          id="delete-worklog-minutes"
          type="number"
          v-model="formData.worklog_delete_time_limit_minutes"
          class="w-32"
          @blur="handleFieldUpdate"
        />
      </div>

      <!-- Hours per Working Day -->
      <div class="space-y-2">
        <label
          for="hours-per-day"
          class="block text-sm font-medium text-gray-700"
        >
          {{ $t("system_config.hours_per_working_day") }}
        </label>
        <Input
          id="hours-per-day"
          type="number"
          v-model="formData.work_hours_per_day"
          class="w-32"
          @blur="handleFieldUpdate"
        />
      </div>

      <!-- AI Prompt -->
      <!-- <div class="space-y-2">
        <label for="ai-prompt" class="block text-sm font-medium text-gray-700">
          {{ $t("system_config.ai_prompt") }}
        </label>
        <textarea
          id="ai-prompt"
          v-model="formData.ai_prompt"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :placeholder="$t('system_config.ai_prompt_placeholder')"
          @blur="handleFieldUpdate"
        />
      </div> -->

      <!-- Add Custom Fields Section -->

      <!-- Save Button -->
      <div class="flex justify-end pt-6 border-t border-gray-200">
        <Button variant="primary" @click="saveConfiguration" :disabled="saving">
          {{ saving ? $t("common.loading") : $t("common.save") }}
        </Button>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/modules/auth/store";
import { useToast } from "@/composables/useToast";
import { usePageInitLoading } from "@/composables/usePageLoading";
import MainLayout from "@/layouts/MainLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Select from "@/components/ui/Select.vue";
import {
  getSystemConfiguration,
  updateSystemConfiguration,
} from "../services/systemConfigService";

const { t } = useI18n();
const authStore = useAuthStore();
const { showToast } = useToast();

// Page loading management
const { stopLoading } = usePageInitLoading("system-config");

// Loading states
const loading = ref(true);
const saving = ref(false);

// Form data matching API response structure
const formData = ref({
  work_hours_per_day: 8,
  worklog_edit_time_limit_minutes: 60,
  worklog_delete_time_limit_minutes: 30,
  ai_prompt: "",
  id: 0,
  company_id: 0,
  updated_at: null,
});

// Custom fields form data
const selectedDisplayLocation = ref("");
const customFieldName = ref("");
const selectedInputType = ref("single_choice");

// Options
const displayLocationOptions = computed(() => [
  { label: t("system_config.standalone_input_field"), value: "standalone" },
  { label: t("system_config.linked_input_field"), value: "linked" },
]);

const inputTypes = computed(() => [
  { label: t("system_config.single_choice"), value: "single_choice" },
  { label: t("system_config.multiple_choice"), value: "multiple_choice" },
  { label: t("system_config.paragraph"), value: "paragraph" },
  { label: t("system_config.single_text_line"), value: "single_text_line" },
  { label: t("system_config.datetime"), value: "datetime" },
]);

// Methods
const fetchSystemConfiguration = async () => {
  try {
    loading.value = true;

    // Get company_id from user info
    const companyId = authStore.user?.company_id;
    if (!companyId) {
      throw new Error("Company ID not found in user info");
    }

    const response = await getSystemConfiguration(companyId);

    if (response.data) {
      formData.value = {
        ...formData.value,
        ...response.data,
        // Handle null values by converting to empty string for form inputs
        ai_prompt: response.data.ai_prompt || "",
      };
    }
  } catch (error) {
    console.error("Failed to fetch system configuration:", error);
    showToast(t("common.error", { msg: error.message }), "error");
  } finally {
    loading.value = false;
    stopLoading();
  }
};

const saveConfiguration = async () => {
  try {
    saving.value = true;

    // Use company_id from the form data (from API response) instead of user info
    const companyId = formData.value.company_id;
    if (!companyId) {
      throw new Error("Company ID not found in configuration data");
    }

    // Prepare data for API (only the fields that can be updated)
    const updateData = {
      work_hours_per_day: Number(formData.value.work_hours_per_day),
      worklog_edit_time_limit_minutes: Number(
        formData.value.worklog_edit_time_limit_minutes
      ),
      worklog_delete_time_limit_minutes: Number(
        formData.value.worklog_delete_time_limit_minutes
      ),
    };

    const response = await updateSystemConfiguration(companyId, updateData);

    if (response.data) {
      formData.value = {
        ...formData.value,
        ...response.data,
        // Handle null values by converting to empty string for form inputs
        ai_prompt: response.data.ai_prompt || "",
      };
    }

    showToast(t("common.success"), "success");
  } catch (error) {
    console.error("Failed to save system configuration:", error);
    showToast(t("common.error", { msg: error.message }), "error");
  } finally {
    saving.value = false;
  }
};

const handleFieldUpdate = () => {
  // Auto-save functionality could be implemented here
  // For now, we'll just validate the input
  if (formData.value.work_hours_per_day < 1) {
    formData.value.work_hours_per_day = 1;
  }
  if (formData.value.worklog_edit_time_limit_minutes < 0) {
    formData.value.worklog_edit_time_limit_minutes = 0;
  }
  if (formData.value.worklog_delete_time_limit_minutes < 0) {
    formData.value.worklog_delete_time_limit_minutes = 0;
  }
};

const transferCategories = () => {
  console.log("Transfer categories");
};

const removeCustomField = () => {
  console.log("Remove custom field");
};

const addCustomField = () => {
  console.log("Add custom field");
};

// Initialize data on component mount
onMounted(() => {
  fetchSystemConfiguration();
});
</script>
