<template>
  <MainLayout>
    <template #header-left>
      <h1 class="text-2xl font-semibold">
        {{ $t("system_config.title") }}
      </h1>
    </template>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">{{ $t("common.loading") }}</div>
    </div>

    <div v-else class="space-y-8 p-6 bg-white rounded-lg shadow">
      <TabGroup>
        <TabList>
          <Tab :index="0">{{ $t("system_config.categories") }}</Tab>
          <Tab :index="1">{{ $t("system_config.general_settings") }}</Tab>
        </TabList>

        <TabPanels>
          <!-- Categories Panel -->
          <TabPanel :index="0">
            <!-- How to group tasks section -->
            <div class="my-4">
              <h2 class="text-lg font-medium text-gray-900">
                {{ $t("system_config.how_to_group_tasks") }}
              </h2>
            </div>
            <!-- Category Lists -->
            <!-- Thay đổi class của div grid container -->
            <div class="grid grid-cols-12 gap-6 items-start">
              <!-- Current Category List: 5 cột -->
              <div
                class="col-span-5 border border-gray-300 rounded-lg p-4 bg-white"
              >
                <h3 class="font-medium text-gray-900 mb-3">
                  {{ $t("system_config.current_category_list") }}
                </h3>
                <!-- Thay thế phần add new trong Current Category List -->
                <div class="space-y-2">
                  <div
                    v-if="!isAddingNew"
                    class="text-blue-600 cursor-pointer hover:underline text-sm flex items-center"
                    @click="showAddNew"
                  >
                    <svg
                      class="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {{ $t("system_config.add_new") }}
                  </div>
                  <div v-if="isAddingNew" class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <div class="flex-grow flex space-x-2">
                        <div class="w-3/10">
                          <Input
                            v-model="newCategoryName"
                            @keydown="handleNewKeyDown"
                            ref="newInput"
                            placeholder="Title"
                          />
                        </div>
                        <div class="w-7/10">
                          <Input
                            v-model="newCategoryDescription"
                            @keydown="handleNewKeyDown"
                            placeholder="Description"
                          />
                        </div>
                      </div>
                      <button
                        @click="handleAddNew"
                        class="text-green-500 hover:text-green-700"
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <button
                        @click="cancelAddNew"
                        class="text-gray-500 hover:text-gray-700"
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
                      </button>
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <div v-if="loadingCategories" class="text-gray-500">
                    Loading...
                  </div>
                  <div
                    v-else-if="currentCategories.length === 0"
                    class="text-gray-500"
                  >
                    No categories
                  </div>
                  <!-- Thêm ConfirmModal -->
                  <ConfirmModal
                    v-model="showConfirmModal"
                    :title="$t('system_config.confirm_delete_title')"
                    :message="$t('system_config.confirm_delete_message')"
                    :confirmText="$t('system_config.confirm')"
                    :cancelText="$t('system_config.cancel')"
                    @confirm="handleDeleteConfirm"
                  />
                  <!-- Trong phần Current Category List -->
                  <!-- Thay thế phần hiển thị category trong Current Category List -->
                  <div class="space-y-2 overflow-hidden">
                    <div class="space-y-2 overflow-y-auto max-h-40vh">
                      <div
                        v-for="cat in currentCategories"
                        :key="cat.id"
                        class="flex items-center justify-between text-sm py-2 group hover:bg-gray-50 rounded-md px-2"
                      >
                        <div
                          v-if="
                            editingCategory && editingCategory.id === cat.id
                          "
                          class="flex-grow flex space-x-2"
                        >
                          <div class="w-3/10">
                            <Input
                              v-model="editedName"
                              @keydown="handleKeyDown"
                              placeholder="Title"
                            />
                          </div>
                          <div class="w-7/10">
                            <Input
                              v-model="editedDescription"
                              @keydown="handleKeyDown"
                              placeholder="Description"
                            />
                          </div>
                          <button
                            @click="saveCategory"
                            class="text-green-500 hover:text-green-700"
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                          <button
                            @click="cancelEdit"
                            class="text-gray-500 hover:text-gray-700"
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
                          </button>
                        </div>
                        <span
                          v-else
                          class="text-gray-700 flex items-center gap-2"
                        >
                          <TruncateText
                            :name="cat.name"
                            text-class="font-medium"
                          />
                          -
                          <TruncateText
                            :name="cat.description"
                            text-class="text-gray-500"
                          />
                        </span>
                        <div
                          v-if="
                            !editingCategory || editingCategory.id !== cat.id
                          "
                          class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <button
                            @click="editCategory(cat)"
                            class="text-blue-500 hover:text-blue-700"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            @click="showDeleteConfirm(cat.id)"
                            class="text-red-500 hover:text-red-700"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Arrow Button -->
              <div class="flex flex-col justify-center items-center space-y-2">
                <Button
                  variant="primary"
                  :class="[
                    'rounded-full p-3 min-w-0 transition-all duration-200',
                    selectedSuggestions.length > 0
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-blue-500 hover:bg-blue-600',
                  ]"
                  @click="handleBulkApprove"
                  :disabled="selectedSuggestions.length === 0"
                  :title="
                    selectedSuggestions.length > 0
                      ? $t('system_config.approve_selected', {
                          count: selectedSuggestions.length,
                        })
                      : $t('system_config.select_items_to_approve')
                  "
                >
                  <svg
                    class="w-5 h-5 transform"
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
                <!-- Counter badge -->
                <div
                  v-if="selectedSuggestions.length > 0"
                  class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium"
                >
                  {{ selectedSuggestions.length }}
                  {{ $t("system_config.selected") }}
                </div>
              </div>
              <!-- AI Category List -->
              <div
                class="border col-span-5 border-gray-300 rounded-lg p-4 bg-white"
              >
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-medium text-gray-900">
                    {{ $t("system_config.ai_category_list") }}
                  </h3>
                  <!-- Select All checkbox -->
                  <div
                    v-if="aiCategories.length > 0"
                    class="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id="selectAll"
                      :checked="isAllSelected"
                      @change="toggleSelectAll"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label for="selectAll" class="text-sm text-gray-600">
                      {{ $t("system_config.select_all") }}
                    </label>
                  </div>
                </div>
                <div class="space-y-2">
                  <div v-if="loadingCategories" class="text-gray-500">
                    Loading...
                  </div>
                  <div
                    v-else-if="aiCategories.length === 0"
                    class="text-gray-500"
                  >
                    No suggestions
                  </div>
                  <!-- Thay thế phần hiển thị item trong AI Category List -->
                  <div
                    v-for="item in aiCategories"
                    :key="item?.suggestion?.id"
                    class="flex items-center text-sm py-2 group hover:bg-gray-50 rounded-md px-2"
                  >
                    <!-- Checkbox -->
                    <input
                      type="checkbox"
                      :id="`checkbox-${item?.suggestion?.id}`"
                      v-model="selectedSuggestions"
                      :value="item?.suggestion?.id"
                      class="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    <!-- Content -->
                    <div class="flex-grow flex items-center justify-between">
                      <span class="text-gray-700">
                        {{ item?.suggestion?.proposed_name }} (Status:
                        {{ item?.suggestion?.status }}, Worklogs:
                        {{ item?.worklogs_count }})
                      </span>
                      <div
                        class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <button
                          @click="handleApprove(item?.suggestion?.id)"
                          class="text-green-500 hover:text-green-700"
                          title="Approve"
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          @click="handleReject(item?.suggestion?.id)"
                          class="text-red-500 hover:text-red-700"
                          title="Reject"
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
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- General Settings Panel -->
          <TabPanel :index="1">
            <div class="space-y-6 w-full">
              <div class="p-6 rounded-lg space-y-6">
                <!-- Worklog Edit Time Limit -->
                <div class="space-y-2">
                  <label
                    for="edit-worklog-minutes"
                    class="block text-sm font-medium text-gray-700"
                  >
                    {{ $t("system_config.edit_worklog_minutes") }}
                  </label>
                  <TimeInput
                    id="edit-worklog-minutes"
                    v-model="formData.worklog_edit_time_limit_minutes"
                    input-class="w-48"
                    :show-helper="true"
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
                  <TimeInput
                    id="delete-worklog-minutes"
                    v-model="formData.worklog_delete_time_limit_minutes"
                    input-class="w-48"
                    :show-helper="true"
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
                <div class="space-y-2">
                  <label
                    for="ai-prompt"
                    class="block text-sm font-medium text-gray-700"
                  >
                    {{ $t("system_config.ai_prompt") }}
                  </label>
                  <textarea
                    id="ai-prompt"
                    v-model="formData.ai_prompt"
                    :placeholder="$t('system_config.ai_prompt_placeholder')"
                    class="w-full min-h-[250px] px-6 border border-gray-300 rounded-md outline-none shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <!-- Save Button -->
              <div class="flex justify-end pt-6">
                <Button
                  variant="primary"
                  @click="saveConfiguration"
                  :disabled="saving"
                >
                  {{ saving ? $t("common.loading") : $t("common.save") }}
                </Button>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
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
import TimeInput from "@/components/ui/TimeInput.vue";
import TabGroup from "@/components/ui/TabGroup.vue";
import TabList from "@/components/ui/TabList.vue";
import Tab from "@/components/ui/Tab.vue";
import TabPanels from "@/components/ui/TabPanels.vue";
import TabPanel from "@/components/ui/TabPanel.vue";
import Select from "@/components/ui/Select.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import TruncateText from "@/components/ui/TruncateText.vue";
import {
  getWorklogCategories,
  createWorklogCategory,
  deleteWorklogCategory,
  updateSystemConfiguration,
  getSystemConfiguration,
  getCategorySuggestions,
  updateWorklogCategory,
  approveCategorySuggestion,
  rejectCategorySuggestion,
} from "../services/systemConfigService";

