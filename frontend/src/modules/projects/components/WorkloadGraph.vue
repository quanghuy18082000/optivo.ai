<template>
  <div class="relative w-full">
    <!-- Main chart area -->
    <div ref="chartRef" class="w-full h-24"></div>

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
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// Register necessary ECharts components
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

const props = defineProps({
  workload: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const chartRef = ref(null);
let chartInstance = null;

// Months for x-axis
const months = [
  "Jan/25",
  "Feb/25",
  "Mar/25",
  "Apr/25",
  "May/25",
  "Jun/25",
  "Jul/25",
  "Aug/25",
  "Sep/25",
  "Oct/25",
  "Nov/25",
  "Dec/25",
];

// Prepare chart data
const chartData = computed(() => {
  if (!props.workload || props.workload.length === 0) {
    return {
      quotation: Array(12).fill(0),
      plan: Array(12).fill(0),
      actual: Array(12).fill(0),
    };
  }

  // If workload data is shorter than 12 months, pad with zeros
  const quotation = props.workload.map((item) => item.quotation);
  const plan = props.workload.map((item) => item.plan);
  const actual = props.workload.map((item) => item.actual);

  while (quotation.length < 12) quotation.push(0);
  while (plan.length < 12) plan.push(0);
  while (actual.length < 12) actual.push(0);

  return { quotation, plan, actual };
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
        let result = `<div style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">${params[0].name}</div>`;
        params.forEach((param) => {
          // Color square
          result += `<div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>
            <span style="flex: 1;">${param.seriesName}:</span>
            <span style="font-weight: 600; margin-left: 8px;">${param.value}</span>
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
      type: "category",
      data: months,
      axisLabel: {
        show: false, // Hide month labels since we're showing them separately
      },
      axisLine: {
        show: false, // Hide axis line for cleaner look
      },
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
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
        data: chartData.value.quotation,
        smooth: true,
        symbol: "emptyCircle",
        symbolSize: 8,
        showSymbol: false, // Only show symbols on hover
        emphasis: {
          scale: true,
          focus: "series",
          itemStyle: {
            shadowBlur: 5,
            shadowColor: "rgba(59, 130, 246, 0.5)",
          },
        },
        itemStyle: {
          color: "#3B82F6", // Blue
          borderWidth: 2,
        },
        lineStyle: {
          width: 4,
          shadowColor: "rgba(59, 130, 246, 0.2)",
          shadowBlur: 10,
          shadowOffsetY: 5,
          cap: "round",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59, 130, 246, 0.2)" },
              { offset: 1, color: "rgba(59, 130, 246, 0.02)" },
            ],
          },
        },
        z: 3,
      },
      {
        name: "Plan",
        type: "line",
        data: chartData.value.plan,
        smooth: true,
        symbol: "emptyCircle",
        symbolSize: 8,
        showSymbol: false,
        emphasis: {
          scale: true,
          focus: "series",
          itemStyle: {
            shadowBlur: 5,
            shadowColor: "rgba(16, 185, 129, 0.5)",
          },
        },
        itemStyle: {
          color: "#10B981", // Green
          borderWidth: 2,
        },
        lineStyle: {
          width: 4,
          shadowColor: "rgba(16, 185, 129, 0.2)",
          shadowBlur: 10,
          shadowOffsetY: 5,
          cap: "round",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.2)" },
              { offset: 1, color: "rgba(16, 185, 129, 0.02)" },
            ],
          },
        },
        z: 2,
      },
      {
        name: "Actual",
        type: "line",
        data: chartData.value.actual,
        smooth: true,
        symbol: "emptyCircle",
        symbolSize: 8,
        showSymbol: false,
        emphasis: {
          scale: true,
          focus: "series",
          itemStyle: {
            shadowBlur: 5,
            shadowColor: "rgba(239, 68, 68, 0.5)",
          },
        },
        itemStyle: {
          color: "#EF4444", // Red
          borderWidth: 2,
        },
        lineStyle: {
          width: 4,
          shadowColor: "rgba(239, 68, 68, 0.2)",
          shadowBlur: 10,
          shadowOffsetY: 5,
          cap: "round",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(239, 68, 68, 0.2)" },
              { offset: 1, color: "rgba(239, 68, 68, 0.02)" },
            ],
          },
        },
        z: 1,
      },
    ],
  };
};

// Initialize chart
const initChart = () => {
  if (chartRef.value) {
    // Use devicePixelRatio for better rendering on high-DPI screens
    chartInstance = echarts.init(chartRef.value, null, {
      renderer: "canvas",
      useDirtyRect: true, // Improves performance
      devicePixelRatio: window.devicePixelRatio,
    });

    // Apply options
    chartInstance.setOption(getChartOptions());

    // Add hover interaction
    chartInstance.on("mouseover", { seriesIndex: "all" }, function () {
      chartInstance.setOption({
        series: [
          { showSymbol: true },
          { showSymbol: true },
          { showSymbol: true },
        ],
      });
    });

    chartInstance.on("mouseout", { seriesIndex: "all" }, function () {
      chartInstance.setOption({
        series: [
          { showSymbol: false },
          { showSymbol: false },
          { showSymbol: false },
        ],
      });
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
            { data: chartData.value.quotation },
            { data: chartData.value.plan },
            { data: chartData.value.actual },
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
.w-full.h-full {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Add a subtle hover effect */
.w-full.h-full:hover {
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
