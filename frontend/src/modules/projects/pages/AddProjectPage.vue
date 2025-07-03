<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar Navigation -->
    <div class="w-16 bg-blue-600 flex flex-col items-center py-6 space-y-6">
      <!-- Logo -->
      <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center">
        <span class="text-blue-600 font-bold text-lg">O</span>
      </div>

      <!-- Step Indicators -->
      <div class="flex flex-col space-y-4">
        <!-- Step 1 -->
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          :class="
            currentStep >= 1
              ? 'bg-white text-blue-600'
              : 'bg-blue-500 text-white'
          "
        >
          <svg
            v-if="currentStep > 1"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span v-else class="text-sm font-medium">1</span>
        </div>

        <!-- Step 2 -->
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          :class="
            currentStep >= 2
              ? 'bg-white text-blue-600'
              : 'bg-blue-500 text-white'
          "
        >
          <svg
            v-if="currentStep > 2"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span v-else class="text-sm font-medium">2</span>
        </div>

        <!-- Step 3 -->
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          :class="
            currentStep >= 3
              ? 'bg-white text-blue-600'
              : 'bg-blue-500 text-white'
          "
        >
          <svg
            v-if="currentStep > 3"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span v-else class="text-sm font-medium">3</span>
        </div>
      </div>

      <!-- Profile Icon -->
      <div class="mt-auto">
        <div
          class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
        >
          <svg
            class="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-semibold text-gray-900">
              Add New Project - Step {{ currentStep }} of 3
            </h1>
          </div>
          <button
            @click="goBack"
            class="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </header>

      <!-- Step Content -->
      <main class="flex-1 p-8">
        <!-- Step 1: Basic Information -->
        <div v-if="currentStep === 1" class="max-w-2xl">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              Basic Information
            </h2>
            <p class="text-gray-600">Enter basic project information</p>
          </div>

          <form @submit.prevent="nextStep" class="space-y-6">
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

        <!-- Step 2: Quotation Input -->
        <div v-if="currentStep === 2" class="max-w-6xl">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              Quotation Input
            </h2>
            <p class="text-gray-600">
              Set up quotation allocations for the project
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
                    <Select
                      v-model="quotation.position"
                      :options="positionOptions"
                      placeholder="Select position"
                      :error="!!errors[`quotations.${index}.position`]"
                      :error-message="errors[`quotations.${index}.position`]"
                    />
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

                <!-- Add allocation for same position -->
                <div class="mt-3">
                  <button
                    @click="addQuotationForSamePosition(index)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    Add a new allocation for the same person
                  </button>
                </div>
              </div>
            </div>

            <!-- Add New Line -->
            <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                @click="addNewQuotation"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                Add a new line
              </button>
            </div>
          </div>

          <!-- Timeline Visualization -->
          <div class="mt-8">
            <QuotationTimeline :quotations="formData.quotations" />
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between pt-8">
            <Button
              @click="previousStep"
              variant="secondary"
              class="border-gray-300"
            >
              Previous Step
            </Button>
            <Button
              @click="nextStep"
              variant="primary"
              class="bg-blue-600 hover:bg-blue-700"
            >
              Next Step (2/3)
            </Button>
          </div>
        </div>

        <!-- Step 3: Plan Input -->
        <div v-if="currentStep === 3" class="max-w-6xl">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Plan Input</h2>
            <p class="text-gray-600">
              Define plan allocations and finalize the project
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
                    <Select
                      v-model="plan.memberId"
                      :options="memberOptions"
                      placeholder="Select member"
                      :error="!!errors[`plans.${index}.memberId`]"
                      :error-message="errors[`plans.${index}.memberId`]"
                    />
                  </div>
                  <div>
                    <Select
                      v-model="plan.position"
                      :options="positionOptions"
                      placeholder="Select position"
                      :error="!!errors[`plans.${index}.position`]"
                      :error-message="errors[`plans.${index}.position`]"
                    />
                  </div>
                  <div>
                    <Input
                      v-model.number="plan.allocationRate"
                      type="number"
                      placeholder="1"
                      :min="0.1"
                      :max="2"
                      step="0.1"
                      :error="!!errors[`plans.${index}.allocationRate`]"
                      :error-message="errors[`plans.${index}.allocationRate`]"
                    />
                  </div>
                  <div>
                    <DatePicker
                      v-model="plan.startDate"
                      :error="!!errors[`plans.${index}.startDate`]"
                      :error-message="errors[`plans.${index}.startDate`]"
                    />
                  </div>
                  <div class="flex items-start gap-2">
                    <DatePicker
                      v-model="plan.endDate"
                      :error="!!errors[`plans.${index}.endDate`]"
                      :error-message="errors[`plans.${index}.endDate`]"
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

                <!-- Add allocation for same person -->
                <div class="mt-3">
                  <button
                    @click="addPlanForSamePerson(index)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    Add a new allocation for the same person
                  </button>
                </div>
              </div>
            </div>

            <!-- Add New Line -->
            <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                @click="addNewPlan"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                Add a new line
              </button>
            </div>
          </div>

          <!-- Timeline Visualization -->
          <div class="mt-8">
            <PlanTimeline :plans="formData.plans" :members="mockMembers" />
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between pt-8">
            <Button
              @click="previousStep"
              variant="secondary"
              class="border-gray-300"
            >
              Previous Step
            </Button>
            <div class="flex gap-3">
              <Button
                @click="cloneFromQuotation"
                variant="primary"
                class="bg-blue-600 hover:bg-blue-700"
              >
                Clone Data From Quotation
              </Button>
              <Button
                @click="skipAndSubmit"
                variant="secondary"
                class="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                Skip Input & Submit
              </Button>
              <Button
                @click="submitProject"
                variant="primary"
                class="bg-blue-600 hover:bg-blue-700"
                :loading="isSubmitting"
              >
                Submit (3/3)
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import Input from "@/components/ui/Input.vue";
import Select from "@/components/ui/Select.vue";
import DatePicker from "@/components/ui/DatePicker.vue";
import Button from "@/components/ui/Button.vue";
import QuotationTimeline from "../components/QuotationTimeline.vue";
import PlanTimeline from "../components/PlanTimeline.vue";
import { createProject } from "../services/projectService";
import { mockMembers, mockPositions } from "../data/mockData";

