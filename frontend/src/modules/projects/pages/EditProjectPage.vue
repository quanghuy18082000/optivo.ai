<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-xl font-semibold text-gray-900">
          Edit Project - {{ stepDescriptions[currentStep - 1].title }} (Step {{ currentStep }} of 3)
        </h1>
      </div>
    </template>

    <template #header-right>
      <div class="flex items-center gap-4">
        <!-- Step Indicators -->
        <StepIndicator :currentStep="currentStep" />
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isLoadingProject" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <svg
          class="animate-spin h-8 w-8 text-blue-600"
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
        <span class="text-gray-600">Loading project details...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg
          class="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-red-800">
          Error loading project
        </h3>
        <p class="mt-1 text-sm text-red-600">{{ loadError }}</p>
        <button
          @click="fetchProjectDetails"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Step Content -->
    <div v-else>
      <!-- Step 1: Basic Information -->
      <BasicInformationStep
        v-if="currentStep === 1"
        :formData="formData"
        :errors="errors"
        :title="stepDescriptions[0].title"
        :description="stepDescriptions[0].description"
        @next="nextStep"
      />

      <!-- Step 2: Quotation Input -->
      <QuotationStep
        v-if="currentStep === 2"
        :formData="formData"
        :errors="errors"
        :title="stepDescriptions[1].title"
        :description="stepDescriptions[1].description"
        :positionOptions="positionOptions"
        :isLoadingPositions="isLoadingPositions"
        :positionError="positionError"
        @next="nextStep"
        @previous="previousStep"
        @refreshPositions="fetchPositions"
      />

      <!-- Step 3: Plan Input -->
      <PlanStep
        v-if="currentStep === 3"
        :formData="formData"
        :errors="errors"
        :title="stepDescriptions[2].title"
        :description="stepDescriptions[2].description"
        :positionOptions="positionOptions"
        :memberOptions="[]"
        :isSubmitting="isSubmitting"
        :isLoadingPositions="isLoadingPositions"
        :positionError="positionError"
        @previous="previousStep"
        @submit="updateProject"
        @skipAndSubmit="skipAndSubmit"
        @cloneFromQuotation="cloneFromQuotation"
      />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import MainLayout from "@/layouts/MainLayout.vue";
import { getProjectById, updateProject } from "../services/projectService";
import StepIndicator from "../components/StepIndicator.vue";
import BasicInformationStep from "../components/steps/BasicInformationStep.vue";
import QuotationStep from "../components/steps/QuotationStep.vue";
import PlanStep from "../components/steps/PlanStep.vue";
import { useToast } from "@/composables/useToast";
import { getPositions } from "@/services/systemConfigService.js";

const router = useRouter();
const route = useRoute();
const toast = useToast();

// Get project ID from route params
const projectId = route.params.id;

// Current step state
const currentStep = ref(1);
const isSubmitting = ref(false);
const isLoadingProject = ref(true);
const loadError = ref(null);
const errors = ref({});

// Form data
const formData = ref({
  projectName: "",
  description: "",
  startDate: "",
  endDate: "",
  quotations: [],
  plans: [],
});

// Step descriptions
const stepDescriptions = [
  {
    title: "Basic Information",
    description: "Update the basic details of your project including name and timeline.",
  },
  {
    title: "Quotation Input",
    description: "Modify the positions and allocations for this project.",
  },
  {
    title: "Team Allocation",
    description: "Update team member assignments and their allocation percentages.",
  },
];

// State for API positions
const apiPositions = ref([]);
const isLoadingPositions = ref(false);
const positionError = ref(null);

// Fetch positions from the API
const fetchPositions = async () => {
  isLoadingPositions.value = true;
  positionError.value = null;

  try {
    const response = await getPositions();
    if (response && Array.isArray(response.data)) {
      apiPositions.value = response.data;
    } else {
      console.error("Unexpected API response format:", response);
      positionError.value = "Failed to load positions: Invalid response format";
    }
  } catch (error) {
    console.error("Error fetching positions:", error);
    positionError.value = error.message || "Failed to load positions";
  } finally {
    isLoadingPositions.value = false;
  }
};

// Options for dropdowns
const positionOptions = computed(() =>
  apiPositions.value.map((position) => ({
    label: position.name,
    value: position.id.toString(),
  }))
);

