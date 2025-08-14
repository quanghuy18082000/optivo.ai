<template>
  <MainLayout>
    <template #header-left>
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-900">
          Add New Project - {{ stepDescriptions[currentStep - 1].title }} (Step
          {{ currentStep }} of {{ totalSteps }})
        </h1>
      </div>
    </template>

    <template #header-right>
      <div class="flex items-center gap-4">
        <!-- Step Indicators -->
        <StepIndicator :currentStep="currentStep" :totalSteps="totalSteps" />

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
    </template>

    <!-- Step Content -->
    <!-- Step 1: Basic Information -->
    <BasicInformationStep
      v-if="currentStep === 1"
      :formData="formData"
      :errors="errors"
      :title="stepDescriptions[0].title"
      :description="stepDescriptions[0].description"
      @next="nextStep"
    />

    <!-- Step 2: Quotation Input (only if user has permission) -->
    <QuotationStep
      v-if="isQuotationStep"
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

    <!-- Step 3: Plan Input (or Step 2 if quotation is skipped) -->
    <PlanStep
      v-if="isPlanStep"
      :formData="formData"
      :errors="errors"
      :title="stepDescriptions[stepDescriptions.length - 1].title"
      :description="stepDescriptions[stepDescriptions.length - 1].description"
      :positionOptions="positionOptions"
      :memberOptions="[]"
      :isSubmitting="isSubmitting"
      :isLoadingPositions="isLoadingPositions"
      :positionError="positionError"
      :canCreateQuotation="canCreateQuotation"
      :currentStep="currentStep"
      :totalSteps="totalSteps"
      @previous="previousStep"
      @submit="submitProject"
      @skipAndSubmit="skipAndSubmit"
      @cloneFromQuotation="cloneFromQuotation"
    />
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import MainLayout from "@/layouts/MainLayout.vue";
import { createProject } from "../services/projectService";
import StepIndicator from "../components/StepIndicator.vue";
import BasicInformationStep from "../components/steps/BasicInformationStep.vue";
import QuotationStep from "../components/steps/QuotationStep.vue";
import PlanStep from "../components/steps/PlanStep.vue";
import { useToast } from "@/composables/useToast";
import { getPositions } from "@/services/systemService.js";
import {
  useLoadingIntegration,
  LOADING_KEYS,
} from "@/composables/useLoadingIntegration.js";
import { usePageInitLoading } from "@/composables/usePageLoading";
import { usePermissions } from "@/composables/usePermissions.js";

const router = useRouter();
const toast = useToast();

// Page loading management
const { stopLoading } = usePageInitLoading("add-project");

// Permission management
const { hasGlobalPermission, PERMISSIONS } = usePermissions();

// Check if user can create quotations
const canCreateQuotation = computed(() => {
  return hasGlobalPermission(PERMISSIONS.CREATE_QUOTATION);
});

// Current step state
const currentStep = ref(1);
const isSubmitting = ref(false);
const errors = ref({});

// Form data - initialize quotations based on permissions
const initializeFormData = () => {
  const baseData = {
    projectName: "",
    description: "", // Added description field for API
    start_date: "",
    end_date: "",
    plans: [
      {
        id: uuidv4(),
        memberId: "",
        position_id: "",
        allocationRate: 1,
        start_date: "",
        end_date: "",
      },
    ],
  };

  // Only add quotations if user has permission
  if (canCreateQuotation.value) {
    baseData.quotations = [
      {
        id: uuidv4(),
        position_id: "",
        quantity: 1,
        start_date: "",
        end_date: "",
        isContinuation: false,
      },
    ];
  } else {
    baseData.quotations = []; // Empty array if no permission
  }

  return baseData;
};

const formData = ref(initializeFormData());

