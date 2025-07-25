<template>
  <div class="w-full">
    <div class="mb-8">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-2xl font-bold text-gray-900">
          {{ title }}
        </h2>
      </div>
      <p class="text-gray-600">
        {{ description }}
      </p>
    </div>

    <!-- Plan Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <!-- Table Header -->
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div class="grid grid-cols-5 gap-6 text-sm font-medium text-gray-700">
          <div>Member Name</div>
          <div>Position</div>
          <div>Allocation</div>
          <div>Start Date</div>
          <div>End Date</div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="divide-y divide-gray-200">
        <div
          v-for="(plan, index) in formData.plans"
          :key="plan.id"
          class="px-6 py-4"
        >
          <div class="grid grid-cols-5 gap-6 items-start">
            <div>
              <div>
                <Select
                  v-model="plan.memberId"
                  :options="combinedMemberOptions"
                  placeholder="Select team member"
                  :error="!!errors[`plans.${index}.memberId`]"
                  :error-message="errors[`plans.${index}.memberId`]"
                  :disabled="isLoadingUsers"
                />
              </div>
            </div>
            <div>
              <Select
                v-model="plan.position_id"
                :options="positionOptions"
                placeholder="Select position"
                :error="!!errors[`plans.${index}.position_id`]"
                :error-message="errors[`plans.${index}.position_id`]"
                :disabled="props.isLoadingPositions"
              />
              <div v-if="props.positionError" class="text-red-500 text-sm mt-1">
                {{ props.positionError }}
              </div>
            </div>
            <div>
              <Input
                v-model.number="plan.allocationRate"
                type="number"
                placeholder="1"
                :min="0.1"
                :max="1"
                step="0.1"
                :error="!!errors[`plans.${index}.allocationRate`]"
                :error-message="errors[`plans.${index}.allocationRate`]"
              />
            </div>
            <div>
              <DatePicker
                v-model="plan.start_date"
                :error="!!errors[`plans.${index}.start_date`]"
                :error-message="errors[`plans.${index}.start_date`]"
              />
            </div>
            <div class="flex items-start gap-2">
              <DatePicker
                v-model="plan.end_date"
                :error="!!errors[`plans.${index}.end_date`]"
                :error-message="errors[`plans.${index}.end_date`]"
                class="flex-1"
              />
              <button
                v-if="formData.plans.length > 1"
                @click="removePlan(index)"
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

          <!-- Add allocation for same member - only show for the last allocation of each member -->
          <div
            v-if="
              plan.memberId && isLastAllocationForPerson(index, plan.memberId)
            "
            class="mt-3 border-t border-gray-200 pt-3 flex justify-end pr-6"
          >
            <button
              @click="addPlanForSamePerson(index)"
              class="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
              Add another allocation for this person
            </button>
          </div>
        </div>
      </div>

      <!-- Add New Line -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <button
          @click="addNewPlan"
          class="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-medium">Add new team member</span>
        </button>
      </div>
    </div>

    <!-- Timeline Visualization -->
    <div class="mt-8 timeline-container">
      <PlanTimeline
        v-if="!isLoadingUsers"
        :plans="props.formData.plans"
        :members="timelineMembers"
        :positions="props.positionOptions"
      />
      <div v-else class="text-center py-8 text-gray-500">
        Loading timeline...
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between pt-8">
      <div class="flex gap-4">
        <Button @click="onPrevious" variant="secondary" class="border-gray-300">
          Previous Step
        </Button>
        <Button
          @click="cloneFromQuotation"
          variant="primary"
          class="bg-blue-600 hover:bg-blue-700"
        >
          Clone Data From Quotation
        </Button>
        <Button
          @click="onSkipAndSubmit"
          variant="secondary"
          class="bg-red-600 hover:bg-red-700 text-white border-red-600"
        >
          Skip Input & Submit
        </Button>
      </div>
      <Button
        @click="onSubmit"
        variant="primary"
        class="bg-blue-600 hover:bg-blue-700"
        :loading="isSubmitting"
      >
        Submit (3/3)
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import Input from "@/components/ui/Input.vue";
import Select from "@/components/ui/Select.vue";
import DatePicker from "@/components/ui/DatePicker.vue";
import Button from "@/components/ui/Button.vue";
import PlanTimeline from "../PlanTimeline.vue";
import { getUsers } from "@/services/userService.js";

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
  memberOptions: {
    type: Array,
    default: () => [],
  },
  // Xóa prop members vì không cần thiết nữa
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  isLoadingPositions: {
    type: Boolean,
    default: false,
  },
  positionError: {
    type: String,
    default: null,
  },
});

