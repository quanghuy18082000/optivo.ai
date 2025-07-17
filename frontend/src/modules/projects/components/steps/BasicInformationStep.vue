<template>
  <div class="w-full">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        {{ title }}
      </h2>
      <p class="text-gray-600">{{ description }}</p>
    </div>

    <form @submit.prevent="onNext" class="space-y-6">
      <div>
        <label
          for="projectName"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Project Name
        </label>
        <Input
          id="projectName"
          v-model="formData.projectName"
          placeholder="Enter project name"
          :error="!!errors.projectName || !!localErrors.projectName"
          :error-message="errors.projectName || localErrors.projectName"
          class="w-full"
          required
        />
      </div>

      <div>
        <label
          for="description"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Project Description
        </label>
        <textarea
          id="description"
          v-model="formData.description"
          placeholder="Enter project description"
          :class="[
            'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            errors.description || localErrors.description
              ? 'border-red-500'
              : 'border-gray-300',
          ]"
          rows="4"
        ></textarea>
        <span
          v-if="errors.description || localErrors.description"
          class="text-sm text-red-500 mt-1 block"
        >
          {{ errors.description || localErrors.description }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <label
            for="start_date"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Start Date
          </label>
          <DatePicker
            id="start_date"
            v-model="formData.start_date"
            :error="!!errors.start_date || !!localErrors.start_date"
            :error-message="errors.start_date || localErrors.start_date"
            required
          />
        </div>
        <div>
          <label
            for="endDate"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            End Date
          </label>
          <DatePicker
            id="endDate"
            v-model="formData.end_date"
            :error="!!errors.end_date || !!localErrors.end_date"
            :error-message="errors.end_date || localErrors.end_date"
            required
          />
        </div>
      </div>

      <div class="flex justify-end pt-6">
        <Button
          type="submit"
          variant="primary"
          class="bg-blue-600 hover:bg-blue-700"
        >
          Next Step (1/3)
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Input from "@/components/ui/Input.vue";
import DatePicker from "@/components/ui/DatePicker.vue";
import Button from "@/components/ui/Button.vue";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["next"]);
const localErrors = ref({});

// Set default dates on component mount
// onMounted(() => {
//   // Only set default dates if they're not already set
//   if (!props.formData.start_date) {
//     const today = new Date();
//     props.formData.start_date = formatDate(today);
//   }

//   if (!props.formData.endDate) {
//     const nextMonth = new Date();
//     nextMonth.setMonth(nextMonth.getMonth() + 1);
//     props.formData.endDate = formatDate(nextMonth);
//   }
// });

// Format date to YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Validate form before proceeding to next step
const validateForm = () => {
  localErrors.value = {};
  let isValid = true;

  // Project name validation
  if (!props.formData.projectName?.trim()) {
    localErrors.value.projectName = "Project name is required";
    isValid = false;
  } else if (props.formData.projectName.length < 3) {
    localErrors.value.projectName =
      "Project name must be at least 3 characters";
    isValid = false;
  } else if (props.formData.projectName.length > 100) {
    localErrors.value.projectName =
      "Project name must be less than 100 characters";
    isValid = false;
  }

  // Description validation (optional but with length limit)
  if (props.formData.description && props.formData.description.length > 500) {
    localErrors.value.description =
      "Description must be less than 500 characters";
    isValid = false;
  }

  // Start date validation
  if (!props.formData.start_date) {
    localErrors.value.start_date = "Start date is required";
    isValid = false;
  }

  // End date validation
  if (!props.formData.end_date) {
    localErrors.value.end_date = "End date is required";
    isValid = false;
  }

  // Compare dates if both are valid
  if (props.formData.start_date && props.formData.end_date) {
    const start_date = new Date(props.formData.start_date);
    const end_date = new Date(props.formData.end_date);

    if (start_date >= end_date) {
      localErrors.value.end_date = "End date must be after start date";
      isValid = false;
    }
  }

  return isValid;
};

const onNext = () => {
  if (validateForm()) {
    emit("next");
  }
};
</script>
