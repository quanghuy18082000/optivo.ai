<template>
  <Modal :isOpen="show" @close="$emit('close')" size="large">
    <template #header>
      <h3 class="text-lg font-medium text-gray-900">
        {{ $t("project_permission.assign_project_roles") }}
      </h3>
    </template>

    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- User Selection -->
        <div>
          <label
            for="user-select"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            {{ $t("project_permission.select_user") }}
            <span class="text-red-500">*</span>
          </label>
          <Select
            id="user-select"
            v-model="form.userId"
            :options="userOptions"
            :placeholder="$t('project_permission.select_user_placeholder')"
            :loading="loadingUsers"
            :class="{ 'border-red-300': errors.userId }"
            searchable
          />
          <p v-if="errors.userId" class="mt-1 text-sm text-red-600">
            {{ errors.userId }}
          </p>
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t("project_permission.select_roles") }}
            <span class="text-red-500">*</span>
          </label>
          <div
            class="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3"
          >
            <div
              v-for="role in projectRoles"
              :key="role.id"
              class="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"
            >
              <input
                :id="`role-${role.id}`"
                type="checkbox"
                :value="role.id"
                v-model="form.roleIds"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label :for="`role-${role.id}`" class="flex-1 cursor-pointer">
                <div class="text-sm font-medium text-gray-900">
                  {{ role.name }}
                </div>
                <div v-if="role.description" class="text-xs text-gray-500">
                  {{ role.description }}
                </div>
              </label>
            </div>

            <!-- Empty state -->
            <div
              v-if="projectRoles.length === 0"
              class="text-center py-4 text-gray-500 text-sm"
            >
              {{ $t("project_permission.no_roles_available") }}
            </div>
          </div>
          <p v-if="errors.roleIds" class="mt-1 text-sm text-red-600">
            {{ errors.roleIds }}
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
                {{ $t("project_permission.assigning_roles_for_project") }}
              </p>
              <p class="text-sm text-blue-700">{{ selectedProject.name }}</p>
            </div>
          </div>
        </div>

        <!-- Selected Summary -->
        <div
          v-if="form.userId && form.roleIds.length > 0"
          class="bg-green-50 border border-green-200 rounded-md p-3"
        >
          <div class="flex items-start">
            <svg
              class="w-5 h-5 text-green-600 mr-2 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium text-green-900">
                {{ $t("project_permission.assignment_summary") }}
              </p>
              <p class="text-sm text-green-700 mt-1">
                {{
                  $t("project_permission.will_assign_roles", {
                    count: form.roleIds.length,
                    user: selectedUserName,
                  })
                }}
              </p>
              <div class="mt-2 flex flex-wrap gap-1">
                <span
                  v-for="roleId in form.roleIds"
                  :key="roleId"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {{ getRoleName(roleId) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </template>

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
          {{ loading ? $t("common.assigning") : $t("common.assign") }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "@/composables/useToast";
import Modal from "@/components/ui/Modal.vue";
import Select from "@/components/ui/Select.vue";
import { getUsersForDropdown } from "@/services/userService";
import { assignProjectRolesToUser } from "../services/projectPermissionService";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  projectId: {
    type: [String, Number],
    required: true,
  },
  projectRoles: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "success"]);

const { t } = useI18n();
const toast = useToast();

// State
const loading = ref(false);
const loadingUsers = ref(false);
const users = ref([]);
const form = ref({
  userId: "",
  roleIds: [],
});
const errors = ref({});

// Computed
const selectedProject = computed(() => {
  // You might want to get project details from a store or prop
  return props.projectId ? { name: `Project ${props.projectId}` } : null;
});

const userOptions = computed(() => {
  return users.value.map((user) => ({
    value: user.id,
    label: user.name,
    description: user.email,
    avatar: user.avatar,
  }));
});

const selectedUserName = computed(() => {
  const user = users.value.find((u) => u.id == form.value.userId);
  return user ? user.name : "";
});

const isFormValid = computed(() => {
  return form.value.userId && form.value.roleIds.length > 0;
});

// Methods
const loadUsers = async () => {
  try {
    loadingUsers.value = true;
    const response = await getUsersForDropdown();
    users.value = response.data || [];
  } catch (error) {
    toast.error(error.message);
  } finally {
    loadingUsers.value = false;
  }
};

const getRoleName = (roleId) => {
  const role = props.projectRoles.find((r) => r.id === roleId);
  return role ? role.name : "";
};

const resetForm = () => {
  form.value = {
    userId: "",
    roleIds: [],
  };
  errors.value = {};
};

const validateForm = () => {
  errors.value = {};

  if (!form.value.userId) {
    errors.value.userId = t("project_permission.user_required");
  }

  if (form.value.roleIds.length === 0) {
    errors.value.roleIds = t("project_permission.roles_required");
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;

    await assignProjectRolesToUser(
      props.projectId,
      form.value.userId,
      form.value.roleIds
    );

    emit("success");
    resetForm();
  } catch (error) {
    console.error("Error assigning project roles:", error);

    // Handle validation errors from server
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else {
      toast.error(
        error.message || t("project_permission.error_assigning_roles")
      );
    }
  } finally {
    loading.value = false;
  }
};

// Watch for modal show/hide to reset form and load data
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      resetForm();
      loadUsers();
    }
  }
);

// Load users on mount
onMounted(() => {
  loadUsers();
});
</script>