const emit = defineEmits([
  "previous",
  "submit",
  "skipAndSubmit",
  "cloneFromQuotation",
]);

// State for API users
const apiUsers = ref([]);
const isLoadingUsers = ref(false);
const userError = ref(null);

// Fetch users from the API
const fetchUsers = async () => {
  isLoadingUsers.value = true;
  userError.value = null;

  try {
    const response = await getUsers();
    if (response && Array.isArray(response.data)) {
      // Transform the API response to the format expected by the Select component
      apiUsers.value = response.data.map((user) => ({
        label: user.name,
        value: user.id.toString(), // Convert to string to match the expected format
      }));
    } else {
      console.error("Unexpected API response format:", response);
      userError.value = "Failed to load users: Invalid response format";
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    userError.value = error.message || "Failed to load users";
  } finally {
    isLoadingUsers.value = false;
  }
};

// Computed property to use API users only
const combinedMemberOptions = computed(() => {
  return apiUsers.value;
});

// Computed property for PlanTimeline to use real users
const timelineMembers = computed(() => {
  return apiUsers.value;
});

// Fetch users when component is mounted
onMounted(() => {
  fetchUsers();
});

const onPrevious = () => {
  emit("previous");
};

const onSubmit = () => {
  emit("submit");
};

const onSkipAndSubmit = () => {
  emit("skipAndSubmit");
};

const cloneFromQuotation = () => {
  emit("cloneFromQuotation");
};

// Helper method to check if this is the last allocation for a person
const isLastAllocationForPerson = (index, memberId) => {
  // Check if there are any plans after this one with the same member
  for (let i = index + 1; i < props.formData.plans.length; i++) {
    if (props.formData.plans[i].memberId === memberId) {
      return false;
    }
  }
  return true;
};

const addPlanForSamePerson = (index) => {
  const currentPlan = props.formData.plans[index];

  // Calculate a new date range that starts after the current allocation
  let newStartDate = "";
  let newEndDate = "";

  if (currentPlan.end_date) {
    // Start the new allocation the day after the current one ends
    const newStart = new Date(currentPlan.end_date);
    newStart.setDate(newStart.getDate() + 1);
    newStartDate = newStart.toISOString().split("T")[0];

    // Set end date to be one month after start date by default
    const newEnd = new Date(newStartDate);
    newEnd.setMonth(newStart.getMonth() + 1);
    newEndDate = newEnd.toISOString().split("T")[0];
  }

  // Insert new plan with same member
  props.formData.plans.splice(index + 1, 0, {
    id: uuidv4(),
    memberId: currentPlan.memberId,
    position_id: currentPlan.position_id,
    allocationRate: currentPlan.allocationRate || 0.5,
    start_date: newStartDate,
    end_date: newEndDate,
  });
};

const removePlan = (index) => {
  if (props.formData.plans.length > 1) {
    props.formData.plans.splice(index, 1);
  }
};

const addNewPlan = () => {
  props.formData.plans.push({
    id: uuidv4(),
    memberId: "",
    position_id: "",
    allocationRate: 1,
    start_date: "",
    end_date: "",
  });
};
</script>

<style scoped>
.timeline-container {
  position: relative;
  z-index: 1; /* Lower z-index for timeline */
}
</style>