const router = useRouter();

// Current step state
const currentStep = ref(1);
const isSubmitting = ref(false);
const errors = ref({});

// Form data
const formData = ref({
  projectName: "",
  startDate: "",
  endDate: "",
  quotations: [
    {
      id: uuidv4(),
      position: "",
      quantity: 1,
      startDate: "",
      endDate: "",
    },
  ],
  plans: [
    {
      id: uuidv4(),
      memberId: "",
      position: "",
      allocationRate: 1,
      startDate: "",
      endDate: "",
    },
  ],
});

// Options for dropdowns
const positionOptions = computed(() =>
  mockPositions.map((position) => ({
    label: position.name,
    value: position.id,
  }))
);

const memberOptions = computed(() =>
  mockMembers.map((member) => ({
    label: member.name,
    value: member.id,
  }))
);

// Validation functions
const validateStep1 = () => {
  const newErrors = {};

  if (!formData.value.projectName.trim()) {
    newErrors.projectName = "Project name is required";
  } else if (formData.value.projectName.length < 3) {
    newErrors.projectName = "Project name must be at least 3 characters";
  }

  if (!formData.value.startDate) {
    newErrors.startDate = "Start date is required";
  }

  if (!formData.value.endDate) {
    newErrors.endDate = "End date is required";
  }

  if (
    formData.value.startDate &&
    formData.value.endDate &&
    new Date(formData.value.startDate) >= new Date(formData.value.endDate)
  ) {
    newErrors.endDate = "End date must be after start date";
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const validateStep2 = () => {
  const newErrors = {};

  formData.value.quotations.forEach((quotation, index) => {
    if (!quotation.position) {
      newErrors[`quotations.${index}.position`] = "Position is required";
    }
    if (!quotation.quantity || quotation.quantity <= 0) {
      newErrors[`quotations.${index}.quantity`] = "Quantity must be greater than 0";
    }
    if (!quotation.startDate) {
      newErrors[`quotations.${index}.startDate`] = "Start date is required";
    }
    if (!quotation.endDate) {
      newErrors[`quotations.${index}.endDate`] = "End date is required";
    }
    if (
      quotation.startDate &&
      quotation.endDate &&
      new Date(quotation.startDate) >= new Date(quotation.endDate)
    ) {
      newErrors[`quotations.${index}.endDate`] = "End date must be after start date";
    }
  });

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const validateStep3 = () => {
  const newErrors = {};

  formData.value.plans.forEach((plan, index) => {
    if (!plan.memberId) {
      newErrors[`plans.${index}.memberId`] = "Member is required";
    }
    if (!plan.position) {
      newErrors[`plans.${index}.position`] = "Position is required";
    }
    if (!plan.allocationRate || plan.allocationRate <= 0) {
      newErrors[`plans.${index}.allocationRate`] = "Allocation rate must be greater than 0";
    }
    if (!plan.startDate) {
      newErrors[`plans.${index}.startDate`] = "Start date is required";
    }
    if (!plan.endDate) {
      newErrors[`plans.${index}.endDate`] = "End date is required";
    }
    if (
      plan.startDate &&
      plan.endDate &&
      new Date(plan.startDate) >= new Date(plan.endDate)
    ) {
      newErrors[`plans.${index}.endDate`] = "End date must be after start date";
    }
  });

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// Navigation functions
const nextStep = () => {
  let isValid = false;

  if (currentStep.value === 1) {
    isValid = validateStep1();
  } else if (currentStep.value === 2) {
    isValid = validateStep2();
  }

  if (isValid && currentStep.value < 3) {
    currentStep.value++;
    errors.value = {};
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
    errors.value = {};
  }
};

const goBack = () => {
  router.push("/projects");
};

// Quotation management
const addNewQuotation = () => {
  formData.value.quotations.push({
    id: uuidv4(),
    position: "",
    quantity: 1,
    startDate: "",
    endDate: "",
  });
};

const addQuotationForSamePosition = (index) => {
  const currentQuotation = formData.value.quotations[index];
  formData.value.quotations.splice(index + 1, 0, {
    id: uuidv4(),
    position: currentQuotation.position,
    quantity: 0.5,
    startDate: "",
    endDate: "",
  });
};

const removeQuotation = (index) => {
  if (formData.value.quotations.length > 1) {
    formData.value.quotations.splice(index, 1);
  }
};

// Plan management
const addNewPlan = () => {
  formData.value.plans.push({
    id: uuidv4(),
    memberId: "",
    position: "",
    allocationRate: 1,
    startDate: "",
    endDate: "",
  });
};

const addPlanForSamePerson = (index) => {
  const currentPlan = formData.value.plans[index];
  formData.value.plans.splice(index + 1, 0, {
    id: uuidv4(),
    memberId: currentPlan.memberId,
    position: "",
    allocationRate: 0.5,
    startDate: "",
    endDate: "",
  });
};

const removePlan = (index) => {
  if (formData.value.plans.length > 1) {
    formData.value.plans.splice(index, 1);
  }
};

// Clone data from quotation to plan
const cloneFromQuotation = () => {
  const newPlans = formData.value.quotations.map((quotation) => ({
    id: uuidv4(),
    memberId: "",
    position: quotation.position,
    allocationRate: quotation.quantity,
    startDate: quotation.startDate,
    endDate: quotation.endDate,
  }));

  formData.value.plans = newPlans;
};

// Submit functions
const skipAndSubmit = async () => {
  if (!validateStep1()) return;

  await submitProject(true);
};

const submitProject = async (skipPlan = false) => {
  if (!skipPlan && !validateStep3()) return;

  isSubmitting.value = true;

  try {
    const projectData = {
      project_name: formData.value.projectName,
      start_time: new Date(formData.value.startDate).toISOString(),
      end_time: new Date(formData.value.endDate).toISOString(),
      quotation: formData.value.quotations.map((q) => ({
        position: q.position,
        quantity: q.quantity,
        start_date: q.startDate,
        end_date: q.endDate,
      })),
      plan: skipPlan
        ? []
        : formData.value.plans.map((p) => {
            const member = mockMembers.find((m) => m.id === p.memberId);
            return {
              user: {
                id: member.id,
                name: member.name,
              },
              position: p.position,
              allocation_rate: p.allocationRate,
              start_date: p.startDate,
              end_date: p.endDate,
            };
          }),
    };

    await createProject(projectData);
    
    // Show success message and redirect
    alert("Project created successfully!");
    router.push("/projects");
  } catch (error) {
    console.error("Failed to create project:", error);
    alert("Failed to create project. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

// Initialize default dates
onMounted(() => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  formData.value.startDate = today.toISOString().split("T")[0];
  formData.value.endDate = nextMonth.toISOString().split("T")[0];
});
</script>

<style scoped>
/* Custom styles for the stepper */
.step-indicator {
  transition: all 0.3s ease;
}

/* Timeline visualization styles */
.timeline-container {
  overflow-x: auto;
  padding-bottom: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-4,
  .grid-cols-5 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>