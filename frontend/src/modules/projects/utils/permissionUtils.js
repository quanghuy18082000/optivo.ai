/**
 * Utility functions for handling project permissions
 */

import { PROJECT_PERMISSIONS } from '../constants/projectPermissions.js'

/**
 * Check if user has permission based on permission data
 * @param {Object} permissionData - Permission data from API
 * @param {string} permission - Permission to check
 * @returns {boolean} Whether user has the permission
 */
export const hasPermission = (permissionData, permission) => {
  if (!permissionData || !permission) return false

  const { permissions = [], roles = [] } = permissionData

  // Check direct permissions
  if (permissions.includes(permission)) {
    return true
  }

  // Check permissions from roles
  return roles.some(role => 
    role.permissions && role.permissions.includes(permission)
  )
}

/**
 * Check if user has any of the specified permissions
 * @param {Object} permissionData - Permission data from API
 * @param {string[]} permissionList - Array of permissions to check
 * @returns {boolean} Whether user has any of the permissions
 */
export const hasAnyPermission = (permissionData, permissionList) => {
  if (!Array.isArray(permissionList)) return false
  return permissionList.some(permission => hasPermission(permissionData, permission))
}

/**
 * Check if user has all of the specified permissions
 * @param {Object} permissionData - Permission data from API
 * @param {string[]} permissionList - Array of permissions to check
 * @returns {boolean} Whether user has all of the permissions
 */
export const hasAllPermissions = (permissionData, permissionList) => {
  if (!Array.isArray(permissionList)) return false
  return permissionList.every(permission => hasPermission(permissionData, permission))
}

/**
 * Get all permissions for a user (direct + from roles)
 * @param {Object} permissionData - Permission data from API
 * @returns {string[]} Array of all permissions
 */
export const getAllUserPermissions = (permissionData) => {
  if (!permissionData) return []

  const { permissions = [], roles = [] } = permissionData
  const rolePermissions = roles.flatMap(role => role.permissions || [])
  
  return [...new Set([...permissions, ...rolePermissions])]
}

/**
 * Get user's role names
 * @param {Object} permissionData - Permission data from API
 * @returns {string[]} Array of role names
 */
export const getUserRoleNames = (permissionData) => {
  if (!permissionData || !permissionData.roles) return []
  return permissionData.roles.map(role => role.name)
}

/**
 * Check if user has a specific role
 * @param {Object} permissionData - Permission data from API
 * @param {string} roleName - Role name to check
 * @returns {boolean} Whether user has the role
 */
export const hasRole = (permissionData, roleName) => {
  if (!permissionData || !permissionData.roles) return false
  return permissionData.roles.some(role => role.name === roleName)
}

/**
 * Calculate accessible steps for EditProjectPage based on permissions
 * @param {Object} permissionData - Permission data from API
 * @returns {number[]} Array of accessible step numbers
 */
export const getAccessibleSteps = (permissionData) => {
  const steps = []
  
  if (hasPermission(permissionData, PROJECT_PERMISSIONS.UPDATE)) {
    steps.push(1) // Basic Information
  }
  
  if (hasPermission(permissionData, PROJECT_PERMISSIONS.UPDATE_QUOTATION)) {
    steps.push(2) // Quotation
  }
  
  if (hasPermission(permissionData, PROJECT_PERMISSIONS.UPDATE)) {
    steps.push(3) // Plan - also uses project.update
  }
  
  return steps
}

/**
 * Get the initial step based on permissions
 * @param {Object} permissionData - Permission data from API
 * @returns {number} Initial step number
 */
export const getInitialStep = (permissionData) => {
  const accessibleSteps = getAccessibleSteps(permissionData)
  
  if (accessibleSteps.length === 0) {
    return 1 // Default to first step if no permissions
  }
  
  return Math.min(...accessibleSteps)
}

/**
 * Get next accessible step
 * @param {Object} permissionData - Permission data from API
 * @param {number} currentStep - Current step number
 * @returns {number|null} Next accessible step or null if none
 */
