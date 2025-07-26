import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getUserPermissions } from '@/services/systemConfigService.js'
import { useLoadingIntegration, LOADING_KEYS } from '@/composables/useLoadingIntegration.js'

export function usePermissions() {
  const permissions = ref({
    roles: [],
    permissionNames: [],
    projectAccess: []
  })

  const isLoading = ref(false)
  const error = ref(null)

  // Integrate with global loading screen
  useLoadingIntegration(LOADING_KEYS.PERMISSIONS, isLoading)

  // Fetch user permissions using vue-query
  const { refetch } = useQuery({
    queryKey: ['userPermissions'],
    queryFn: async () => {
      try {
        isLoading.value = true
        
        const response = await getUserPermissions()

        
        if (response) {
          // Transform API response to our internal format
          permissions.value = {
            globalRoles: response.data?.global_roles || response.global_roles || [],
            projectAccess: response.data?.project_access || response.project_access || [],
            allPermissions: extractAllPermissionNames(response.data || response)
          }
        }
        
        return response
      } catch (err) {
        error.value = err.message || 'Failed to load permissions'
        throw err
      } finally {
        isLoading.value = false
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })

  // Extract all permission names from roles and project access
  const extractAllPermissionNames = (data) => {
    const permissionSet = new Set()

  
    // Add permissions from global_roles (instead of roles)
    if (data.global_roles && Array.isArray(data.global_roles)) {
      data.global_roles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(permission => {
            permissionSet.add(permission.name)
          })
        }
      })
    }
  
    // Add permissions from project access
    if (data.project_access && Array.isArray(data.project_access)) {
      data.project_access.forEach(project => {
        if (project.permission_names && Array.isArray(project.permission_names)) {
          project.permission_names.forEach(permName => {
            permissionSet.add(permName)
          })
        }
      })
    }
  
    return Array.from(permissionSet)
  }

  // Check if user has a global permission
  const hasGlobalPermission = (permissionName) => {
    if (!permissions.value.globalRoles) return false
    
    return permissions.value.globalRoles.some(role => 
      role.permissions && role.permissions.some(p => p.name === permissionName)
    )
  }

  // Check if user has a specific permission (global OR project-specific)
  const hasPermission = (permissionName, projectId = null) => {
    // Check global permission first
    if (hasGlobalPermission(permissionName)) {
      return true
    }
    
    // If projectId provided, check project-specific permission
    if (projectId) {
      return hasProjectPermission(projectId, permissionName)
    }
    
    // Check if permission exists in any project
    return permissions?.value?.allPermissions?.includes(permissionName)
  }

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissionNames, projectId = null) => {
    return permissionNames.some(name => hasPermission(name, projectId))
  }

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissionNames, projectId = null) => {
    return permissionNames.every(name => hasPermission(name, projectId))
  }

  // Check if user has access to a specific project
  const hasProjectAccess = (projectId) => {
    return permissions.value.projectAccess.some(project => 
      project.project_id.toString() === projectId.toString()
    )
  }

  // Check if user has a specific permission for a project
  const hasProjectPermission = (projectId, permissionName) => {
    const project = permissions.value.projectAccess.find(p => 
      p.project_id.toString() === projectId.toString()
    )
    
    return project && project.permission_names && 
      project.permission_names.includes(permissionName)
  }

  // Get all projects user has access to
  const accessibleProjects = computed(() => {
    return permissions.value.projectAccess.map(project => project.project_id)
  })

  // Get all roles for a specific project
  const getProjectRoles = (projectId) => {
    const project = permissions.value.projectAccess.find(p => 
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

  // Computed properties for easier access
  const globalRoles = computed(() => permissions.value.globalRoles || [])
  const projectAccess = computed(() => permissions.value.projectAccess || [])
  const allPermissions = computed(() => permissions.value.allPermissions || [])

  return {
    // State
    permissions,
    isLoading,
    error,
    
    // Computed
    globalRoles,
    projectAccess,
    allPermissions,
    accessibleProjects,
    
    // Actions
    refetchPermissions: refetch,
    
    // Permission checks
    hasPermission,
    hasGlobalPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasProjectAccess,
    hasProjectPermission,
    getProjectRoles,
    
    // Constants
    PERMISSIONS
  }
}