// Fetch project details
const fetchProjectDetails = async () => {
  isLoadingProject.value = true;
  loadError.value = null;

  try {
    const response = await getProjectById(projectId);
    const project = response.data;

    // Populate form data with project details
    formData.value = {
      projectName: project.name || project.project_name || "",
      description: project.description || "",
      startDate: formatDateForInput(project.start_time || project.start_date),
      endDate: formatDateForInput(project.end_time || project.end_date),
      quotations: transformQuotations(project.quotation || []),
      plans: transformPlans(project.plan || []),
    };

    // If no quotations exist, add a default one
    if (formData.value.quotations.length === 0) {
      formData.value.quotations.push({
        id: uuidv4(),
        position: "",
        quantity: 1,
        startDate: formData.value.startDate,
        endDate: formData.value.endDate,
        isContinuation: false,
      });
    }

    // If no plans exist, add a default one
    if (formData.value.plans.length === 0) {
      formData.value.plans.push({
        id: uuidv4(),
        memberId: "",
        position: "",
        allocationRate: 1,
        startDate: formData.value.startDate,
        endDate: formData.value.endDate,
      });
    }
  } catch (error) {
    console.error("Error fetching project details:", error);
    loadError.value = error.message || "Failed to load project details";
  } finally {
    isLoadingProject.value = false;
  }
};

// Helper function to format date for input
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

// Transform quotations from API format to form format
const transformQuotations = (quotations) => {
  return quotations.map((q) => ({
    id: q.id ? q.id.toString() : uuidv4(),
    position: q.position ? q.position.toString() : "",
    quantity: q.quantity || 1,
    startDate: formatDateForInput(q.start_date),
    endDate: formatDateForInput(q.end_date),
    isContinuation: false,
  }));
};

// Transform plans from API format to form format
const transformPlans = (plans) => {
  return plans.map((p) => ({
    id: p.id ? p.id.toString() : uuidv4(),
    memberId: p.user?.id ? p.user.id.toString() : (p.user_id ? p.user_id.toString() : ""),
    position: p.position ? p.position.toString() : "",
    allocationRate: p.allocation_rate || 1,
    startDate: formatDateForInput(p.start_date),
    endDate: formatDateForInput(p.end_date),
  }));
};