export const getNextAccessibleStep = (permissionData, currentStep) => {
  const accessibleSteps = getAccessibleSteps(permissionData)
  return accessibleSteps.find(step => step > currentStep) || null
}

/**
 * Get previous accessible step
 * @param {Object} permissionData - Permission data from API
 * @param {number} currentStep - Current step number
 * @returns {number|null} Previous accessible step or null if none
 */
export const getPreviousAccessibleStep = (permissionData, currentStep) => {
  const accessibleSteps = getAccessibleSteps(permissionData)
  const previousSteps = accessibleSteps.filter(step => step < currentStep)
  return previousSteps.length > 0 ? Math.max(...previousSteps) : null
}

/**
 * Check if user can access project permission management
 * @param {Object} permissionData - Permission data from API
 * @returns {boolean} Whether user can access permission management
 */
export const canAccessPermissionManagement = (permissionData) => {
  return hasAnyPermission(permissionData, [
    PROJECT_PERMISSIONS.CREATE_ROLE,
    PROJECT_PERMISSIONS.ASSIGN_ROLE,
    PROJECT_PERMISSIONS.ADD_USER,
    PROJECT_PERMISSIONS.DELETE_USER
  ])
}

/**
 * Format permission error messages
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export const formatPermissionError = (error) => {
  if (!error) return ''

  // Handle different types of errors
  if (error.message) {
    // API errors
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return 'You don\'t have permission to access this resource.'
    }
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'Please log in to access this resource.'
    }
    
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return 'The requested resource was not found.'
    }
    
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return 'Unable to load permissions. Please check your connection and try again.'
    }
    
    return error.message
  }

  return 'An unexpected error occurred while loading permissions.'
}

/**
 * Validate permission data structure
 * @param {Object} permissionData - Permission data to validate
 * @returns {boolean} Whether the data structure is valid
 */
export const isValidPermissionData = (permissionData) => {
  if (!permissionData || typeof permissionData !== 'object') {
    return false
  }

  // Check if it has the expected structure
  const hasUserId = typeof permissionData.user_id === 'number'
  const hasPermissions = Array.isArray(permissionData.permissions)
  const hasRoles = Array.isArray(permissionData.roles)

  if (!hasUserId || !hasPermissions || !hasRoles) {
    return false
  }

  // Validate roles structure
  const rolesValid = permissionData.roles.every(role => 
    typeof role === 'object' &&
    typeof role.id === 'number' &&
    typeof role.name === 'string' &&
    typeof role.project_id === 'number' &&
    Array.isArray(role.permissions)
  )

  return rolesValid
}

/**
 * Create permission summary for debugging
 * @param {Object} permissionData - Permission data from API
 * @returns {Object} Permission summary
 */
export const createPermissionSummary = (permissionData) => {
  if (!isValidPermissionData(permissionData)) {
    return { error: 'Invalid permission data structure' }
  }

  const allPermissions = getAllUserPermissions(permissionData)
  const roleNames = getUserRoleNames(permissionData)
  const accessibleSteps = getAccessibleSteps(permissionData)

  return {
    userId: permissionData.user_id,
    directPermissions: permissionData.permissions,
    roles: roleNames,
    allPermissions,
    accessibleSteps,
    canEdit: hasPermission(permissionData, PROJECT_PERMISSIONS.UPDATE),
    canEditQuotation: hasPermission(permissionData, PROJECT_PERMISSIONS.UPDATE_QUOTATION),
    canEditPlan: hasPermission(permissionData, PROJECT_PERMISSIONS.UPDATE),
    canManagePermissions: canAccessPermissionManagement(permissionData)
  }
}

export default {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getAllUserPermissions,
  getUserRoleNames,
  hasRole,
  getAccessibleSteps,
  getInitialStep,
  getNextAccessibleStep,
  getPreviousAccessibleStep,
  canAccessPermissionManagement,
  formatPermissionError,
  isValidPermissionData,
  createPermissionSummary
}