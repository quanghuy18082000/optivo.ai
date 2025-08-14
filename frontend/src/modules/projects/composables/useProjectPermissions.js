import { ref, computed } from 'vue'
import { getUserProjectPermissions } from '../services/projectPermissionService'
import { useAuthStore } from '@/modules/auth/store'
import { debugPermissionCall, debugAuthStore } from '../utils/debugPermissions'

/**
 * Composable for managing project-specific permissions
 * @param {string|number} projectId - The project ID
 * @returns {Object} Permission management utilities
 */
export function useProjectPermissions(projectId) {
  const authStore = useAuthStore()
  
  // State
  const userPermissions = ref([])
  const userRoles = ref([])
  const isLoadingPermissions = ref(false)
  const permissionError = ref(null)

  // Get current user ID from auth store
  const currentUserId = computed(() => authStore.user?.id)
  
  // Handle both reactive and static project IDs
  const resolvedProjectId = computed(() => {
    return typeof projectId === 'function' ? projectId() : 
           projectId?.value !== undefined ? projectId.value : 
           projectId
  })

  /**
   * Fetch user permissions for the project
   */
  const fetchUserPermissions = async () => {
    const currentProjectId = resolvedProjectId.value
    
    // Validate inputs before making API call
    if (!currentProjectId) {
      console.warn('No project ID provided for permission fetch')
      permissionError.value = 'Project ID is required'
      return
    }

    if (!currentUserId.value) {
      console.warn('No user ID available for permission fetch')
      permissionError.value = 'User must be logged in'
      return
    }

    // Additional validation for route params
    if (currentProjectId === 'undefined' || currentProjectId === 'null' || currentProjectId === undefined || currentProjectId === null) {
      console.warn('Invalid project ID from route params:', currentProjectId)
      permissionError.value = 'Invalid project ID'
      return
    }

    isLoadingPermissions.value = true
    permissionError.value = null

    try {
      // Debug information
      debugAuthStore(authStore)
      debugPermissionCall(currentProjectId, currentUserId.value)

      const response = await getUserProjectPermissions(currentProjectId, currentUserId.value)
      const data = response.data || response
      
      if (data) {
        userPermissions.value = data.permissions || []
        userRoles.value = data.roles || []
        console.log('User project permissions loaded:', {
          permissions: userPermissions.value,
          roles: userRoles.value
        })
      } else {
        console.warn('No permission data received from API')
        userPermissions.value = []
        userRoles.value = []
      }
    } catch (error) {
      console.error('Error fetching user project permissions:', error)
      permissionError.value = error.message || 'Failed to load permissions'
      
      // Set empty permissions on error
      userPermissions.value = []
      userRoles.value = []
    } finally {
      isLoadingPermissions.value = false
    }
  }

  /**
   * Check if user has a specific permission in the project
   * @param {string} permission - Permission to check
   * @returns {boolean} Whether user has the permission
   */
  const hasProjectPermission = (permission) => {
    if (!permission) return false
    
    // Check direct permissions
    if (userPermissions.value.includes(permission)) {
      return true
    }
    
    // Check permissions from roles
    return userRoles.value.some(role => 
      role.permissions && role.permissions.includes(permission)
    )
  }

  /**
   * Check if user has any of the specified permissions
   * @param {string[]} permissions - Array of permissions to check
   * @returns {boolean} Whether user has any of the permissions
   */
  const hasAnyProjectPermission = (permissions) => {
    if (!Array.isArray(permissions)) return false
    return permissions.some(permission => hasProjectPermission(permission))
  }

  /**
   * Check if user has all of the specified permissions
   * @param {string[]} permissions - Array of permissions to check
   * @returns {boolean} Whether user has all of the permissions
   */
  const hasAllProjectPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return false
    return permissions.every(permission => hasProjectPermission(permission))
  }

  /**
   * Get user's role names in the project
   * @returns {string[]} Array of role names
   */
  const getUserRoleNames = () => {
    return userRoles.value.map(role => role.name)
  }

  /**
   * Check if user has a specific role in the project
   * @param {string} roleName - Role name to check
   * @returns {boolean} Whether user has the role
   */
  const hasProjectRole = (roleName) => {
    return userRoles.value.some(role => role.name === roleName)
  }

  // Computed properties for common permissions
  const canEditProject = computed(() => hasProjectPermission('project.update'))
  const canDeleteProject = computed(() => hasProjectPermission('project.delete'))
  const canViewProject = computed(() => hasProjectPermission('project.view'))
  const canEditQuotation = computed(() => hasProjectPermission('project.update_quotation'))
  const canEditPlan = computed(() => hasProjectPermission('project.update')) // Step 3 uses project.update
  const canManageRoles = computed(() => hasProjectPermission('project.create_role'))
  const canAssignRoles = computed(() => hasProjectPermission('project.assign_role'))
  const canAddUsers = computed(() => hasProjectPermission('project.add_user'))
  const canDeleteUsers = computed(() => hasProjectPermission('project.delete_user'))

  return {
    // State
    userPermissions,
    userRoles,
    isLoadingPermissions,
    permissionError,
    
    // Methods
    fetchUserPermissions,
    hasProjectPermission,
    hasAnyProjectPermission,
    hasAllProjectPermissions,
    getUserRoleNames,
    hasProjectRole,
    
    // Computed permissions
    canEditProject,
    canDeleteProject,
    canViewProject,
    canEditQuotation,
    canEditPlan,
    canManageRoles,
    canAssignRoles,
    canAddUsers,
    canDeleteUsers
  }
}