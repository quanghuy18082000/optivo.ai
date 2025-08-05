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
          {{ $t("permission_management.add_new_role") }}
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

      <!-- Modal Body -->
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Role Name -->
          <div>
            <label
              for="roleName"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              {{ $t("permission_management.role_name") }}
              <span class="text-red-500">*</span>
            </label>
            <input
              id="roleName"
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.name }"
              :placeholder="$t('permission_management.role_name_placeholder')"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">
              {{ errors.name }}
            </p>
          </div>

          <!-- Role Description -->
          <div>
            <label
              for="roleDescription"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              {{ $t("permission_management.role_description") }}
            </label>
            <textarea
              id="roleDescription"
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': errors.description }"
              :placeholder="
                $t('permission_management.role_description_placeholder')
              "
            />
            <p v-if="errors.description" class="mt-1 text-sm text-red-600">
              {{ errors.description }}
            </p>
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
            :disabled="loading"
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
            {{ loading ? $t("common.loading") : $t("common.save") }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "success"]);

// Form state
const loading = ref(false);
const form = reactive({
  name: "",
  description: "",
});

const errors = reactive({
  name: "",
  description: "",
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
  form.name = "";
  form.description = "";
  errors.name = "";
  errors.description = "";
};

const validateForm = () => {
  let isValid = true;

  // Reset errors
  errors.name = "";
  errors.description = "";

  // Validate name
  if (!form.name.trim()) {
    errors.name = "Role name is required";
    isValid = false;
  } else if (form.name.trim().length < 2) {
    errors.name = "Role name must be at least 2 characters";
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    const roleData = {
      name: form.name.trim(),
      description: form.description.trim() || null,
    };

    emit("success", roleData);
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
