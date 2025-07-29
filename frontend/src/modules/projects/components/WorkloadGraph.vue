<template>
  <div class="relative w-full">
    <!-- Chart container with sticky Y-axis -->
    <div class="relative">
      <!-- Sticky Y-axis labels -->
      <div
        class="absolute left-0 top-0 z-10 bg-transparent border-r border-gray-200"
        style="width: 50px; height: 192px"
      >
        <div class="relative h-full">
          <!-- Y-axis labels positioned to match chart grid -->
          <div
            class="absolute text-xs text-gray-600 font-medium"
            style="bottom: 0px; right: 8px"
          >
            0
          </div>
          <div
            class="absolute text-xs text-gray-600 font-medium"
            style="bottom: 22%; right: 8px"
          >
            0.5
          </div>
          <div
            class="absolute text-xs text-gray-600 font-medium"
            style="bottom: 45%; right: 8px"
          >
            1.0
          </div>
          <div
            class="absolute text-xs text-gray-600 font-medium"
            style="bottom: 67%; right: 8px"
          >
            1.5
          </div>
          <div
            class="absolute text-xs text-gray-600 font-medium"
            style="top: 2px; right: 8px"
          >
            2.0
          </div>

          <!-- Y-axis title -->
        </div>
      </div>

      <!-- Main chart area with horizontal scroll -->
      <div
        ref="scrollContainer"
        class="w-full overflow-x-auto"
        @scroll="onScroll"
        style="margin-left: 50px"
      >
        <div
          ref="chartRef"
          :style="{
            width: chartWidth + 'px',
            height: '192px',
            minWidth: chartWidth + 'px',
          }"
        ></div>
      </div>
    </div>

    <!-- Dynamic month labels below the chart -->
    <div
      ref="labelsContainer"
      class="w-full overflow-x-auto"
      style="overflow-x: hidden; margin-left: 50px"
    >
      <div
        :style="{ width: chartWidth + 'px', minWidth: chartWidth + 'px' }"
        class="flex justify-between pr-2 pl-12 text-xs text-gray-500 mt-1"
      >
        <div
          v-for="label in monthLabels"
          :key="label.key"
          class="flex-shrink-0"
        >
          {{ label.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import * as echarts from "echarts/core";
import { LineChart, ScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { format, getDaysInMonth } from "date-fns"; // Import format and getDaysInMonth

// Register necessary ECharts components
echarts.use([
  LineChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

const props = defineProps({
  workload: {
    type: Object,
    required: true,
    default: () => ({ monthly: [], weeklyActual: [] }),
  },
  project: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const emit = defineEmits(["actualLineClick"]);

const chartRef = ref(null);
const scrollContainer = ref(null);
const labelsContainer = ref(null);
let chartInstance = null;

// Use the already transformed workload data
const chartData = computed(() => {
  return props.workload;
});

// Calculate the widest date range from both workload and project data
const getDateRange = () => {
  const dates = [];

  // Add workload date range if available
  if (chartData.value?.dateRange?.startDate) {
    dates.push(new Date(chartData.value.dateRange.startDate));
  }
  if (chartData.value?.dateRange?.endDate) {
    dates.push(new Date(chartData.value.dateRange.endDate));
  }

  // Add project dates if available (from props)
  if (props.project?.start_date) {
    dates.push(new Date(props.project.start_date));
  }
  if (props.project?.end_date) {
    dates.push(new Date(props.project.end_date));
  }

  // Add project dates from workload data (if available)
  if (chartData.value?.projectData?.start_date) {
    dates.push(new Date(chartData.value.projectData.start_date));
  }
  if (chartData.value?.projectData?.end_date) {
    dates.push(new Date(chartData.value.projectData.end_date));
  }

  // Add dates from raw workload data (quotation, plan, actual)
  if (chartData.value?.rawData) {
    const { quotation = [], plan = [], actual = [] } = chartData.value.rawData;

    // Collect all start_date and end_date from quotation
    quotation.forEach((item) => {
      if (item.start_date) dates.push(new Date(item.start_date));
      if (item.end_date) dates.push(new Date(item.end_date));
    });

    // Collect all start_date and end_date from plan
    plan.forEach((item) => {
      if (item.start_date) dates.push(new Date(item.start_date));
      if (item.end_date) dates.push(new Date(item.end_date));
    });

    // Collect all start_date and end_date from actual
    actual.forEach((item) => {
      if (item.start_date) dates.push(new Date(item.start_date));
      if (item.end_date) dates.push(new Date(item.end_date));
    });
  }

  if (dates.length === 0) {
    // Fallback to current year if no dates available
    const now = new Date();
    return {
      startDate: new Date(now.getFullYear(), 0, 1), // January 1st
      endDate: new Date(now.getFullYear(), 11, 31), // December 31st
    };
  }

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  // Add some padding to ensure all data is visible
  // Extend the range by 1 month on each side
  const startDate = new Date(minDate);
  startDate.setMonth(startDate.getMonth() - 1);

  const endDate = new Date(maxDate);
  endDate.setMonth(endDate.getMonth() + 1);

  return {
    startDate,
    endDate,
  };
};

// Calculate chart dimensions and labels based on date range
const chartWidth = computed(() => {
  const { startDate, endDate } = getDateRange();

  // Calculate total months
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  const totalMonths = yearDiff * 12 + monthDiff + 1;

  // Increased to 180px per month for better visibility and ensure all data is visible
  // Minimum 1400px to ensure adequate space
  return Math.max(totalMonths * 180, 1400);
});

const monthLabels = computed(() => {
  // Use reference date from workload data to match X-axis calculations
  let startDate, endDate;

  if (
    chartData.value?.dateRange?.referenceDate &&
    chartData.value?.dateRange?.endDate
  ) {
    startDate = new Date(chartData.value.dateRange.referenceDate);
    endDate = new Date(chartData.value.dateRange.endDate);
  } else {
    const dateRange = getDateRange();
    startDate = dateRange.startDate;
    endDate = dateRange.endDate;
  }

  const labels = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current <= endDate) {
    labels.push({
      key: `${current.getFullYear()}-${current.getMonth()}`,
      text: format(current, "MMM/yy"),
    });
    current.setMonth(current.getMonth() + 1);
  }

  return labels;
});

// Sync scroll between chart and labels
const onScroll = () => {
  if (scrollContainer.value && labelsContainer.value) {
    labelsContainer.value.scrollLeft = scrollContainer.value.scrollLeft;
  }
};

// Handle click on Actual line
const handleActualLineClick = (params) => {
  if (!chartData.value?.actualLineData) {
    return;
  }

  const xValue = params.value[0]; // X-axis value
  // Use reference date from workload data to match X-axis calculations
  const referenceDate = chartData.value?.dateRange?.referenceDate
    ? new Date(chartData.value.dateRange.referenceDate)
    : getDateRange().startDate;

  // Calculate the start date of the clicked week
  const monthsFromReference = Math.floor(xValue);
  const dayFraction = xValue - monthsFromReference;

  const targetDate = new Date(referenceDate);
  targetDate.setMonth(targetDate.getMonth() + monthsFromReference);

  const daysInMonth = getDaysInMonth(targetDate);
  const dayOfMonth = Math.round(dayFraction * (daysInMonth - 1)) + 1;
  targetDate.setDate(dayOfMonth);

  // For actual data, each point represents a week
  // Calculate week start (Monday) and end (Sunday)
  const dayOfWeek = targetDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, Monday = 1

  const weekStart = new Date(targetDate);
  weekStart.setDate(targetDate.getDate() + mondayOffset);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // Format dates for API (YYYY-MM-DD)
  const createdAfter = format(weekStart, "yyyy-MM-dd");
  const createdBefore = format(weekEnd, "yyyy-MM-dd");

  // Emit event with date range
  emit("actualLineClick", {
    createdAfter,
    createdBefore,
    weekStart,
    weekEnd,
  });
};

// Calculate max value for xAxis
const getXAxisMax = () => {
  // Use the same reference date as the workload data
  if (
    chartData.value?.dateRange?.referenceDate &&
    chartData.value?.dateRange?.endDate
  ) {
    const referenceDate = new Date(chartData.value.dateRange.referenceDate);
    const endDate = new Date(chartData.value.dateRange.endDate);

    const yearDiff = endDate.getFullYear() - referenceDate.getFullYear();
    const monthDiff = endDate.getMonth() - referenceDate.getMonth();
    return yearDiff * 12 + monthDiff + 1;
  }

  // Fallback to getDateRange if workload data doesn't have reference date
  const { startDate, endDate } = getDateRange();
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  return yearDiff * 12 + monthDiff + 1;
};

// Chart options
const getChartOptions = () => {
  return {
    animation: true,
    animationDuration: 500,
    grid: {
      top: 10,
      right: 30, // Increased right margin to prevent data cutoff
      bottom: 5,
      left: 10, // Reduced left margin since we have external sticky yAxis
      containLabel: false, // Don't contain labels since we handle them externally
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      textStyle: {
        color: "#374151",
        fontSize: 12,
      },
      padding: [8, 10],
      position: function (point, params, dom, rect, size) {
        // Fixed positioning to prevent tooltip from being cut off
        return {
          top: 5, // Always position at top
          left: Math.min(
            point[0],
            window.innerWidth - size.contentSize[0] - 20
          ), // Prevent overflow to the right
        };
      },
      confine: true, // Confine tooltip to chart area
      formatter: function (params) {
        // Filter out scatter series from the main tooltip display
        const lineParams = params.filter(
          (param) => param.seriesType === "line"
        );

        if (lineParams.length === 0) return ""; // If only scatter points are hovered, return empty

        // Get the x-axis value from the first line parameter
        const xValue = lineParams[0].value[0];

        // Calculate date based on reference date and x-axis value
        let formattedDate = "N/A";
        try {
          // Use reference date from workload data to match X-axis calculations
          const referenceDate = chartData.value?.dateRange?.referenceDate
            ? new Date(chartData.value.dateRange.referenceDate)
            : getDateRange().startDate;

          const monthsFromReference = Math.floor(xValue);
          const dayFraction = xValue - monthsFromReference;

          const targetDate = new Date(referenceDate);
          targetDate.setMonth(targetDate.getMonth() + monthsFromReference);

          const daysInMonth = getDaysInMonth(targetDate);
          const dayOfMonth = Math.round(dayFraction * (daysInMonth - 1)) + 1;
          targetDate.setDate(dayOfMonth);

          formattedDate = format(targetDate, "dd/MMM/yy");
        } catch (error) {
          console.warn("Error calculating date for tooltip:", error);
        }

        let result = `<div style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">${formattedDate}</div>`;
        lineParams.forEach((param) => {
          let displayValue = param.value[1]; // For line series, value is [x, y]
          displayValue = Math.round(displayValue * 100) / 100; // Keep precision

          result += `<div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>
            <span style="flex: 1;">${param.seriesName}:</span>
            <span style="font-weight: 600; margin-left: 8px;">${displayValue}</span>
          </div>`;
        });
        return result;
      },
      axisPointer: {
        type: "line",
        lineStyle: {
          color: "#9ca3af",
          width: 1,
          type: "dashed",
        },
      },
    },
    xAxis: {
      type: "value", // Change to value type for precise date positioning
      min: 0, // Start from reference date
      max: getXAxisMax(),
      interval: 1, // Major ticks at each month boundary
      axisLabel: {
        show: false, // Hide ECharts labels, use custom ones below
      },
      axisLine: {
        show: false, // Hide axis line
      },
      axisTick: {
        show: false, // Hide axis ticks
      },
      splitLine: {
        show: true, // Show vertical grid lines for months
        lineStyle: {
          color: "#e5e7eb",
          type: "solid", // Solid lines for month boundaries
          width: 1,
        },
      },
    },
    yAxis: {
      // Single Y-axis for all data
      type: "value",
      min: 0,
      max: 2,
      interval: 0.5,
      axisLabel: {
        show: false, // Hide ECharts Y-axis labels since we have custom sticky ones
      },
      axisLine: {
        show: false, // Hide Y-axis line
      },
      axisTick: {
        show: false, // Hide Y-axis ticks
      },
      splitLine: {
        show: true, // Keep horizontal grid lines
        lineStyle: {
          color: "#e5e7eb",
          type: "dashed",
          width: 1,
        },
      },
    },
    series: [
      {
        name: "Quotation",
        type: "line",
        step: "end", // Key for stepped line
        data: chartData.value.quotationLineData,
        smooth: false, // Not smooth
        symbol: "none", // Hide symbols on line
        lineStyle: {
          width: 4,
          color: "#3B82F6", // Blue
        },
        z: 3, // Layering
      },
      {
        name: "Plan",
        type: "line",
        step: "end", // Key for stepped line
        data: chartData.value.planLineData,
        smooth: false,
        symbol: "none",
        lineStyle: {
          width: 4,
          color: "#10B981", // Green
        },
        z: 2, // Layering
      },
      {
        name: "Actual",
        type: "line",
        step: "end", // Key for stepped line
        data: chartData.value.actualLineData,
        smooth: false,
        symbol: "none",
        lineStyle: {
          width: 4,
          color: "#EF4444", // Red
        },
        z: 1, // Layering
      },
      // Scatter series for Quotation labels
      {
        name: "Quotation Points",
        type: "scatter",
        data: chartData.value.quotationScatterData,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: "#3B82F6",
          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
        label: {
          show: false, // Hide labels to prevent overlap
          position: "top",
          formatter: function (params) {
            return params.data.label.formatter; // Use the formatter from the data item
          },
          color: "#374151",
          fontSize: 10,
          fontWeight: "bold",
          offset: [0, -10], // Adjust label position
        },
        tooltip: {
          show: false, // Hide tooltip for scatter points to avoid duplication with line tooltips
        },
        z: 4, // On top
      },
      // Scatter series for Plan labels
      {
        name: "Plan Points",
        type: "scatter",
        data: chartData.value.planScatterData,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: "#10B981",
          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
        label: {
          show: false, // Hide labels to prevent overlap
          position: "top",

          formatter: function (params) {
            return params.data.label.formatter;
          },
          color: "#374151",
          fontSize: 10,
          fontWeight: "bold",
          offset: [0, -10],
        },
        tooltip: {
          show: false,
        },
        z: 4,
      },
      // Scatter series for Actual labels
      {
        name: "Actual Points",
        type: "scatter",
        data: chartData.value.actualScatterData,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: "#EF4444",
          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
        label: {
          show: false, // Hide labels to prevent overlap
          position: "top",
          formatter: function (params) {
            return params.data.label.formatter;
          },
          color: "#374151",
          fontSize: 10,
          fontWeight: "bold",
          offset: [0, -10],
        },
        tooltip: {
          show: false,
        },
        z: 4,
      },
    ],
  };
};

// Initialize chart
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value, null, {
      renderer: "canvas",
      useDirtyRect: true,
      devicePixelRatio: window.devicePixelRatio,
    });

    // Apply options
    chartInstance.setOption(getChartOptions());

    // Add hover interaction to show/hide symbols on lines (if desired, currently symbols are 'none' for lines)
    // This part can be removed if symbols are always hidden on lines.
    chartInstance.on("mouseover", { seriesIndex: "all" }, function () {
      // No change needed if symbols are 'none' for lines and only scatter points have symbols
    });

    chartInstance.on("mouseout", { seriesIndex: "all" }, function () {
      // No change needed
    });

    // Add click handler for Actual line
    chartInstance.on("click", function (params) {
      // Only handle clicks on the Actual line series
      if (
        params.seriesName === "Actual Points" &&
        params.seriesType === "scatter"
      ) {
        handleActualLineClick(params);
      }
    });
  }
};

// Update chart when data changes
watch(
  () => props.workload,
  () => {
    if (chartInstance) {
      chartInstance.setOption(
        {
          series: [
            { data: chartData.value.quotationLineData },
            { data: chartData.value.planLineData },
            { data: chartData.value.actualLineData },
            { data: chartData.value.quotationScatterData },
            { data: chartData.value.planScatterData },
            { data: chartData.value.actualScatterData },
          ],
        },
        { notMerge: false }
      );
    }
  },
  { deep: true }
);

// Watch for chartWidth changes and resize chart accordingly
watch(chartWidth, () => {
  if (chartInstance) {
    setTimeout(() => {
      chartInstance.resize();
    }, 0);
  }
});

// Handle window resize with debounce for better performance
let resizeTimeout = null;
const handleResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    if (chartInstance) {
      chartInstance.resize();
    }
  }, 100);
};