// Validation functions (reuse from AddProjectPage)
const validateStep1 = () => {
  const newErrors = {};

  if (!formData.value.projectName?.trim()) {
    newErrors.projectName = "Project name is required";
  } else if (formData.value.projectName.length < 3) {
    newErrors.projectName = "Project name must be at least 3 characters";
  } else if (formData.value.projectName.length > 100) {
    newErrors.projectName = "Project name must be less than 100 characters";
  }

  if (formData.value.description && formData.value.description.length > 500) {
    newErrors.description = "Description must be less than 500 characters";
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
    !newErrors.startDate &&
    !newErrors.endDate
  ) {
    const startDate = new Date(formData.value.startDate);
    const endDate = new Date(formData.value.endDate);

    if (startDate >= endDate) {
      newErrors.endDate = "End date must be after start date";
    }
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const validateStep2 = () => {
  const newErrors = {};

  if (!formData.value.quotations || formData.value.quotations.length === 0) {
    newErrors["quotations"] = "At least one quotation is required";
    errors.value = newErrors;
    return false;
  }

  formData.value.quotations.forEach((quotation, index) => {
    if (!quotation.position && !quotation.isContinuation) {
      newErrors[`quotations.${index}.position`] = "Position is required";
    }

    if (quotation.quantity === undefined || quotation.quantity === null) {
      newErrors[`quotations.${index}.quantity`] = "Allocation is required";
    } else if (
      isNaN(parseFloat(quotation.quantity)) ||
      parseFloat(quotation.quantity) <= 0
    ) {
      newErrors[`quotations.${index}.quantity`] = "Allocation must be greater than 0";
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
      !newErrors[`quotations.${index}.startDate`] &&
      !newErrors[`quotations.${index}.endDate`]
    ) {
      const startDate = new Date(quotation.startDate);
      const endDate = new Date(quotation.endDate);

      if (startDate >= endDate) {
        newErrors[`quotations.${index}.endDate`] = "End date must be after start date";
      }
    }
  });

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const validateStep3 = () => {
  const newErrors = {};

  if (!formData.value.plans || formData.value.plans.length === 0) {
    newErrors["plans"] = "At least one team member allocation is required";
    errors.value = newErrors;
    return false;
  }

  formData.value.plans.forEach((plan, index) => {
    if (!plan.memberId && !plan.isContinuation) {
      newErrors[`plans.${index}.memberId`] = "Team member is required";
    }

    if (!plan.position) {
      newErrors[`plans.${index}.position`] = "Position is required";
    }

    if (plan.allocationRate === undefined || plan.allocationRate === null) {
      newErrors[`plans.${index}.allocationRate`] = "Allocation is required";
    } else if (
      isNaN(parseFloat(plan.allocationRate)) ||
      parseFloat(plan.allocationRate) <= 0
    ) {
      newErrors[`plans.${index}.allocationRate`] = "Allocation must be greater than 0";
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
      !newErrors[`plans.${index}.startDate`] &&
      !newErrors[`plans.${index}.endDate`]
    ) {
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);

      if (startDate >= endDate) {
        newErrors[`plans.${index}.endDate`] = "End date must be after start date";
      }
    }
  });

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// Navigation functions
const nextStep = () => {
  let isValid = false;

  errors.value = {};

  if (currentStep.value === 1) {
    isValid = validateStep1();
  } else if (currentStep.value === 2) {
    isValid = validateStep2();
  } else if (currentStep.value === 3) {
    isValid = validateStep3();
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

// Clone data from quotation to plan
const cloneFromQuotation = () => {
  const newPlans = formData.value.quotations.map((quotation) => ({
    id: uuidv4(),
    memberId: "",
    position: quotation.position,
    allocationRate: Math.min(1, parseFloat(quotation.quantity)),
    startDate: quotation.startDate,
    endDate: quotation.endDate,
  }));

  formData.value.plans = newPlans;
};

// Submit functions
const skipAndSubmit = async () => {
  errors.value = {};

  if (!validateStep1()) {
    currentStep.value = 1;
    return;
  }

  if (!validateStep2()) {
    currentStep.value = 2;
    return;
  }

  await updateProject(true);
};

const updateProject = async (skipPlan = false) => {
  errors.value = {};

  if (!validateStep1()) {
    currentStep.value = 1;
    return;
  }

  if (!validateStep2()) {
    currentStep.value = 2;
    return;
  }

  if (!skipPlan && !validateStep3()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const projectData = {
      project_name: formData.value.projectName.trim(),
      description: formData.value.description || "",
      start_time: formData.value.startDate,
      end_time: formData.value.endDate,

      quotation: formData.value.quotations
        .filter((q) => q.position)
        .map((q) => ({
          position: q.position,
          quantity: parseFloat(q.quantity),
          start_date: q.startDate,
          end_date: q.endDate,
        })),

      plan: skipPlan
        ? []
        : formData.value.plans
            .filter((p) => p.memberId && p.position)
            .map((p) => ({
              user_id: Number(p.memberId),
              position: p.position,
              allocation_rate: parseFloat(p.allocationRate),
              start_date: p.startDate,
              end_date: p.endDate,
            })),
    };

    await updateProject(projectId, projectData);

    toast.success("Project updated successfully");
    router.push("/projects");
  } catch (error) {
    console.error("Error updating project:", error);
    toast.error("Failed to update project. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

// Initialize component
onMounted(async () => {
  await fetchPositions();
  await fetchProjectDetails();
});

// Watch for changes in project dates and propagate to quotations and plans
watch(
  () => [formData.value.startDate, formData.value.endDate],
  ([newStartDate, newEndDate]) => {
    if (newStartDate && newEndDate) {
      formData.value.quotations.forEach((quotation) => {
        if (!quotation.startDate) quotation.startDate = newStartDate;
        if (!quotation.endDate) quotation.endDate = newEndDate;
      });

      formData.value.plans.forEach((plan) => {
        if (!plan.startDate) plan.startDate = newStartDate;
        if (!plan.endDate) plan.endDate = newEndDate;
      });
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.step-indicator {
  transition: all 0.3s ease;
}

.timeline-container {
  overflow-x: auto;
  padding-bottom: 1rem;
  position: relative;
  z-index: 1;
}

:deep(.select-container) {
  position: relative;
  z-index: 50;
}

:deep(.select-dropdown) {
  z-index: 50;
}

:deep(.datepicker-dropdown) {
  z-index: 50;
}

@media (max-width: 768px) {
  .grid-cols-4,
  .grid-cols-5 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>