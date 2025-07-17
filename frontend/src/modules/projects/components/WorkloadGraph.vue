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
import { LineChart, ScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { formatWorkloadForChart } from "../utils/workloadDataTransformer";

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

// Prepare chart data for dual-axis display
const chartData = computed(() => {
  const monthlyData = formatWorkloadForChart(props.workload.monthly || []);
  const weeklyActualData = props.workload.weeklyActual || [];

  // Monthly data for left axis (Plan & Quotation)
  const quotationData = monthlyData.map((item) => {
    return item.quotation > 0 ? item.quotation : null;
  });

  const planData = monthlyData.map((item) => {
    return item.plan > 0 ? item.plan : null;
  });

  // Weekly actual data for right axis
  const weeklyData = weeklyActualData.map((week) => {
    // Calculate x-axis position: month index + position within month
    const xPosition = week.monthIndex + week.positionInMonth;
    return [xPosition, week.allocation];
  });

  return {
    quotation: quotationData,
    plan: planData,
    weeklyActual: weeklyData,
    weeklyActualRaw: weeklyActualData, // Keep raw data for tooltips
  };
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
          // Skip null values in tooltip
          if (param.value === null || param.value === undefined) return;

          // Format values based on series type
          let displayValue = param.value;
          if (param.seriesName === "Plan" || param.seriesName === "Actual") {
            displayValue = Math.round(param.value * 10) / 10; // Round to 1 decimal
          } else {
            displayValue = Math.round(param.value * 100) / 100; // Keep quotation precise
          }

          // Color square
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
    yAxis: [
      {
        // Left axis for Plan & Quotation (monthly data)
        type: "value",
        name: "Monthly Allocation",
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
      {
        // Right axis for Weekly Actual
        type: "value",
        name: "Weekly Allocation",
        nameLocation: "middle",
        nameGap: 40,
        nameTextStyle: {
          fontSize: 10,
          color: "#F59E0B",
        },
        min: 0,
        max: 1,
        interval: 0.25,
        position: "right",
        axisLabel: {
          fontSize: 9,
          color: "#F59E0B",
          formatter: "{value}",
        },
        splitLine: {
          show: false, // Hide right axis grid lines to avoid clutter
        },
      },
    ],
    series: [
      {
        name: "Quotation",
        type: "line",
        yAxisIndex: 0, // Use left axis
        data: chartData.value.quotation,
        smooth: true,
        symbol: "emptyCircle",
        symbolSize: 8,
        showSymbol: false, // Only show symbols on hover
        connectNulls: false, // Don't connect null values
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
        yAxisIndex: 0, // Use left axis
        data: chartData.value.plan,
        smooth: true,
        symbol: "emptyCircle",
        symbolSize: 8,
        showSymbol: false,
        connectNulls: false, // Don't connect null values
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
        name: "Weekly Actual",
        type: "scatter",
        yAxisIndex: 1, // Use right axis
        data: chartData.value.weeklyActual,
        symbol: "diamond",
        symbolSize: 14,
        itemStyle: {
          color: "#F59E0B", // Amber color
          borderColor: "#FFFFFF",
          borderWidth: 2,
          shadowBlur: 4,
          shadowColor: "rgba(245, 158, 11, 0.3)",
        },
        emphasis: {
          scale: 1.3,
          itemStyle: {
            shadowBlur: 8,
            shadowColor: "rgba(245, 158, 11, 0.6)",
          },
        },
        tooltip: {
          formatter: function (params) {
            const weekData = chartData.value.weeklyActualRaw[params.dataIndex];
            if (!weekData) return "";
            return `
              <div style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">Weekly Actual</div>
              <div style="margin: 4px 0;">
                <span style="color: #6b7280;">Period:</span> 
                <span style="font-weight: 600; margin-left: 8px;">${weekData.dateRange}</span>
              </div>
              <div style="margin: 4px 0;">
                <span style="color: #6b7280;">Allocation:</span> 
                <span style="font-weight: 600; margin-left: 8px;">${weekData.allocation}</span>
              </div>
            `;
          },
        },
        z: 4,
      },
      // Weekly Actual Data as scatter points
      ...(chartData.value.weeklyActual.length > 0
        ? [
            {
              name: "Weekly Actual",
              type: "scatter",
              data: chartData.value.weeklyActual.map((week) => [
                week.monthPosition, // x-axis position based on month + day fraction
                week.allocation, // y-axis value
              ]),
              symbol: "diamond",
              symbolSize: 12,
              itemStyle: {
                color: "#F59E0B", // Amber color to distinguish from monthly actual
                borderColor: "#FFFFFF",
                borderWidth: 2,
                shadowBlur: 4,
                shadowColor: "rgba(245, 158, 11, 0.3)",
              },
              emphasis: {
                scale: 1.5,
                itemStyle: {
                  shadowBlur: 8,
                  shadowColor: "rgba(245, 158, 11, 0.6)",
                },
              },
              tooltip: {
                formatter: function (params) {
                  const weekData =
                    chartData.value.weeklyActual[params.dataIndex];
                  return `
              <div style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">Weekly Actual</div>
              <div style="margin: 4px 0;">
                <span style="color: #6b7280;">Period:</span> 
                <span style="font-weight: 600; margin-left: 8px;">${weekData.dateRange}</span>
              </div>
              <div style="margin: 4px 0;">
                <span style="color: #6b7280;">Allocation:</span> 
                <span style="font-weight: 600; margin-left: 8px;">${weekData.allocation}</span>
              </div>
            `;
                },
              },
              z: 4, // Highest z-index to appear on top
            },
          ]
        : []),
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