// Handle container visibility changes
const handleVisibilityChange = () => {
  if (chartInstance && chartRef.value) {
    chartInstance.resize();
  }
};

onMounted(() => {
  // Wait for DOM to be ready
  setTimeout(() => {
    initChart();
  }, 0);

  window.addEventListener("resize", handleResize);

  // Handle parent container visibility changes (like tab switching)
  const resizeObserver = new ResizeObserver(handleVisibilityChange);
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value.parentElement || chartRef.value);
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
/* Ensure the chart container takes full height */
.relative {
  position: relative;
}

/* Add a subtle shadow to the chart container for depth */
.overflow-x-auto > div {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  transition: all 0.3s ease;
}

/* Add a subtle hover effect */
.overflow-x-auto > div:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

/* Custom scrollbar styling */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Ensure the chart is visible in all browsers */
:deep(.echarts) {
  width: 100% !important;
  height: 100% !important;
}

/* Improve tooltip appearance */
:deep(.echarts-tooltip) {
  border-radius: 4px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  z-index: 100 !important; /* Ensure tooltip is above other elements */
  pointer-events: none; /* Allow clicking through tooltip */
}

/* Month labels styling */
.flex.justify-between {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 2px;
}

.flex-shrink-0 {
  min-width: 120px;
  text-align: center;
  font-weight: 500;
}

/* Ensure labels container doesn't show scrollbar */
div[style*="overflow-x: hidden"] {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

div[style*="overflow-x: hidden"]::-webkit-scrollbar {
  display: none;
}

/* Sticky Y-axis styling */
.sticky-yaxis {
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
}

/* Ensure sticky yAxis stays on top */
.z-10 {
  z-index: 10;
}

/* Smooth transition for sticky elements */
.sticky-yaxis div {
  transition: all 0.2s ease;
}

/* Better alignment for rotated text */
.transform.-rotate-90 {
  transform-origin: center;
}
</style>
