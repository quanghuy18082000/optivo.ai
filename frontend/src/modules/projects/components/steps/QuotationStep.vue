<template>
  <div class="w-full">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        {{ title }}
      </h2>
      <p class="text-gray-600">
        {{ description }}
      </p>
    </div>

    <!-- Quotation Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <!-- Table Header -->
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div class="grid grid-cols-4 gap-6 text-sm font-medium text-gray-700">
          <div>Position</div>
          <div>Allocation</div>
          <div>Start Date</div>
          <div>End Date</div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="divide-y divide-gray-200">
        <div
          v-for="(quotation, index) in formData.quotations"
          :key="quotation.id"
          class="px-6 py-4"
        >
          <div class="grid grid-cols-4 gap-6 items-start">
            <div>
              <!-- Show position dropdown for first item or if it's not a continuation -->
              <Select
                v-if="!quotation.isContinuation"
                v-model="quotation.position"
                :options="positionOptions"
                placeholder="Select position"
                :error="!!errors[`quotations.${index}.position`]"
                :error-message="errors[`quotations.${index}.position`]"
              />
              <!-- Show position name for continuation items -->
              <div
                v-else
                class="flex items-center h-10 px-3 border border-gray-300 rounded-md bg-gray-50"
              >
                <span class="text-gray-700">
                  {{
                    positionOptions.find((p) => p.value === quotation.position)
                      ?.label || "Same position"
                  }}
                </span>
              </div>
            </div>
            <div>
              <Input
                v-model.number="quotation.quantity"
                type="number"
                placeholder="1"
                :min="0.1"
                :max="10"
                step="0.1"
                :error="!!errors[`quotations.${index}.quantity`]"
                :error-message="errors[`quotations.${index}.quantity`]"
              />
            </div>
            <div>
              <DatePicker
                v-model="quotation.startDate"
                :error="!!errors[`quotations.${index}.startDate`]"
                :error-message="errors[`quotations.${index}.startDate`]"
              />
            </div>
            <div class="flex items-start gap-2">
              <DatePicker
                v-model="quotation.endDate"
                :error="!!errors[`quotations.${index}.endDate`]"
                :error-message="errors[`quotations.${index}.endDate`]"
                class="flex-1"
              />
              <button
                v-if="formData.quotations.length > 1"
                @click="removeQuotation(index)"
                class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Add allocation for same position - only show for the last allocation of each position -->
          <div
            v-if="
              quotation.position &&
              isLastAllocationForPosition(index, quotation.position)
            "
            class="mt-3 border-t border-gray-200 pt-3 flex justify-end pr-6"
          >
            <button
              @click="addQuotationForSamePosition(index)"
              class="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
              Add another allocation for this position
            </button>
          </div>
        </div>
      </div>

      <!-- Add New Line -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <button
          @click="addNewQuotation"
          class="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-medium">Add new position</span>
        </button>
      </div>
    </div>

    <!-- Timeline Visualization -->
    <div class="mt-8 timeline-container">
      <QuotationTimeline :quotations="formData.quotations" />
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between pt-8">
      <Button @click="onPrevious" variant="secondary" class="border-gray-300">
        Previous Step
      </Button>
      <Button
        @click="onNext"
        variant="primary"
        class="bg-blue-600 hover:bg-blue-700"
      >
        Next Step (2/3)
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import Input from "@/components/ui/Input.vue";
import Select from "@/components/ui/Select.vue";
import DatePicker from "@/components/ui/DatePicker.vue";
import Button from "@/components/ui/Button.vue";
import QuotationTimeline from "../QuotationTimeline.vue";

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
  positionOptions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["next", "previous"]);

const onNext = () => {
  emit("next");
};

const onPrevious = () => {
  emit("previous");
};

// Helper method to check if this is the last allocation for a position
const isLastAllocationForPosition = (index, position) => {
  // Check if there are any quotations after this one with the same position
  for (let i = index + 1; i < props.formData.quotations.length; i++) {
    if (props.formData.quotations[i].position === position) {
      return false;
    }
  }
  return true;
};

const addQuotationForSamePosition = (index) => {
  const currentQuotation = props.formData.quotations[index];

  // Calculate a new date range that starts after the current allocation
  let newStartDate = "";
  let newEndDate = "";

  if (currentQuotation.endDate) {
    // Start the new allocation the day after the current one ends
    const newStart = new Date(currentQuotation.endDate);
    newStart.setDate(newStart.getDate() + 1);
    newStartDate = newStart.toISOString().split("T")[0];

    // Set end date to be one month after start date by default
    const newEnd = new Date(newStartDate);
    newEnd.setMonth(newStart.getMonth() + 1);
    newEndDate = newEnd.toISOString().split("T")[0];
  }

  // Insert new quotation with isContinuation flag
  props.formData.quotations.splice(index + 1, 0, {
    id: uuidv4(),
    position: currentQuotation.position,
    quantity: currentQuotation.quantity || 0.5,
    startDate: newStartDate,
    endDate: newEndDate,
    isContinuation: true, // Mark as continuation of the same position
  });
};

const removeQuotation = (index) => {
  if (props.formData.quotations.length > 1) {
    props.formData.quotations.splice(index, 1);
  }
};

const addNewQuotation = () => {
  // Get project dates as defaults
  const projectStartDate =
    props.formData.startDate || new Date().toISOString().split("T")[0];
  const projectEndDate =
    props.formData.endDate ||
    new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split("T")[0];

  props.formData.quotations.push({
    id: uuidv4(),
    position: "",
    quantity: 1,
    startDate: projectStartDate,
    endDate: projectEndDate,
    isContinuation: false,
  });
};
</script>

<style scoped>
.timeline-container {
  position: relative;
  z-index: 1; /* Lower z-index for timeline */
}
</style>
