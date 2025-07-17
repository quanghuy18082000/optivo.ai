# Project Dashboard - Workload Data Integration

## Overview

This document explains how the Project Dashboard handles workload data from the API response and transforms it for display in ProjectTable and WorkloadGraph components.

## API Response Format

The API returns project data in the following format:

```json
[
  {
    "project_id": 1,
    "project_name": "Project 1",
    "workload_member_detail": [
      {
        "member": {
          "id": 1,
          "user_name": "Tan",
          "position": {
            "id": 1,
            "name": "Dev Backend"
          }
        },
        "plan": [
          {
            "start_date": "2025-07-10",
            "end_date": "2025-08-10",
            "allocation_rate": 0.3
          }
        ],
        "quotation": [
          {
            "start_date": "2025-06-10",
            "end_date": "2025-09-10",
            "allocation_rate": 0.5
          }
        ],
        "actual": [
          {
            "start_date": "2025-07-14",
            "end_date": "2025-07-20",
            "allocation_rate": 0.5
          }
        ]
      }
    ]
  }
]
```

## Data Transformation

### 1. Project Level Transformation

The `transformProjectsData()` function converts API response to ProjectTable format:

```javascript
// Input: API response array
// Output: ProjectTable format
{
  id: project.project_id,
  name: project.project_name,
  members: [...] // Transformed member data
}
```

### 2. Member Level Transformation

Each member's workload data is processed to:

- Extract member information (id, name, position)
- Transform workload data for WorkloadGraph

### 3. Workload Data Processing

The `transformWorkloadData()` function:

1. **Initializes 12 months** with zero values
2. **Processes each data type** (quotation, plan, actual):
   - Calculates monthly allocations from date ranges
   - Handles overlapping periods
   - Aggregates allocation rates per month

#### Monthly Allocation Calculation

The system uses different calculation methods for different data types:

**For Quotation & Plan Data:**

- Shows **full allocation rate** for any month that has overlap
- Logic: `monthlyAllocation = allocation_rate` (no proportional calculation)
- Example: 0.5 rate from June 10 - Sep 10 → June: 0.5, July: 0.5, Aug: 0.5, Sep: 0.5

**For Actual Data (Weekly):**

- Uses **proportional calculation** based on actual days worked
- Logic: `monthlyAllocation = allocation_rate * (overlapDays / daysInMonth)`
- Example: 0.5 rate for July 14-20 (7 days) → July: 0.5 × (7/31) = 0.11

**Processing Steps:**

1. **Date Range Validation**: Only processes dates in current year (2025)
2. **Month Iteration**: Loops through each month in the date range
3. **Overlap Calculation**: Determines how many days of each month overlap with the date range
4. **Allocation Logic**: Applies appropriate calculation method based on data type

#### Example Calculations

**Quotation Example:**

- `start_date: "2025-06-10"`, `end_date: "2025-09-10"`, `allocation_rate: 0.5`
- **Result**: June: 0.5, July: 0.5, August: 0.5, September: 0.5

**Plan Example:**

- `start_date: "2025-07-10"`, `end_date: "2025-08-10"`, `allocation_rate: 0.3`
- **Result**: July: 0.3, August: 0.3

**Actual Example (Weekly):**

- `start_date: "2025-07-14"`, `end_date: "2025-07-20"`, `allocation_rate: 0.5`
- **Calculation**: July has 31 days, work period is 7 days (July 14-20)
- **Result**: July: 0.5 × (7/31) = 0.11

## Component Integration

### ProjectDashboard.vue

```javascript
import { transformProjectsData } from "../utils/workloadDataTransformer";

// Transform raw API data for ProjectTable
const projects = computed(() => {
  return transformProjectsData(rawProjects.value);
});
```

### WorkloadGraph.vue

```javascript
import { formatWorkloadForChart } from "../utils/workloadDataTransformer";

// Format workload data for ECharts
const chartData = computed(() => {
  const formattedData = formatWorkloadForChart(props.workload);

  return {
    quotation: formattedData.map((item) => item.quotation),
    plan: formattedData.map((item) => item.plan),
    actual: formattedData.map((item) => item.actual),
  };
});
```

## Handling Weekly Actual Data

The `actual` data comes in weekly format but is converted to monthly display:

1. **Weekly periods** are processed individually
2. **Each week** contributes to the month(s) it overlaps
3. **Monthly totals** are aggregated from all overlapping weeks
4. **Chart displays** monthly aggregated values

## Key Features

### 1. **Flexible Date Handling**

- Supports any date range within the current year
- Handles overlapping periods correctly
- Proportional allocation based on actual days

### 2. **Data Aggregation**

- Multiple allocations for same member/month are summed
- Supports complex scheduling scenarios
- Maintains data integrity across transformations

### 3. **Chart Optimization**

- Always returns exactly 12 months of data
- Fills missing months with zero values
- Optimized for ECharts line chart display

## Usage Example

```javascript
// API Response
const apiData = [
  {
    project_id: 1,
    project_name: "Project 1",
    workload_member_detail: [...]
  }
];

// Transform for ProjectTable
const projects = transformProjectsData(apiData);

// Result
[
  {
    id: 1,
    name: "Project 1",
    members: [
      {
        id: 1,
        name: "Tan",
        position: "Dev Backend",
        workload: [
          { month: 1, quotation: 0, plan: 0, actual: 0 },
          { month: 2, quotation: 0, plan: 0, actual: 0 },
          // ... 12 months total
        ]
      }
    ]
  }
]
```

## Testing

The system includes mock data fallback in `projectService.js` for testing when API is unavailable.

## Recent Updates (Latest Version)

### 🎯 **Value Formatting & Rounding**

- **Plan & Actual values**: Rounded to 1 decimal place for cleaner display
- **Quotation values**: Kept at 2 decimal places for precision
- **Tooltip formatting**: Enhanced to show properly rounded values

### 📈 **Smart Line Visualization**

- **Date-range specific lines**: Lines only appear during actual date ranges
- **No more zero-padding**: Eliminates lines extending across entire year with zero values
- **connectNulls: false**: Prevents connecting gaps in data
- **Cleaner charts**: More accurate and visually appealing timeline representation

### 🔧 **Technical Improvements**

```javascript
// Before: Lines extended full year with zeros
quotation: [0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0];

// After: Null values for months without data
quotation: [null, null, null, 0.5, 0.5, 0.5, 0.5, null, null, null, null, null];
```

### 📊 **Example Transformation**

For quotation with `start_date: "2025-06-10"` and `end_date: "2025-09-10"`:

- **Before**: Line shows across all 12 months
- **After**: Line only shows June-September period
- **Result**: More accurate visual representation of actual work periods

## Future Enhancements

1. **Multi-year Support**: Extend to handle data across multiple years
2. **Custom Date Ranges**: Allow filtering by custom date ranges
3. **Performance Optimization**: Cache transformed data for large datasets
4. **Real-time Updates**: Support for live data updates
5. **Advanced Filtering**: Filter by specific date ranges or allocation thresholds
