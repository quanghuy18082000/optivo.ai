/**
 * Utility functions to transform workload data from API response
 * to format expected by ProjectTable and WorkloadGraph components
 */

import { format, getDaysInMonth } from "date-fns"

/**
 * Transform API response to ProjectTable format
 * @param {Array} apiData - Array of project data from API
 * @returns {Array} Transformed data for ProjectTable
 */
export function transformProjectsData(apiData) {
  if (!Array.isArray(apiData)) return []

  return apiData.map((project) => ({
    id: project.project_id,
    name: project.project_name,
    members: transformMembersData(project.workload_member_detail || []),
  }))
}

/**
 * Transform members data for a project
 * @param {Array} membersData - Array of member workload data
 * @returns {Array} Transformed members data
 */
function transformMembersData(membersData) {
  if (!Array.isArray(membersData)) return []

  return membersData.map((memberData) => ({
    id: memberData.member.id,
    name: memberData.member.user_name,
    position: memberData.member.position.name,
    workload: transformWorkloadDataForChart(memberData), // Use the new transformation
  }))
}

/**
 * Helper to convert date string to a numerical x-axis position (0-11.99...)
 * where 0 is Jan 1st and 11.99... is Dec 31st.
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {number} Numerical x-axis position
 */
function dateToChartX(dateString) {
  const date = new Date(dateString)
  const monthIndex = date.getMonth() // 0-11
  const dayOfMonth = date.getDate() // 1-31
  const daysInMonth = getDaysInMonth(date)
  // Position within the month, normalized to 0-1. Use (daysInMonth - 1) to avoid division by zero for 1-day months if dayOfMonth is 1.
  // For a single day month, positionInMonth would be 0.
  const positionInMonth = daysInMonth > 1 ? (dayOfMonth - 1) / (daysInMonth - 1) : 0
  return monthIndex + positionInMonth
}

/**
 * Transform workload data for WorkloadGraph component to create stepped lines and scatter points.
 * @param {Object} memberData - Member data containing plan, quotation, actual periods.
 * @returns {Object} Object containing line and scatter data for ECharts.
 */
export function transformWorkloadDataForChart(memberData) {
  const { plan = [], quotation = [], actual = [] } = memberData
  const currentYear = new Date().getFullYear() // Assuming current year for filtering

  const quotationLineData = []
  const quotationScatterData = []
  const planLineData = []
  const planScatterData = []
  const actualLineData = []
  const actualScatterData = []

  // Process Quotation data
  quotation.forEach((item) => {
    const startDate = new Date(item.start_date)
    const endDate = new Date(item.end_date)

    // Only include data for the current year
    if (startDate.getFullYear() === currentYear || endDate.getFullYear() === currentYear) {
      const startX = dateToChartX(item.start_date)
      const endX = dateToChartX(item.end_date)

      // Add points for the line. For 'step: end', the value holds until the endX.
      quotationLineData.push([startX, item.allocation_rate])
      quotationLineData.push([endX, item.allocation_rate])

      // Add scatter points for start/end with labels
      quotationScatterData.push({
        value: [startX, item.allocation_rate],
        label: { show: true, formatter: format(startDate, "dd/MMM") },
      })
      quotationScatterData.push({
        value: [endX, item.allocation_rate],
        label: { show: true, formatter: format(endDate, "dd/MMM") },
      })
    }
  })

  // Process Plan data
  plan.forEach((item) => {
    const startDate = new Date(item.start_date)
    const endDate = new Date(item.end_date)

    if (startDate.getFullYear() === currentYear || endDate.getFullYear() === currentYear) {
      const startX = dateToChartX(item.start_date)
      const endX = dateToChartX(item.end_date)

      planLineData.push([startX, item.allocation_rate])
      planLineData.push([endX, item.allocation_rate])

      planScatterData.push({
        value: [startX, item.allocation_rate],
        label: { show: true, formatter: format(startDate, "dd/MMM") },
      })
      planScatterData.push({
        value: [endX, item.allocation_rate],
        label: { show: true, formatter: format(endDate, "dd/MMM") },
      })
    }
  })

  // Process Actual data
  actual.forEach((item) => {
    const startDate = new Date(item.start_date)
    const endDate = new Date(item.end_date)

    if (startDate.getFullYear() === currentYear || endDate.getFullYear() === currentYear) {
      const startX = dateToChartX(item.start_date)
      const endX = dateToChartX(item.end_date)

      actualLineData.push([startX, item.allocation_rate])
      actualLineData.push([endX, item.allocation_rate])

      actualScatterData.push({
        value: [startX, item.allocation_rate],
        label: { show: true, formatter: format(startDate, "dd/MMM") },
      })
      actualScatterData.push({
        value: [endX, item.allocation_rate],
        label: { show: true, formatter: format(endDate, "dd/MMM") },
      })
    }
  })

  // Sort all line data points by x-axis to ensure correct line drawing for 'step' type
  quotationLineData.sort((a, b) => a[0] - b[0])
  planLineData.sort((a, b) => a[0] - b[0])
  actualLineData.sort((a, b) => a[0] - b[0])

  return {
    quotationLineData,
    quotationScatterData,
    planLineData,
    planScatterData,
    actualLineData,
    actualScatterData,
  }
}

