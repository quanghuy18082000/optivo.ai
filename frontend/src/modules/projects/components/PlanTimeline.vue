<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      Timeline Visualization
    </h3>

    <!-- Month Headers -->
    <div class="flex justify-between text-xs text-gray-500 mb-4 px-2">
      <div v-for="month in months" :key="month" class="text-center">
        {{ month }}
      </div>
    </div>

    <!-- Timeline Bars -->
    <div class="space-y-3">
      <div v-for="(plan, index) in validPlans" :key="plan.id" class="relative">
        <!-- Member Label -->
        <div class="text-sm font-medium text-gray-700 mb-2">
          {{ getMemberName(plan.memberId) }} -
          {{ getPositionName(plan.position) }} ({{ plan.allocationRate }})
        </div>

        <!-- Timeline Bar -->
        <div class="relative h-6 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="absolute h-full bg-green-500 rounded-full transition-all duration-300"
            :style="getTimelineStyle(plan)"
          ></div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="validPlans.length === 0"
        class="text-center py-8 text-gray-500"
      >
        <svg
          class="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 01-2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <p>No plans to display</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  plans: {
    type: Array,
    default: () => [],
  },
  members: {
    type: Array,
    default: () => [],
  },
  positions: {
    type: Array,
    default: () => [],
  },
});

// Generate months for the timeline (current year)
const months = computed(() => {
  const currentYear = new Date().getFullYear();
  return [
    `Nov/${currentYear - 1}`,
    `Dec/${currentYear - 1}`,
    `Jan/${currentYear}`,
    `Feb/${currentYear}`,
    `Mar/${currentYear}`,
    `Apr/${currentYear}`,
    `May/${currentYear}`,
    `Jun/${currentYear}`,
    `Jul/${currentYear}`,
    `Aug/${currentYear}`,
    `Sep/${currentYear}`,
    `Oct/${currentYear}`,
  ];
});

// Filter out plans with valid dates
const validPlans = computed(() => {
  return props.plans.filter(
    (p) => p.startDate && p.endDate && p.memberId && p.position
  );
});

// Get member name from ID
const getMemberName = (memberId) => {
  const member = props.members.find((m) => m.id === memberId);
  return member ? member.name : "Unknown Member";
};

// Get position name from ID
const getPositionName = (positionId) => {
  // First try to find the position in the positions prop
  const position = props.positions.find((p) => p.value === positionId);
  if (position) {
    return position.label;
  }

  // If not found, check if we have a raw position object with id and name
  const rawPosition = props.positions.find(
    (p) => p.id && p.id.toString() === positionId
  );
  if (rawPosition) {
    return rawPosition.name;
  }

  return "Unknown Position";
};

// Calculate timeline bar position and width
const getTimelineStyle = (plan) => {
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);

  // Calculate the timeline range (12 months)
  const currentYear = new Date().getFullYear();
  const timelineStart = new Date(currentYear - 1, 10, 1); // Nov of previous year
  const timelineEnd = new Date(currentYear, 9, 31); // Oct of current year

  // Calculate positions as percentages
  const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
  const startOffset = Math.max(
    0,
    startDate.getTime() - timelineStart.getTime()
  );
  const duration =
    Math.min(endDate.getTime(), timelineEnd.getTime()) -
    Math.max(startDate.getTime(), timelineStart.getTime());

  const leftPercent = (startOffset / totalDuration) * 100;
  const widthPercent = (duration / totalDuration) * 100;

  return {
    left: `${leftPercent}%`,
    width: `${Math.max(widthPercent, 1)}%`,
  };
};
</script>
