/**
 * Utility functions to transform workload data from API response
 * to format expected by ProjectTable and WorkloadGraph components
 */

/**
 * Transform API response to ProjectTable format
 * @param {Array} apiData - Array of project data from API
 * @returns {Array} Transformed data for ProjectTable
 */
export function transformProjectsData(apiData) {
  if (!Array.isArray(apiData)) return [];

  return apiData.map(project => ({
    id: project.project_id,
    name: project.project_name,
    members: transformMembersData(project.workload_member_detail || [])
  }));
}

/**
 * Transform members data for a project
 * @param {Array} membersData - Array of member workload data
 * @returns {Array} Transformed members data
 */
function transformMembersData(membersData) {
  if (!Array.isArray(membersData)) return [];

  return membersData.map(memberData => ({
    id: memberData.member.id,
    name: memberData.member.user_name,
    position: memberData.member.position.name,
    workload: transformWorkloadDataDualAxis(memberData)
  }));
}

/**
 * Transform workload data for WorkloadGraph
 * @param {Object} memberData - Member data containing plan, quotation, actual
 * @returns {Array} Array of 12 months workload data
 */
function transformWorkloadData(memberData) {
  const { plan = [], quotation = [], actual = [] } = memberData;
  
  // Initialize 12 months with zero values
  const monthlyData = Array(12).fill(null).map((_, index) => ({
    month: index + 1,
    quotation: 0,
    plan: 0,
    actual: 0
  }));

  // Process quotation data
  quotation.forEach(item => {
    const monthlyAllocations = calculateMonthlyAllocations(
      item.start_date,
      item.end_date,
      item.allocation_rate,
      false // quotation shows full rate
    );
    
    monthlyAllocations.forEach(({ month, allocation }) => {
      if (month >= 1 && month <= 12) {
        monthlyData[month - 1].quotation += allocation;
      }
    });
  });

  // Process plan data
  plan.forEach(item => {
    const monthlyAllocations = calculateMonthlyAllocations(
      item.start_date,
      item.end_date,
      item.allocation_rate,
      false // plan shows full rate
    );
    
    monthlyAllocations.forEach(({ month, allocation }) => {
      if (month >= 1 && month <= 12) {
        monthlyData[month - 1].plan += allocation;
      }
    });
  });

  // Process actual data (weekly data converted to monthly)
  actual.forEach(item => {
    const monthlyAllocations = calculateMonthlyAllocations(
      item.start_date,
      item.end_date,
      item.allocation_rate,
      true // actual uses proportional calculation
    );
    
    monthlyAllocations.forEach(({ month, allocation }) => {
      if (month >= 1 && month <= 12) {
        monthlyData[month - 1].actual += allocation;
      }
    });
  });

  // Round plan and actual values to nearest integer (.0)
  monthlyData.forEach(month => {
    month.plan = Math.round(month.plan * 10) / 10; // Round to 1 decimal place
    month.actual = Math.round(month.actual * 10) / 10; // Round to 1 decimal place
    month.quotation = Math.round(month.quotation * 100) / 100; // Keep quotation more precise
  });

  return monthlyData;
}

/**
 * Transform workload data for dual-axis chart display
 * @param {Object} memberData - Member data containing plan, quotation, actual
 * @returns {Object} Object containing monthly data and weekly actual data
 */
export function transformWorkloadDataDualAxis(memberData) {
  const { plan = [], quotation = [], actual = [] } = memberData;
  
  // Get monthly data for Plan and Quotation (left axis)
  const monthlyData = transformWorkloadData(memberData);
  
  // Transform actual data to weekly format (right axis)
  const weeklyActualData = transformActualToWeeklyData(actual);
  
  return {
    monthly: monthlyData,
    weeklyActual: weeklyActualData
  };
}

/**
 * Transform actual data to weekly format for right axis
 * @param {Array} actualData - Array of actual work periods
 * @returns {Array} Array of weekly data points
 */
