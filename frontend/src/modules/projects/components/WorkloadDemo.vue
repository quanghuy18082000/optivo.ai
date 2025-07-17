<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Workload Data Transformation Demo
      </h1>

      <!-- API Response Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            1. API Response Format
          </h2>
          <p class="text-sm text-gray-600 mt-1">Raw data from backend API</p>
        </div>
        <div class="p-6">
          <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">{{
            JSON.stringify(mockApiData, null, 2)
          }}</pre>
        </div>
      </div>

      <!-- Transformed Data Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            2. Transformed Data for ProjectTable
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Data after transformation for display
          </p>
        </div>
        <div class="p-6">
          <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">{{
            JSON.stringify(transformedData, null, 2)
          }}</pre>
        </div>
      </div>

      <!-- Chart Data Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            3. Chart Data Format
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Data formatted for WorkloadGraph component
          </p>
        </div>
        <div class="p-6">
          <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">{{
            JSON.stringify(chartData, null, 2)
          }}</pre>
        </div>
      </div>

      <!-- Visual Demo Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            4. Visual Representation
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            How the data appears in WorkloadGraph
          </p>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 gap-6">
            <div
              v-for="member in transformedData[0]?.members || []"
              :key="member.id"
            >
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ member.name }} - {{ member.position }}
              </h3>
              <div class="bg-gray-50 p-4 rounded-lg">
                <WorkloadGraph :workload="member.workload" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- New Features -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mt-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            5. New Features & Improvements
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Latest enhancements to workload visualization
          </p>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-medium text-blue-900 mb-2">📊 Value Rounding:</h4>
              <ul class="text-sm text-blue-700 mt-2 space-y-1">
                <li>
                  • <strong>Plan & Actual:</strong> Rounded to 1 decimal place
                  (e.g., 0.3 → 0.3)
                </li>
                <li>
                  • <strong>Quotation:</strong> Kept more precise (2 decimal
                  places)
                </li>
                <li>
                  • <strong>Tooltip:</strong> Shows formatted values with proper
                  rounding
                </li>
              </ul>
            </div>

            <div class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-medium text-green-900 mb-2">
                📈 Smart Line Display:
              </h4>
              <ul class="text-sm text-green-700 mt-2 space-y-1">
                <li>• Lines only appear during actual date ranges</li>
                <li>• No more lines extending across entire year</li>
                <li>
                  • <code>connectNulls: false</code> prevents connecting gaps
                </li>
                <li>• Cleaner, more accurate visual representation</li>
              </ul>
            </div>

            <div class="bg-yellow-50 p-4 rounded-lg">
              <h4 class="font-medium text-yellow-900 mb-2">
                🎯 Calculation Logic:
              </h4>
              <div class="text-sm text-yellow-800 space-y-2">
                <div>
                  <strong>Quotation & Plan:</strong> Full allocation rate for
                  overlapping months
                  <br />
                  <code class="bg-yellow-100 px-1 rounded"
                    >June 10 - Sep 10, Rate: 0.5 → Jun: 0.5, Jul: 0.5, Aug: 0.5,
                    Sep: 0.5</code
                  >
                </div>
                <div>
                  <strong>Actual (Weekly):</strong> Proportional based on actual
                  days worked
                  <br />
                  <code class="bg-yellow-100 px-1 rounded"
                    >July 14-20, Rate: 0.5 → July: 0.5 × (7/31) = 0.11</code
                  >
                </div>
              </div>
            </div>

            <div class="bg-purple-50 p-4 rounded-lg">
              <h4 class="font-medium text-purple-900 mb-2">
                🔧 Technical Implementation:
              </h4>
              <ul class="text-sm text-purple-700 space-y-1">
                <li>• Null values for months without data</li>
                <li>• Enhanced tooltip formatting</li>
                <li>• Improved chart readability</li>
                <li>• Better user experience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import WorkloadGraph from "./WorkloadGraph.vue";
import {
  transformProjectsData,
  formatWorkloadForChart,
} from "../utils/workloadDataTransformer";

// Mock API data for demo
const mockApiData = [
  {
    project_id: 1,
    project_name: "Demo Project",
    workload_member_detail: [
      {
        member: {
          id: 1,
          user_name: "John Doe",
          position: {
            id: 1,
            name: "Backend Developer",
          },
        },
        plan: [
          {
            start_date: "2025-07-10",
            end_date: "2025-08-10",
            allocation_rate: 0.3,
          },
        ],
        quotation: [
          {
            start_date: "2025-06-10",
            end_date: "2025-09-10",
            allocation_rate: 0.5,
          },
        ],
        actual: [
          {
            start_date: "2025-07-14",
            end_date: "2025-07-20",
            allocation_rate: 0.5,
          },
          {
            start_date: "2025-07-21",
            end_date: "2025-07-27",
            allocation_rate: 0.5,
          },
          {
            start_date: "2025-07-28",
            end_date: "2025-08-03",
            allocation_rate: 0.5,
          },
        ],
      },
      {
        member: {
          id: 2,
          user_name: "Jane Smith",
          position: {
            id: 2,
            name: "UI/UX Designer",
          },
        },
        plan: [
          {
            start_date: "2025-06-15",
            end_date: "2025-07-15",
            allocation_rate: 0.8,
          },
        ],
        quotation: [
          {
            start_date: "2025-06-01",
            end_date: "2025-08-31",
            allocation_rate: 0.6,
          },
        ],
        actual: [
          {
            start_date: "2025-06-16",
            end_date: "2025-06-22",
            allocation_rate: 0.7,
          },
        ],
      },
    ],
  },
];

// Transform data
const transformedData = computed(() => {
  return transformProjectsData(mockApiData);
});

// Chart data for first member
const chartData = computed(() => {
  if (transformedData.value[0]?.members?.[0]?.workload) {
    return formatWorkloadForChart(transformedData.value[0].members[0].workload);
  }
  return [];
});
</script>

<style scoped>
pre {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 12px;
  line-height: 1.4;
  max-height: 400px;
  overflow-y: auto;
}
</style>