// Watch for permission changes and reinitialize form data if needed
watch(canCreateQuotation, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    // Reinitialize quotations array based on new permission
    if (newValue && formData.value.quotations.length === 0) {
      // Add default quotation if permission granted
      formData.value.quotations = [
        {
          id: uuidv4(),
          position_id: "",
          quantity: 1,
          start_date: formData.value.start_date,
          end_date: formData.value.end_date,
          isContinuation: false,
        },
      ];
    } else if (!newValue) {
      // Clear quotations if permission revoked
      formData.value.quotations = [];
    }
  }
});

// Step descriptions - dynamic based on permissions
const stepDescriptions = computed(() => {
  const steps = [
    {
      title: "Basic Information",
      description:
        "Enter the basic details of your project including name and timeline.",
    },
  ];

  // Only add quotation step if user has permission
  if (canCreateQuotation.value) {
    steps.push({
      title: "Quotation Input",
      description:
        "Add the positions and allocations you want to quote for this project.",
    });
  }

  steps.push({
    title: "Team Allocation",
    description:
      "Assign team members to the positions and set their allocation percentages.",
  });

  return steps;
});

// Total number of steps based on permissions
const totalSteps = computed(() => stepDescriptions.value.length);

// Step mapping based on permissions
const getActualStep = (stepNumber) => {
  if (!canCreateQuotation.value && stepNumber > 1) {
    // If no quotation permission and step > 1, it's actually the plan step
    return stepNumber + 1; // Skip quotation step (step 2)
  }
  return stepNumber;
};

const isQuotationStep = computed(() => {
  return canCreateQuotation.value && currentStep.value === 2;
});

const isPlanStep = computed(() => {
  return (
    (canCreateQuotation.value && currentStep.value === 3) ||
    (!canCreateQuotation.value && currentStep.value === 2)
  );
});

// State for API positions
const apiPositions = ref([]);
const isLoadingPositions = ref(false);
const positionError = ref(null);

// Integrate positions loading with global loading screen
useLoadingIntegration(LOADING_KEYS.POSITIONS, isLoadingPositions);

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

// Fetch positions when component is mounted
onMounted(async () => {
  await fetchPositions();
  stopLoading();
});

// Options for dropdowns
const positionOptions = computed(() =>
  apiPositions.value.map((position) => ({
    label: position.name,
    value: String(position.id), // Convert to string to match expected format
  }))
);

