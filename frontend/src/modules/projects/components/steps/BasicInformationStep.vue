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
          :error="!!errors.projectName"
          :error-message="errors.projectName"
          class="w-full"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <label
            for="startDate"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Start Date
          </label>
          <DatePicker
            id="startDate"
            v-model="formData.startDate"
            :error="!!errors.startDate"
            :error-message="errors.startDate"
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
            v-model="formData.endDate"
            :error="!!errors.endDate"
            :error-message="errors.endDate"
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

const onNext = () => {
  emit("next");
};
</script>
