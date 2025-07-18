<template>
  <div class="relative w-full">
    {{ chartData }}
    <!-- Main chart area -->
    <div ref="chartRef" class="w-full h-48"></div>
    <!-- Increased height to h-48 -->

    <!-- Month labels below the chart -->
    <div class="flex justify-between pr-2 pl-12 text-xs text-gray-500 mt-1">
      <div>Jan</div>
      <div>Feb</div>
      <div>Mar</div>
      <div>Apr</div>
      <div>May</div>
      <div>Jun</div>
      <div>Jul</div>
      <div>Aug</div>
      <div>Sep</div>
      <div>Oct</div>
      <div>Nov</div>
      <div>Dec</div>
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
import { transformWorkloadDataForChart } from "../utils/workloadDataTransformer"; // Import the new transformer

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
});

const chartRef = ref(null);
let chartInstance = null;

// Prepare chart data using the new transformation
const chartData = computed(() => {
  return transformWorkloadDataForChart(props.workload);
});

// Chart options
const getChartOptions = () => {
  return {
    animation: true,
    animationDuration: 500,
    grid: {
      top: 10,
      right: 15,
      bottom: 5,
      left: 30,
      containLabel: true,
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
        const monthIndex = Math.floor(xValue);
        const dayFraction = xValue - monthIndex;
        const currentYear = new Date().getFullYear();
        const daysInMonth = getDaysInMonth(new Date(currentYear, monthIndex));
        const dayOfMonth = Math.round(dayFraction * (daysInMonth - 1)) + 1;
        const date = new Date(currentYear, monthIndex, dayOfMonth);
        const formattedDate = format(date, "dd/MMM/yy");

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
      min: 0, // Corresponds to January
      max: 12, // Corresponds to end of December
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
      name: "Allocation Rate",
      nameLocation: "middle",
      nameGap: 40,
      nameTextStyle: {
        fontSize: 10,
        color: "#6b7280",
      },
      min: 0,
      max: 2,
      interval: 0.5,
      axisLabel: {
        fontSize: 9,
        color: "#6b7280",
        formatter: "{value}",
      },
      splitLine: {
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
          show: true,
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
          show: false, // Hide tooltip for scatter points as labels are shown
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
          show: true,
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
          show: true,
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
.w-full.h-48 {
  /* Updated height class */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Add a subtle hover effect */
.w-full.h-48:hover {
  /* Updated height class */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
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
</style>