// Validation functions
const validateStep1 = () => {
  const newErrors = {};

  // Project name validation
  if (!formData.value.projectName?.trim()) {
    newErrors.projectName = "Project name is required";
  } else if (formData.value.projectName.length < 3) {
    newErrors.projectName = "Project name must be at least 3 characters";
  } else if (formData.value.projectName.length > 100) {
    newErrors.projectName = "Project name must be less than 100 characters";
  }

  // Description validation - optional but with length limit
  if (formData.value.description && formData.value.description.length > 500) {
    newErrors.description = "Description must be less than 500 characters";
  }

  // Date validation
  if (!formData.value.start_date || formData.value.start_date.trim() === "") {
    newErrors.start_date = "Start date is required";
  } else {
    // Validate date format - accept both YYYY-MM-DD and DD/MM/YYYY formats
    const isISOFormat = /^\d{4}-\d{2}-\d{2}$/.test(formData.value.start_date);
    const isDDMMYYYYFormat = /^\d{2}\/\d{2}\/\d{4}$/.test(
      formData.value.start_date
    );
    const dateObj = new Date(formData.value.start_date);

    if (!(isISOFormat || isDDMMYYYYFormat) || isNaN(dateObj.getTime())) {
      newErrors.start_date = "Invalid date format";
    }
  }

  if (!formData.value.end_date || formData.value.end_date.trim() === "") {
    newErrors.end_date = "End date is required";
  } else {
    // Validate date format - accept both YYYY-MM-DD and DD/MM/YYYY formats
    const isISOFormat = /^\d{4}-\d{2}-\d{2}$/.test(formData.value.end_date);
    const isDDMMYYYYFormat = /^\d{2}\/\d{2}\/\d{4}$/.test(
      formData.value.end_date
    );
    const dateObj = new Date(formData.value.end_date);

    if (!(isISOFormat || isDDMMYYYYFormat) || isNaN(dateObj.getTime())) {
      newErrors.end_date = "Invalid date format";
    }
  }

  // Compare dates only if both are valid
  if (
    formData.value.start_date &&
    formData.value.end_date &&
    !newErrors.start_date &&
    !newErrors.end_date
  ) {
    const startDate = new Date(formData.value.start_date);
    const endDate = new Date(formData.value.end_date);

    if (startDate >= endDate) {
      newErrors.end_date = "End date must be after start date";
    }

    // Check if project duration is reasonable (e.g., not more than 5 years)
    const fiveYearsInMs = 5 * 365 * 24 * 60 * 60 * 1000;
    if (endDate - startDate > fiveYearsInMs) {
      newErrors.end_date = "Project duration cannot exceed 5 years";
    }
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const validateStep2 = () => {
  const newErrors = {};

  // Skip validation if user doesn't have CREATE_QUOTATION permission
  if (!canCreateQuotation.value) {
    errors.value = newErrors;
    return true;
  }

  // Check if there are any quotations
  if (!formData.value.quotations || formData.value.quotations.length === 0) {
    newErrors["quotations"] = "At least one quotation is required";
    errors.value = newErrors;
    return false;
  }

  // Validate each quotation
  formData.value.quotations.forEach((quotation, index) => {
    // Position validation
    if (!quotation.position_id && !quotation.isContinuation) {
      newErrors[`quotations.${index}.position_id`] = "Position is required";
    } else if (quotation.position_id) {
      // Verify position exists in options
      const positionExists = positionOptions.value.some(
        (p) => p.value === quotation.position_id
      );
      if (!positionExists) {
        newErrors[`quotations.${index}.position_id`] =
          "Invalid position selected";
      }
    }

    // Quantity validation
    if (quotation.quantity === undefined || quotation.quantity === null) {
      newErrors[`quotations.${index}.quantity`] = "Allocation is required";
    } else if (
      isNaN(parseFloat(quotation.quantity)) ||
      parseFloat(quotation.quantity) <= 0
    ) {
      newErrors[`quotations.${index}.quantity`] =
        "Allocation must be greater than 0";
    } else if (parseFloat(quotation.quantity) > 10) {
      newErrors[`quotations.${index}.quantity`] = "Allocation cannot exceed 10";
    }

    // Date validation
    if (!quotation.start_date) {
      newErrors[`quotations.${index}.start_date`] = "Start date is required";
    } else {
      // Validate date format
      const startDateValid =
        /^\d{4}-\d{2}-\d{2}$/.test(quotation.start_date) &&
        !isNaN(new Date(quotation.start_date).getTime());
      if (!startDateValid) {
        newErrors[`quotations.${index}.start_date`] = "Invalid date format";
      } else if (formData.value.start_date) {
        // Check if quotation start date is within project date range
        const projectStart = new Date(formData.value.start_date);
        const quotationStart = new Date(quotation.start_date);
        if (quotationStart < projectStart) {
          newErrors[`quotations.${index}.start_date`] =
            "Cannot be before project start date";
        }
      }
    }

    if (!quotation.end_date) {
      newErrors[`quotations.${index}.end_date`] = "End date is required";
    } else {
      // Validate date format
      const endDateValid =
        /^\d{4}-\d{2}-\d{2}$/.test(quotation.end_date) &&
        !isNaN(new Date(quotation.end_date).getTime());
      if (!endDateValid) {
        newErrors[`quotations.${index}.end_date`] = "Invalid date format";
      } else if (formData.value.end_date) {
        // Check if quotation end date is within project date range
        const projectEnd = new Date(formData.value.end_date);
        const quotationEnd = new Date(quotation.end_date);
        if (quotationEnd > projectEnd) {
          newErrors[`quotations.${index}.end_date`] =
            "Cannot be after project end date";
        }
      }
    }

    // Compare dates only if both are valid
    if (
      quotation.start_date &&
      quotation.end_date &&
      !newErrors[`quotations.${index}.start_date`] &&
      !newErrors[`quotations.${index}.end_date`]
    ) {
      const startDate = new Date(quotation.start_date);
      const endDate = new Date(quotation.end_date);

      if (startDate >= endDate) {
        newErrors[`quotations.${index}.end_date`] =
          "End date must be after start date";
      }
    }
  });

  // Check for overlapping allocations for the same position
  const positionAllocations = {};
  formData.value.quotations.forEach((quotation, index) => {
    if (
      quotation.position_id &&
      !newErrors[`quotations.${index}.position_id`]
    ) {
      if (!positionAllocations[quotation.position_id]) {
        positionAllocations[quotation.position_id] = [];
      }

      if (
        quotation.start_date &&
        quotation.end_date &&
        !newErrors[`quotations.${index}.start_date`] &&
        !newErrors[`quotations.${index}.end_date`]
      ) {
        positionAllocations[quotation.position_id].push({
          index,
          start: new Date(quotation.start_date),
          end: new Date(quotation.end_date),
        });
      }
    }
  });

  // Check for overlaps
  Object.values(positionAllocations).forEach((allocations) => {
    if (allocations.length > 1) {
      // Sort by start date
      allocations.sort((a, b) => a.start - b.start);

      // Check for overlaps
      for (let i = 0; i < allocations.length - 1; i++) {
        if (allocations[i].end > allocations[i + 1].start) {
          // Overlap detected
          const index = allocations[i + 1].index;
          newErrors[`quotations.${index}.start_date`] =
            "Overlaps with another allocation for this position";
        }
      }
    }
  });

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const validateStep3 = () => {
  const newErrors = {};

  // Check if there are any plans
  if (!formData.value.plans || formData.value.plans.length === 0) {
    newErrors["plans"] = "At least one team member allocation is required";
    errors.value = newErrors;
    return false;
  }

  // Validate each plan
  formData.value.plans.forEach((plan, index) => {
    // Member validation
    if (!plan.memberId && !plan.isContinuation) {
      newErrors[`plans.${index}.memberId`] = "Team member is required";
    }

    // Position validation
    if (!plan.position_id) {
      newErrors[`plans.${index}.position_id`] = "Position is required";
    }

    // Allocation rate validation
    if (plan.allocationRate === undefined || plan.allocationRate === null) {
      newErrors[`plans.${index}.allocationRate`] = "Allocation is required";
    } else if (
      isNaN(parseFloat(plan.allocationRate)) ||
      parseFloat(plan.allocationRate) <= 0
    ) {
      newErrors[`plans.${index}.allocationRate`] =
        "Allocation must be greater than 0";
    } else if (parseFloat(plan.allocationRate) > 3) {
      newErrors[`plans.${index}.allocationRate`] =
        "Allocation cannot exceed 3 (300%)";
    }

    // Date validation
    if (!plan.start_date) {
      newErrors[`plans.${index}.start_date`] = "Start date is required";
    } else {
      // Validate date format
      const startDateValid =
        /^\d{4}-\d{2}-\d{2}$/.test(plan.start_date) &&
        !isNaN(new Date(plan.start_date).getTime());
      if (!startDateValid) {
        newErrors[`plans.${index}.start_date`] = "Invalid date format";
      } else if (formData.value.start_date) {
        // Check if plan start date is within project date range
        const projectStart = new Date(formData.value.start_date);
        const planStart = new Date(plan.start_date);
        if (planStart < projectStart) {
          newErrors[`plans.${index}.start_date`] =
            "Cannot be before project start date";
        }
      }
    }

    if (!plan.end_date) {
      newErrors[`plans.${index}.end_date`] = "End date is required";
    } else {
      // Validate date format
      const endDateValid =
        /^\d{4}-\d{2}-\d{2}$/.test(plan.end_date) &&
        !isNaN(new Date(plan.end_date).getTime());
      if (!endDateValid) {
        newErrors[`plans.${index}.end_date`] = "Invalid date format";
      } else if (formData.value.end_date) {
        // Check if plan end date is within project date range
        const projectEnd = new Date(formData.value.end_date);
        const planEnd = new Date(plan.end_date);
        if (planEnd > projectEnd) {
          newErrors[`plans.${index}.end_date`] =
            "Cannot be after project end date";
        }
      }
    }

    // Compare dates only if both are valid
    if (
      plan.start_date &&
      plan.end_date &&
      !newErrors[`plans.${index}.start_date`] &&
      !newErrors[`plans.${index}.end_date`]
    ) {
      const startDate = new Date(plan.start_date);
      const endDate = new Date(plan.end_date);

      if (startDate >= endDate) {
        newErrors[`plans.${index}.end_date`] =
          "End date must be after start date";
      }
    }
  });

  // Check for overlapping allocations for the same team member
  const memberAllocations = {};
  formData.value.plans.forEach((plan, index) => {
    if (plan.memberId && !newErrors[`plans.${index}.memberId`]) {
      if (!memberAllocations[plan.memberId]) {
        memberAllocations[plan.memberId] = [];
      }

      if (
        plan.start_date &&
        plan.end_date &&
        !newErrors[`plans.${index}.start_date`] &&
        !newErrors[`plans.${index}.end_date`]
      ) {
        memberAllocations[plan.memberId].push({
          index,
          start: new Date(plan.start_date),
          end: new Date(plan.end_date),
          rate: parseFloat(plan.allocationRate) || 0,
        });
      }
    }
  });

  // Check for overlaps and total allocation exceeding 100%
  Object.values(memberAllocations).forEach((allocations) => {
    if (allocations.length > 1) {
      // Sort by start date
      allocations.sort((a, b) => a.start - b.start);

      // Check for overlaps and total allocation
      const dateRanges = [];
      for (let i = 0; i < allocations.length; i++) {
        const current = allocations[i];

        // Find all allocations that overlap with the current one
        const overlaps = allocations.filter((alloc, idx) => {
          if (idx === i) return false; // Skip self
          return (
            alloc.start <= current.end && alloc.end >= current.start // Date ranges overlap
          );
        });

        if (overlaps.length > 0) {
          // Calculate total allocation for each day in the overlap period
          const allOverlappingAllocations = [current, ...overlaps];

          // Find all unique dates in the range
          const allDates = new Set();
          allOverlappingAllocations.forEach((alloc) => {
            let currentDate = new Date(alloc.start);
            while (currentDate <= alloc.end) {
              allDates.add(currentDate.toISOString().split("T")[0]);
              currentDate.setDate(currentDate.getDate() + 1);
            }
          });

          // Check allocation for each date
          allDates.forEach((dateStr) => {
            const date = new Date(dateStr);
            let totalAllocation = 0;

            allOverlappingAllocations.forEach((alloc) => {
              if (date >= alloc.start && date <= alloc.end) {
                totalAllocation += alloc.rate;
              }
            });

            if (totalAllocation > 1) {
              // Over-allocation detected
              newErrors[`plans.${current.index}.allocationRate`] =
                "Total allocation exceeds 100% during this period";
              return; // Exit the forEach loop once we find an over-allocation
            }
          });
        }
      }
    }
  });

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// Navigation functions
const nextStep = () => {
  let isValid = false;

  // Clear previous errors
  errors.value = {};

  // For step 1, validation is now handled in the BasicInformationStep component
  if (currentStep.value === 1) {
    // The BasicInformationStep component will only emit the next event if validation passes
    isValid = true;
  } else if (isQuotationStep.value) {
    // Step 2: Quotation validation (only if user has permission)
    isValid = validateStep2();
  } else if (isPlanStep.value) {
    // Plan step validation
    isValid = validateStep3();
  }

  if (isValid && currentStep.value < totalSteps.value) {
    currentStep.value++;
    errors.value = {}; // Clear errors when moving to next step
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
  // Create plans based on quotations
  const newPlans = formData.value.quotations.map((quotation) => ({
    id: uuidv4(),
    memberId: "", // This will need to be filled in by the user
    position_id: quotation.position_id,
    // If quantity is greater than 1, we need to adjust the allocation rate
    // as allocation_rate should be between 0 and 1
    allocationRate: Math.min(1, parseFloat(quotation.quantity)),
    start_date: quotation.start_date,
    end_date: quotation.end_date,
  }));

  formData.value.plans = newPlans;
};

// Submit functions
const skipAndSubmit = async () => {
  // Clear previous errors
  errors.value = {};

  // Validate step 1
  if (!validateStep1()) {
    currentStep.value = 1;
    return;
  }

  // Only validate step 2 if user has CREATE_QUOTATION permission
  if (canCreateQuotation.value && !validateStep2()) {
    currentStep.value = 2;
    return;
  }

  await submitProject(true);
};

const submitProject = async (skipPlan = false) => {
  // Clear previous errors
  errors.value = {};

  // Always validate step 1
  if (!validateStep1()) {
    currentStep.value = 1;
    return;
  }

  // Only validate step 2 if user has CREATE_QUOTATION permission
  if (canCreateQuotation.value && !validateStep2()) {
    currentStep.value = 2;
    return;
  }

  // Validate step 3 if not skipping
  if (!skipPlan && !validateStep3()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // Sanitize and format data for submission according to API requirements
    const projectData = {
      name: formData.value.projectName.trim(),
      description: formData.value.description || "", // Add description field if needed
      start_date: formData.value.start_date,
      end_date: formData.value.end_date,

      // Format quotation data according to API requirements
      quotation: canCreateQuotation.value
        ? formData.value.quotations
            .filter((q) => q.position_id) // Only include quotations with a position
            .map((q) => ({
              position_id: q.position_id,
              quantity: parseFloat(q.quantity),
              start_date: q.start_date,
              end_date: q.end_date,
            }))
        : null, // Send null if user doesn't have permission

      // Format plan data according to API requirements
      plan: skipPlan
        ? []
        : formData.value.plans
            .filter((p) => p.memberId && p.position_id) // Only include plans with member and position
            .map((p) => ({
              user_id: Number(p.memberId), // Convert to number as API expects
              position_id: p.position_id,
              allocation_rate: parseFloat(p.allocationRate),
              start_date: p.start_date,
              end_date: p.end_date,
            })),
    };

    await createProject(projectData);

    // Show success message and redirect
    toast.success("Project created successfully");
    router.push("/projects");
  } catch (error) {
    toast.error(error.message || "Failed to create project. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

// Initialize default dates and propagate to quotations and plans
onMounted(() => {
  // We'll wait for the project dates to be set in the BasicInformationStep component
  // and then propagate them to quotations and plans when they're available

  // We'll set up a watcher to update quotation and plan dates when project dates change
  // Note: We don't set default dates anymore, let users fill them manually
  watch(
    () => [formData.value.start_date, formData.value.end_date],
    ([newStartDate, newEndDate]) => {
      // Watcher is kept for potential future use but doesn't set defaults
    },
    { immediate: true }
  );
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
  position: relative;
  z-index: 1; /* Lower z-index for timeline */
}

/* Ensure dropdowns appear above other elements */
:deep(.select-container) {
  position: relative;
  z-index: 50; /* Higher z-index for dropdowns */
}

:deep(.select-dropdown) {
  z-index: 50; /* Higher z-index for dropdown menus */
}

:deep(.datepicker-dropdown) {
  z-index: 50; /* Higher z-index for date picker dropdowns */
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
