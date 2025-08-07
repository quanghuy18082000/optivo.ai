import { ref, computed, watch } from 'vue'
import { useLoadingIntegration, LOADING_KEYS } from '@/composables/useLoadingIntegration.js'
import { useAuthStore } from '@/modules/auth/store'
import { 
  fetchUserPermissions, 
  hasPermission as serviceHasPermission,
  hasGlobalPermission as serviceHasGlobalPermission,
  hasAnyPermission as serviceHasAnyPermission,
  hasAllPermissions as serviceHasAllPermissions,
  hasProjectPermission as serviceHasProjectPermission,
  clearPermissionsCache,
  getPermissionsCache
} from '@/services/permissionService.js'

// Global flag to prevent multiple initialization calls
let isInitializing = false

export function usePermissions() {
  const authStore = useAuthStore()
  const isLoading = ref(false)
  const error = ref(null)

  // Integrate with global loading screen
  useLoadingIntegration(LOADING_KEYS.PERMISSIONS, isLoading)

  // Watch auth state changes to clear permissions cache
  watch(() => authStore.isAuthenticated, (isAuthenticated, wasAuthenticated) => {
    if (!isAuthenticated && wasAuthenticated) {
      // User logged out - clear permissions cache and reset flags
      clearPermissionsCache()
      isInitializing = false
    }
  })

  const isReady = computed(() => {
    const cache = getPermissionsCache()
    return cache.lastFetched !== null && !cache.isLoading
  })

  // Initialize permissions on first call if authenticated
  const initializePermissions = async () => {
    if (authStore.isAuthenticated && !isReady.value && !isInitializing) {
      try {
        console.log('🔄 Initializing permissions...')
        isInitializing = true
        isLoading.value = true
        error.value = null
        
        await fetchUserPermissions(false)
        console.log('✅ Permissions initialized')
      } catch (err) {
        console.error('❌ Failed to initialize permissions:', err)
        error.value = err.message || 'Failed to load permissions'
      } finally {
        isLoading.value = false
        isInitializing = false
      }
    }
  }

  // Function to manually refetch permissions
  const refetchPermissions = async (force = false) => {
    try {
      console.log('🔄 Refetching permissions...', { force })
      isLoading.value = true
      error.value = null
      
      await fetchUserPermissions(force)
      console.log('✅ Permissions refetched')
    } catch (error) {
      console.error('❌ Failed to refetch permissions:', error)
      error.value = error.message || 'Failed to load permissions'
    } finally {
      isLoading.value = false
    }
  }

  // Auto-initialize when authenticated
  watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (isAuthenticated) {
      initializePermissions()
    }
  }, { immediate: true })

  // Get current permissions from cache
  const permissions = computed(() => getPermissionsCache())
  
  // Function to check if permissions are ready
 

  // Let Vue Query handle the initial fetch automatically based on enabled state
  // No need for manual onMounted logic since Vue Query will fetch when enabled becomes true

  // Computed properties for easier access
  const globalRoles = computed(() => permissions.value.globalRoles || [])
  const projectAccess = computed(() => permissions.value.projectAccess || [])
  const allPermissions = computed(() => permissions.value.allPermissions || [])
  
  // Get all projects user has access to
  const accessibleProjects = computed(() => {
    return permissions.value.projectAccess?.map(project => project.project_id) || []
  })

  // Get all roles for a specific project
  const getProjectRoles = (projectId) => {
    const project = permissions.value.projectAccess?.find(p => 
      p.project_id.toString() === projectId.toString()
    )
    
    return project ? project.roles || [] : []
  }

  // Permission constants for easy reference
  const PERMISSIONS = {
    // Worklog permissions
    WORKLOG_CREATE: 'worklog.create',
    WORKLOG_VIEW_OWN: 'worklog.view_own',
    WORKLOG_VIEW_ANY: 'worklog.view_any',
    WORKLOG_UPDATE_OWN: 'worklog.update_own',
    WORKLOG_UPDATE_ANY: 'worklog.update_any',
    WORKLOG_DELETE_OWN: 'worklog.delete_own',
    WORKLOG_DELETE_ANY: 'worklog.delete_any',
    
    // Project permissions
    PROJECT_CREATE: 'project.create',
    PROJECT_UPDATE: 'project.update',
    PROJECT_DELETE: 'project.delete',
    PROJECT_ADD_USER: 'project.add_user',
    PROJECT_DELETE_USER: 'project.delete_user',
    PROJECT_ASSIGN_ROLE: 'project.assign_role',
    PROJECT_CREATE_ROLE: 'project.create_role',
    PROJECT_VIEW_MEMBER: 'project.view_member',
    PROJECT_VIEW_MEMBER_QUOTATION: 'project.view_member_quotation',
    
    // Role & Permission management
    ROLE_PERMISSION_VIEW_ANY: 'role_permission.view_any',
    ROLE_PERMISSION_VIEW_OWN: 'role_permission.view_own',
    ROLE_PERMISSION_CREATE: 'role_permission.create',
    ROLE_PERMISSION_ASSIGN_PERMISSION_TO_ROLE: 'role_permission.assign_permission_to_role',
    ROLE_PERMISSION_ASSIGN_USER_TO_ROLE: 'role_permission.assign_user_to_role',
    ROLE_PERMISSION_REMOVE_USER_FROM_ROLE: 'role_permission.remove_user_from_role',
    
    // System config permissions
    SYSTEM_CONFIG_COMPANY_VIEW: 'system_config_company.view',
    SYSTEM_CONFIG_COMPANY_UPDATE: 'system_config_company.update'
  }

  return {
    // State
    permissions,
    isLoading,
    error,
    isReady,
    
    // Computed
    globalRoles,
    projectAccess,
    allPermissions,
    accessibleProjects,
    
    // Actions
    refetchPermissions,
    
    // Permission checks (using service functions)
    hasPermission: serviceHasPermission,
    hasGlobalPermission: serviceHasGlobalPermission,
    hasAnyPermission: serviceHasAnyPermission,
    hasAllPermissions: serviceHasAllPermissions,
    hasProjectPermission: serviceHasProjectPermission,
    getProjectRoles,
    
    // Constants
    PERMISSIONS
  }
}

// Export service functions for external use (like router)
export { 
  fetchUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasGlobalPermission,
  hasProjectPermission,
  clearPermissionsCache,
  getPermissionsCache
} from '@/services/permissionService.js'