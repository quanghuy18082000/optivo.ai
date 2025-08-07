<template>
  <Modal
    :isOpen="show"
    @close="$emit('close')"
    :title="$t('project_permission.add_project_role')"
    size="small"
  >
    <div class="p-8">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label
            for="role-name"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ $t("project_permission.role_name") }}
            <span class="text-red-500">*</span>
          </label>
          <input
            id="role-name"
            v-model="form.name"
            type="text"
            :placeholder="$t('project_permission.role_name_placeholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-300': errors.name }"
            required
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">
            {{ errors.name }}
          </p>
        </div>

        <div>
          <label
            for="role-description"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ $t("project_permission.role_description") }}
          </label>
          <textarea
            id="role-description"
            v-model="form.description"
            rows="3"
            :placeholder="$t('project_permission.role_description_placeholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-300': errors.description }"
          ></textarea>
          <p v-if="errors.description" class="mt-1 text-sm text-red-600">
            {{ errors.description }}
          </p>
        </div>

        <!-- Project Info Display -->
        <div
          v-if="selectedProject"
          class="bg-blue-50 border border-blue-200 rounded-md p-3"
        >
          <div class="flex items-center">
            <svg
              class="w-5 h-5 text-blue-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-900">
                {{ $t("project_permission.creating_role_for_project") }}
              </p>
              <p class="text-sm text-blue-700">{{ selectedProject.name }}</p>
            </div>
          </div>
        </div>
      </form>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {{ $t("common.cancel") }}
        </button>
        <button
          @click="handleSubmit"
          :disabled="loading || !isFormValid"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ loading ? $t("common.creating") : $t("common.create") }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/modules/auth/store";
import Modal from "@/components/ui/Modal.vue";
import { createProjectRole } from "../services/projectPermissionService";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  projectId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["close", "success"]);

const { t } = useI18n();
const toast = useToast();
const authStore = useAuthStore();

// State
const loading = ref(false);
const form = ref({
  name: "",
  description: "",
});
const errors = ref({});

// Debug watch
watch(
  () => props.show,
  (newValue) => {
    console.log("🔍 AddProjectRoleModal show prop changed:", newValue);
  },
  { immediate: true }
);

// Computed
const selectedProject = computed(() => {
  // You might want to get project details from a store or prop
  // For now, we'll just show the project ID
  return props.projectId ? { name: `Project ${props.projectId}` } : null;
});

const isFormValid = computed(() => {
  return form.value.name.trim().length > 0;
});

// Methods
const resetForm = () => {
  form.value = {
    name: "",
    description: "",
  };
  errors.value = {};
};

const validateForm = () => {
  errors.value = {};

  if (!form.value.name.trim()) {
    errors.value.name = t("project_permission.role_name_required");
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = t("project_permission.role_name_min_length");
  } else if (form.value.name.trim().length > 100) {
    errors.value.name = t("project_permission.role_name_max_length");
  }

  if (form.value.description && form.value.description.length > 500) {
    errors.value.description = t(
      "project_permission.role_description_max_length"
    );
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;

    const roleData = {
      name: form.value.name.trim(),
      description: form.value.description.trim(),
    };

    await createProjectRole(props.projectId, roleData);

    emit("success");
    resetForm();
  } catch (error) {
    console.error("Error creating project role:", error);

    // Handle validation errors from server
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else {
      toast.error(error.message || t("project_permission.error_creating_role"));
    }
  } finally {
    loading.value = false;
  }
};

// Watch for modal show/hide to reset form
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      resetForm();
    }
  }
);
</script>