const { t } = useI18n();
const authStore = useAuthStore();
const toast = useToast();
const isAddingNew = ref(false);
const newCategoryName = ref("");
const newCategoryDescription = ref("");

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
    toast.error(t("common.error", { msg: error.message }), "error");
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

    toast.success(t("common.success"));
  } catch (error) {
    console.error("Failed to save system configuration:", error);
    toast.error(t("common.error", { msg: error.message }));
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

const transferCategories = () => {};

// Bulk selection functions
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedSuggestions.value = [];
  } else {
    selectedSuggestions.value = aiCategories.value
      .map((item) => item?.suggestion?.id)
      .filter(Boolean);
  }
};

// Bulk approve function
const handleBulkApprove = async () => {
  if (selectedSuggestions.value.length === 0) {
    toast.warning(t("system_config.no_items_selected"));
    return;
  }

  try {
    // Show loading state
    const approvePromises = selectedSuggestions.value.map((suggestionId) =>
      approveCategorySuggestion(suggestionId)
    );

    await Promise.all(approvePromises);

    // Clear selections and refresh data
    selectedSuggestions.value = [];
    await fetchCategories();

    toast.success(
      t("system_config.bulk_approve_success", {
        count: approvePromises.length,
      })
    );
  } catch (error) {
    console.error("Bulk approve failed:", error);
    toast.error(t("system_config.bulk_approve_error"));
  }
};