/**
 * Get month name from month number
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
export function getMonthName(month) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return monthNames[month - 1] || ""
}

/**
 * Format workload data for WorkloadGraph component (original monthly aggregation)
 * @param {Array} workloadData - Monthly workload data
 * @returns {Array} Formatted data for chart
 */
export function formatWorkloadForChart(workloadData) {
  if (!Array.isArray(workloadData) || workloadData.length === 0) {
    return Array(12).fill({ quotation: 0, plan: 0, actual: 0 })
  }

  // Ensure we have exactly 12 months of data
  const chartData = Array(12)
    .fill(null)
    .map((_, index) => {
      const monthData = workloadData.find((item) => item.month === index + 1)
      return monthData || { quotation: 0, plan: 0, actual: 0 }
    })

  return chartData
}

// The following functions are no longer directly used by WorkloadGraph but kept for other components if needed.
function calculateMonthlyAllocations(startDate, endDate, allocationRate, isActualData = false) {
  if (!startDate || !endDate || !allocationRate) return []

  const start = new Date(startDate)
  const end = new Date(endDate)
  const currentYear = new Date().getFullYear()

  if (start.getFullYear() !== currentYear && end.getFullYear() !== currentYear) {
    return []
  }

  const monthlyAllocations = []

  const current = new Date(start)
  current.setDate(1)

  while (current <= end) {
    const month = current.getMonth() + 1
    const year = current.getFullYear()

    if (year === currentYear) {
      const monthStart = new Date(year, current.getMonth(), 1)
      const monthEnd = new Date(year, current.getMonth() + 1, 0)

      const overlapStart = new Date(Math.max(start.getTime(), monthStart.getTime()))
      const overlapEnd = new Date(Math.min(end.getTime(), monthEnd.getTime()))

      if (overlapStart <= overlapEnd) {
        let monthlyAllocation

        if (isActualData) {
          const daysInMonth = monthEnd.getDate()
          const overlapDays = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1
          const monthProportion = overlapDays / daysInMonth
          monthlyAllocation = allocationRate * monthProportion
        } else {
          monthlyAllocation = allocationRate
        }

        monthlyAllocations.push({
          month,
          allocation: monthlyAllocation,
        })
      }
    }

    current.setMonth(current.getMonth() + 1)
  }

  return monthlyAllocations
}

function transformWorkloadData(memberData) {
  const { plan = [], quotation = [], actual = [] } = memberData

  const monthlyData = Array(12)
    .fill(null)
    .map((_, index) => ({
      month: index + 1,
      quotation: 0,
      plan: 0,
      actual: 0,
    }))

  quotation.forEach((item) => {
    const monthlyAllocations = calculateMonthlyAllocations(item.start_date, item.end_date, item.allocation_rate, false)

    monthlyAllocations.forEach(({ month, allocation }) => {
      if (month >= 1 && month <= 12) {
        monthlyData[month - 1].quotation += allocation
      }
    })
  })

  plan.forEach((item) => {
    const monthlyAllocations = calculateMonthlyAllocations(item.start_date, item.end_date, item.allocation_rate, false)

    monthlyAllocations.forEach(({ month, allocation }) => {
      if (month >= 1 && month <= 12) {
        monthlyData[month - 1].plan += allocation
      }
    })
  })

  actual.forEach((item) => {
    const monthlyAllocations = calculateMonthlyAllocations(item.start_date, item.end_date, item.allocation_rate, true)

    monthlyAllocations.forEach(({ month, allocation }) => {
      if (month >= 1 && month <= 12) {
        monthlyData[month - 1].actual += allocation
      }
    })
  })

  monthlyData.forEach((month) => {
    month.plan = Math.round(month.plan * 10) / 10
    month.actual = Math.round(month.actual * 10) / 10
    month.quotation = Math.round(month.quotation * 100) / 100
  })

  return monthlyData
}

function transformActualToWeeklyData(actualData) {
  if (!Array.isArray(actualData)) return []

  return actualData.map((item, index) => {
    const startDate = new Date(item.start_date)
    const startOfYear = new Date(startDate.getFullYear(), 0, 1)
    const weekNumber = Math.ceil(((startDate - startOfYear) / (1000 * 60 * 60 * 24) + 1) / 7)

    const monthIndex = startDate.getMonth()
    const dayOfMonth = startDate.getDate()
    const daysInMonth = new Date(startDate.getFullYear(), monthIndex + 1, 0).getDate()
    const positionInMonth = (dayOfMonth - 1) / (daysInMonth - 1)

    return {
      id: `week-${index}`,
      weekNumber,
      monthIndex,
      positionInMonth,
      startDate: item.start_date,
      endDate: item.end_date,
      allocation: item.allocation_rate,
      dateRange: `${item.start_date} to ${item.end_date}`,
      label: `Week ${weekNumber}`,
    }
  })
}

export function transformWorkloadDataDualAxis(memberData) {
  const { plan = [], quotation = [], actual = [] } = memberData

  const monthlyData = transformWorkloadData(memberData)

  const weeklyActualData = transformActualToWeeklyData(actual)

  return {
    monthly: monthlyData,
    weeklyActual: weeklyActualData,
  }
}
