import { ref, computed } from 'vue'

/**
 * Composable for handling time format conversion between human-readable format (2d3h24m) and minutes
 * Supports formats like: 2d, 3h, 24m, 2d3h, 3h24m, 2d3h24m
 */
export function useTimeFormat() {
  /**
   * Convert minutes to human-readable format (2d3h24m)
   * @param {number} totalMinutes - Total minutes to convert
   * @returns {string} - Human-readable format
   */
  const minutesToHumanFormat = (totalMinutes) => {
    if (!totalMinutes || totalMinutes === 0) return '0m'
    
    const days = Math.floor(totalMinutes / (24 * 60))
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
    const minutes = totalMinutes % 60
    
    let result = ''
    if (days > 0) result += `${days}d`
    if (hours > 0) result += `${hours}h`
    if (minutes > 0) result += `${minutes}m`
    
    return result || '0m'
  }

  /**
   * Convert human-readable format (2d3h24m) to minutes
   * @param {string} timeString - Time string in format like 2d3h24m
   * @returns {number} - Total minutes
   */
  const humanFormatToMinutes = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return 0
    
    // Remove spaces and convert to lowercase
    const cleanString = timeString.replace(/\s/g, '').toLowerCase()
    
    // Regular expressions to match days, hours, and minutes
    const dayMatch = cleanString.match(/(\d+)d/)
    const hourMatch = cleanString.match(/(\d+)h/)
    const minuteMatch = cleanString.match(/(\d+)m/)
    
    const days = dayMatch ? parseInt(dayMatch[1]) : 0
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0
    
    return (days * 24 * 60) + (hours * 60) + minutes
  }

  /**
   * Validate time format string
   * @param {string} timeString - Time string to validate
   * @returns {boolean} - Whether the format is valid
   */
  const isValidTimeFormat = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return false
    
    // Remove spaces and convert to lowercase
    const cleanString = timeString.replace(/\s/g, '').toLowerCase()
    
    // Check if it matches the expected pattern (combinations of Xd, Xh, Xm)
    const pattern = /^(\d+d)?(\d+h)?(\d+m)?$/
    const isValidPattern = pattern.test(cleanString)
    
    // Must have at least one component
    const hasAtLeastOneComponent = /[dhm]/.test(cleanString)
    
    return isValidPattern && hasAtLeastOneComponent
  }

  /**
   * Create a reactive time input handler
   * @param {number} initialMinutes - Initial value in minutes
   * @returns {object} - Reactive time input object
   */
  const createTimeInput = (initialMinutes = 0) => {
    const displayValue = ref(minutesToHumanFormat(initialMinutes))
    const minutesValue = ref(initialMinutes)
    const isValid = ref(true)
    const errorMessage = ref('')

    // Computed property for the display format
    const formattedDisplay = computed({
      get: () => displayValue.value,
      set: (value) => {
        displayValue.value = value
        
        if (!value || value.trim() === '') {
          minutesValue.value = 0
          isValid.value = true
          errorMessage.value = ''
          return
        }

        if (isValidTimeFormat(value)) {
          minutesValue.value = humanFormatToMinutes(value)
          isValid.value = true
          errorMessage.value = ''
        } else {
          isValid.value = false
          errorMessage.value = 'Invalid format. Use format like: 2d3h24m, 3h30m, 45m'
        }
      }
    })

    // Method to set value in minutes (for API responses)
    const setMinutes = (minutes) => {
      minutesValue.value = minutes
      displayValue.value = minutesToHumanFormat(minutes)
      isValid.value = true
      errorMessage.value = ''
    }

    // Method to get value in minutes (for API requests)
    const getMinutes = () => minutesValue.value

    // Method to format the display value on blur
    const formatOnBlur = () => {
      if (isValid.value && displayValue.value) {
        displayValue.value = minutesToHumanFormat(minutesValue.value)
      }
    }

    return {
      formattedDisplay,
      minutesValue: computed(() => minutesValue.value),
      isValid: computed(() => isValid.value),
      errorMessage: computed(() => errorMessage.value),
      setMinutes,
      getMinutes,
      formatOnBlur
    }
  }

  return {
    minutesToHumanFormat,
    humanFormatToMinutes,
    isValidTimeFormat,
    createTimeInput
  }
}

// Export utility functions for direct use
export const timeFormatUtils = {
  minutesToHumanFormat: (totalMinutes) => {
    const { minutesToHumanFormat } = useTimeFormat()
    return minutesToHumanFormat(totalMinutes)
  },
  
  humanFormatToMinutes: (timeString) => {
    const { humanFormatToMinutes } = useTimeFormat()
    return humanFormatToMinutes(timeString)
  },
  
  isValidTimeFormat: (timeString) => {
    const { isValidTimeFormat } = useTimeFormat()
    return isValidTimeFormat(timeString)
  }
}