function transformActualToWeeklyData(actualData) {
  if (!Array.isArray(actualData)) return [];
  
  return actualData.map((item, index) => {
    const startDate = new Date(item.start_date);
    const endDate = new Date(item.end_date);
    
    // Calculate week number in year
    const startOfYear = new Date(startDate.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((startDate - startOfYear) / (1000 * 60 * 60 * 24) + 1) / 7);
    
    // Calculate position within month for x-axis
    const monthIndex = startDate.getMonth(); // 0-11
    const dayOfMonth = startDate.getDate();
    const daysInMonth = new Date(startDate.getFullYear(), monthIndex + 1, 0).getDate();
    const positionInMonth = (dayOfMonth - 1) / (daysInMonth - 1); // 0-1
    
    return {
      id: `week-${index}`,
      weekNumber,
      monthIndex, // 0-11 for positioning
      positionInMonth, // 0-1 for fine positioning within month
      startDate: item.start_date,
      endDate: item.end_date,
      allocation: item.allocation_rate,
      dateRange: `${item.start_date} to ${item.end_date}`,
      label: `Week ${weekNumber}`
    };
  });
}

/**
 * Calculate monthly allocations from date range and allocation rate
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {number} allocationRate - Allocation rate (0-1)
 * @param {boolean} isActualData - Whether this is actual data (for proportional calculation)
 * @returns {Array} Array of monthly allocations
 */
function calculateMonthlyAllocations(startDate, endDate, allocationRate, isActualData = false) {
  if (!startDate || !endDate || !allocationRate) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const currentYear = new Date().getFullYear();
  
  // Only process dates for current year (2025)
  if (start.getFullYear() !== currentYear && end.getFullYear() !== currentYear) {
    return [];
  }

  const monthlyAllocations = [];
  
  // Iterate through each month in the date range
  const current = new Date(start);
  current.setDate(1); // Start from first day of month
  
  while (current <= end) {
    const month = current.getMonth() + 1; // 1-12
    const year = current.getFullYear();
    
    if (year === currentYear) {
      // Calculate days in this month that overlap with the date range
      const monthStart = new Date(year, current.getMonth(), 1);
      const monthEnd = new Date(year, current.getMonth() + 1, 0); // Last day of month
      
      const overlapStart = new Date(Math.max(start.getTime(), monthStart.getTime()));
      const overlapEnd = new Date(Math.min(end.getTime(), monthEnd.getTime()));
      
      if (overlapStart <= overlapEnd) {
        // For quotation and plan: show full allocation rate for any month that has overlap
        // For actual: calculate proportional allocation based on actual days worked
        let monthlyAllocation;
        
        if (isActualData) {
          // Calculate the proportion of the month covered for actual data
          const daysInMonth = monthEnd.getDate();
          const overlapDays = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
          const monthProportion = overlapDays / daysInMonth;
          monthlyAllocation = allocationRate * monthProportion;
        } else {
          // For quotation and plan: show full allocation rate
          monthlyAllocation = allocationRate;
        }
        
        monthlyAllocations.push({
          month,
          allocation: monthlyAllocation
        });
      }
    }
    
    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }
  
  return monthlyAllocations;
}

/**
 * Get month name from month number
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
export function getMonthName(month) {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return monthNames[month - 1] || '';
}

/**
 * Format workload data for WorkloadGraph component
 * @param {Array} workloadData - Monthly workload data
 * @returns {Array} Formatted data for chart
 */
export function formatWorkloadForChart(workloadData) {
  if (!Array.isArray(workloadData) || workloadData.length === 0) {
    return Array(12).fill({ quotation: 0, plan: 0, actual: 0 });
  }

  // Ensure we have exactly 12 months of data
  const chartData = Array(12).fill(null).map((_, index) => {
    const monthData = workloadData.find(item => item.month === index + 1);
    return monthData || { quotation: 0, plan: 0, actual: 0 };
  });

  return chartData;
}