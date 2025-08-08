<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="closeModal"
  >
    <div
      class="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">
          {{ $t("user_management.manage_roles") }}
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
          </div>
        </div>
      </div>

      <!-- Current Roles Section -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-900 mb-3">
          {{ $t("user_management.current_roles") }}
        </h4>
        <div v-if="userRoles.length > 0" class="space-y-2">
          <div
            v-for="role in userRoles"
            :key="role.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center">
              <Badge variant="default" size="sm" class="mr-2">
                {{ role.name }}
              </Badge>
              <span v-if="role.description" class="text-sm text-gray-500">
                {{ role.description }}
              </span>
            </div>
            <button
              @click="confirmRemoveRole(role)"
              :disabled="removingRoleId === role.id"
              class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :title="$t('user_management.remove_role')"
            >
              <LoadingSpinner v-if="removingRoleId === role.id" size="sm" />
              <svg
                v-else
                class="w-4 h-4"
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
        <div v-else class="text-sm text-gray-500 italic">
          {{ $t("user_management.no_roles_assigned") }}
        </div>
      </div>

      <!-- Add New Role Section -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-900 mb-3">
          {{ $t("user_management.add_new_role") }}
        </h4>
        <div class="flex gap-2">
          <div class="flex-1">
            <Select
              v-model="selectedNewRoleId"
              :options="availableRoleOptions"
              :placeholder="$t('user_management.choose_role')"
              searchable
              search-placeholder="Search roles..."
            />
          </div>
          <button
            @click="addRole"
            :disabled="!selectedNewRoleId || addingRole"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LoadingSpinner v-if="addingRole" size="sm" class="text-white" />
            <svg
              v-else
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
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
      >
        <div class="flex">
          <svg
            class="w-5 h-5 text-red-400 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="text-sm text-red-800">
            {{ errorMessage }}
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div
        class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200"
      >
        <button
          type="button"
          @click="closeModal"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {{ $t("common.close") }}
        </button>
      </div>
    </div>
  </div>

  <!-- Remove Role Confirmation Modal -->
  <ConfirmModal
    v-model="showRemoveConfirm"
    :title="$t('user_management.remove_role')"
    :message="removeConfirmMessage"
    :confirm-text="$t('user_management.remove')"
    :cancel-text="$t('common.cancel')"
    @confirm="handleRemoveRole"
  />
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useToast } from "@/composables/useToast";
import Avatar from "@/components/ui/Avatar.vue";
import Badge from "@/components/ui/Badge.vue";
import Select from "@/components/ui/Select.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import LoadingSpinner from "@/components/ui/LoadingSpinner.vue";
import {
  assignRolesToUser,
  unassignRoleFromUser,
} from "@/services/roleService";

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

const toast = useToast();

// State
const userRoles = ref([]);
const selectedNewRoleId = ref(null);
const addingRole = ref(false);
const removingRoleId = ref(null);
const errorMessage = ref("");
const showRemoveConfirm = ref(false);
const roleToRemove = ref(null);

// Computed
const availableRoleOptions = computed(() => {
  const userRoleIds = userRoles.value.map((role) => role.id);
  return props.roles
    .filter((role) => !userRoleIds.includes(role.id))
    .map((role) => ({
      value: role.id,
      label: role.name,
      description: role.description,
    }));
});

const removeConfirmMessage = computed(() => {
  if (!roleToRemove.value) return "";
  return `Are you sure you want to remove the role "${roleToRemove.value.name}" from ${props.user?.name}?`;
});

// Watch for modal open/close
watch(
  () => props.show,
  (newValue) => {
    if (newValue && props.user) {
      initializeUserRoles();
      errorMessage.value = "";
    }
  }
);

const initializeUserRoles = () => {
  // Initialize user roles from the user data
  userRoles.value = props.user.role || [];
  selectedNewRoleId.value = null;
};

// Removed color variants - using default gray for all roles

const addRole = async () => {
  if (!selectedNewRoleId.value) return;

  addingRole.value = true;
  errorMessage.value = "";

  try {
    const userId = props.user.user_id || props.user.id;
    await assignRolesToUser(userId, [selectedNewRoleId.value]);

    // Find the added role and add it to userRoles
    const addedRole = props.roles.find(
      (role) => role.id === selectedNewRoleId.value
    );
    if (addedRole) {
      userRoles.value.push(addedRole);
    }

    selectedNewRoleId.value = null;
    toast.success("Role assigned successfully");
    emit("success");
  } catch (error) {
    console.error("Error adding role:", error);
    errorMessage.value = error.message || "Failed to assign role";
    toast.error("Failed to assign role");
  } finally {
    addingRole.value = false;
  }
};

const confirmRemoveRole = (role) => {
  roleToRemove.value = role;
  showRemoveConfirm.value = true;
};

const handleRemoveRole = async () => {
  if (!roleToRemove.value) return;

  removingRoleId.value = roleToRemove.value.id;
  errorMessage.value = "";

  try {
    const userId = props.user.user_id || props.user.id;
    await unassignRoleFromUser(userId, roleToRemove.value.id);

    // Remove role from userRoles
    userRoles.value = userRoles.value.filter(
      (role) => role.id !== roleToRemove.value.id
    );

    toast.success("Role removed successfully");
    emit("success");
  } catch (error) {
    console.error("Error removing role:", error);
    errorMessage.value = error.message || "Failed to remove role";
    toast.error("Failed to remove role");
  } finally {
    removingRoleId.value = null;
    roleToRemove.value = null;
    showRemoveConfirm.value = false;
  }
};

const closeModal = () => {
  if (!addingRole.value && !removingRoleId.value) {
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