const removeCustomField = () => {};

const addCustomField = () => {};

// Initialize data on component mount
const currentCategories = ref([]);
const aiCategories = ref([]);
const loadingCategories = ref(false);
const editingCategory = ref(null);
const editedName = ref("");
const editedDescription = ref("");
const error = ref(null);

// Bulk selection state
const selectedSuggestions = ref([]);

// Computed properties for bulk selection
const isAllSelected = computed(() => {
  return (
    aiCategories.value.length > 0 &&
    selectedSuggestions.value.length === aiCategories.value.length
  );
});

// Fetch categories
async function fetchCategories() {
  currentCategories.value = await getWorklogCategories(
    authStore.user.company_id
  );
  aiCategories.value = await getCategorySuggestions(authStore.user.company_id);
}

onMounted(() => {
  fetchSystemConfiguration();
  fetchCategories();
});

// Thêm refs cho modal
const showConfirmModal = ref(false);
const selectedCategoryId = ref(null);

function showDeleteConfirm(categoryId) {
  selectedCategoryId.value = categoryId;
  showConfirmModal.value = true;
}

async function handleDeleteConfirm() {
  if (selectedCategoryId.value) {
    try {
      await deleteWorklogCategory(selectedCategoryId.value);
      toast.success(t("system_config.delete_success"));
      await fetchCategories(); // Refresh list
    } catch (error) {
      toast.error(t("system_config.delete_error"));
    }
    selectedCategoryId.value = null;
  }
}

// Thêm vào phần script setup
async function handleApprove(suggestionId) {
  try {
    await approveCategorySuggestion(suggestionId);
    await fetchCategories(); // Refresh both lists
    toast.success(t("system_config.approve_success"));
  } catch (error) {
    toast.error(t("system_config.approve_error"));
  }
}

async function handleReject(suggestionId) {
  try {
    await rejectCategorySuggestion(suggestionId);
    await fetchCategories(); // Refresh the list
    toast.success(t("system_config.reject_success"));
  } catch (error) {
    toast.error(t("system_config.reject_error"));
  }
}

function showAddNew() {
  isAddingNew.value = true;
  newCategoryName.value = "";
  newCategoryDescription.value = "";
}

async function handleAddNew() {
  try {
    await createWorklogCategory({
      name: newCategoryName.value,
      description: newCategoryDescription.value,
    });

    await fetchCategories();
    isAddingNew.value = false;
    toast.success(t("system_config.create_success"));
  } catch (error) {
    toast.error(t("system_config.create_error"));
  }
}

function cancelAddNew() {
  isAddingNew.value = false;
}

function handleNewKeyDown(event) {
  if (event.key === "Enter") {
    handleAddNew();
  } else if (event.key === "Escape") {
    cancelAddNew();
  }
}

async function editCategory(category) {
  editingCategory.value = category;
  editedName.value = category.name;
  editedDescription.value = category.description;
}

async function saveCategory() {
  try {
    if (!editingCategory.value) return;

    await updateWorklogCategory(editingCategory.value.id, {
      name: editedName.value,
      description: editedDescription.value,
      is_active: editingCategory.value.is_active,
    });

    await fetchCategories();
    editingCategory.value = null;
    toast.success(t("system_config.update_success"));
  } catch (error) {
    toast.error(t("system_config.update_error"));
  }
}

function cancelEdit() {
  editingCategory.value = null;
}

function handleKeyDown(event) {
  if (event.key === "Enter") {
    saveCategory();
  } else if (event.key === "Escape") {
    cancelEdit();
  }
}
</script>
