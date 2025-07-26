// Project Status Constants
export const PROJECT_STATUS = {
  NOT_STARTED: "not_started",
  POSTPONE: "postpone", 
  RUNNING: "running",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
}

// Project Status Labels for display
export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.NOT_STARTED]: "Not Started",
  [PROJECT_STATUS.POSTPONE]: "Postponed",
  [PROJECT_STATUS.RUNNING]: "Running", 
  [PROJECT_STATUS.COMPLETED]: "Completed",
  [PROJECT_STATUS.CANCELLED]: "Cancelled"
}

// Project Status Colors for UI
export const PROJECT_STATUS_COLORS = {
  [PROJECT_STATUS.NOT_STARTED]: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300"
  },
  [PROJECT_STATUS.POSTPONE]: {
    bg: "bg-yellow-100", 
    text: "text-yellow-800",
    border: "border-yellow-300"
  },
  [PROJECT_STATUS.RUNNING]: {
    bg: "bg-blue-100",
    text: "text-blue-800", 
    border: "border-blue-300"
  },
  [PROJECT_STATUS.COMPLETED]: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300"
  },
  [PROJECT_STATUS.CANCELLED]: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300"
  }
}

// Get available status options for a current status (excluding current status)
export const getAvailableStatusOptions = (currentStatus) => {
  return Object.entries(PROJECT_STATUS)
    .filter(([key, value]) => value !== currentStatus)
    .map(([key, value]) => ({
      label: PROJECT_STATUS_LABELS[value],
      value: value
    }))
}