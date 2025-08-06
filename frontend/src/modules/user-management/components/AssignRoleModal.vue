<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="closeModal"
  >
    <div
      class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">
          {{ $t("user_management.assign_role") }}
        </h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            class="w-6 h-6"
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

      <!-- User Info -->
      <div v-if="user" class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center">
          <Avatar :name="user.name" :src="user.avatar" size="md" class="mr-3" />
          <div>
            <div class="text-sm font-medium text-gray-900">
              {{ user.name }}
            </div>
            <div class="text-sm text-gray-500">{{ user.email }}</div>
            <div v-if="user.role" class="mt-1">
              <Badge :variant="getRoleBadgeVariant(user.role)" size="sm">
                {{ user.role }}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Role Selection -->
          <div>
            <label
              for="roleSelect"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              {{ $t("user_management.select_role") }}
              <span class="text-red-500">*</span>
            </label>
            <Select
              id="roleSelect"
              v-model="selectedRoleId"
              :options="roleOptions"
              :placeholder="$t('user_management.choose_role')"
              searchable
              search-placeholder="Search roles..."
              :class="{ 'border-red-500': errors.role }"
            />
            <p v-if="errors.role" class="mt-1 text-sm text-red-600">
              {{ errors.role }}
            </p>
          </div>

          <!-- Current Role Warning -->
          <div
            v-if="user?.role && selectedRoleId"
            class="p-3 bg-yellow-50 border border-yellow-200 rounded-md"
          >
            <div class="flex">
              <svg
                class="w-5 h-5 text-yellow-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="text-sm text-yellow-800">
                <p class="font-medium">
                  {{ $t("user_management.role_change_warning") }}
                </p>
                <p>
                  {{
                    $t("user_management.current_role_will_be_replaced", {
                      currentRole: user.role,
                    })
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200"
        >
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            type="submit"
            :disabled="loading || !selectedRoleId"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{
              loading ? $t("common.loading") : $t("user_management.assign_role")
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import Avatar from "@/components/ui/Avatar.vue";
import Badge from "@/components/ui/Badge.vue";
import Select from "@/components/ui/Select.vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    default: null,
  },
  roles: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "success"]);

// Form state
const loading = ref(false);
const selectedRoleId = ref(null);

const errors = reactive({
  role: "",
});

// Computed
const roleOptions = computed(() => {
  return props.roles.map((role) => ({
    value: role.id,
    label: role.name,
    description: role.description,
  }));
});

// Reset form when modal opens/closes
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      resetForm();
    }
  }
);

const resetForm = () => {
  selectedRoleId.value = null;
  errors.role = "";
};

const validateForm = () => {
  let isValid = true;

  // Reset errors
  errors.role = "";

  // Validate role selection
  if (!selectedRoleId.value) {
    errors.role = "Please select a role";
    isValid = false;
  }

  return isValid;
};

const getRoleBadgeVariant = (role) => {
  const roleVariants = {
    Admin: "danger",
    Manager: "warning",
    Developer: "info",
    QA: "success",
    Designer: "purple",
  };
  return roleVariants[role] || "default";
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    const selectedRole = props.roles.find(
      (role) => role.id === selectedRoleId.value
    );

    const assignmentData = {
      userId: props.user.user_id || props.user.id,
      roleId: selectedRoleId.value,
      roleName: selectedRole?.name,
    };

    emit("success", assignmentData);
  } catch (error) {
    console.error("Error in form submission:", error);
  } finally {
    loading.value = false;
    closeModal();
  }
};

const closeModal = () => {
  if (!loading.value) {
    emit("close");
  }
};
</script>

<style scoped>
/* Modal backdrop animation */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal content animation */
.relative {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
