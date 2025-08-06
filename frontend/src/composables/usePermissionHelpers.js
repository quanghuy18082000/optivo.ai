import { computed } from 'vue'
import { usePermissions } from './usePermissions'
import { 
  PERMISSIONS, 
  PERMISSION_GROUPS,
  WORKLOG_PERMISSIONS,
  ROLE_PERMISSIONS,
  PROJECT_PERMISSIONS
} from '@/constants/permissions'

/**
 * Extended permission helpers that work with permission constants
 */
export function usePermissionHelpers() {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasProjectPermission,
    hasProjectAccess,
    permissions,
    isLoading,
    error,
    refetchPermissions
  } = usePermissions()

  // Worklog permission helpers
  const worklogPermissions = computed(() => ({
    canCreate: hasPermission(WORKLOG_PERMISSIONS.CREATE),
    canViewOwn: hasPermission(WORKLOG_PERMISSIONS.VIEW_OWN),
    canViewAny: hasPermission(WORKLOG_PERMISSIONS.VIEW_ANY),
    canUpdateOwn: hasPermission(WORKLOG_PERMISSIONS.UPDATE_OWN),
    canUpdateAny: hasPermission(WORKLOG_PERMISSIONS.UPDATE_ANY),
    canDeleteOwn: hasPermission(WORKLOG_PERMISSIONS.DELETE_OWN),
    canDeleteAny: hasPermission(WORKLOG_PERMISSIONS.DELETE_ANY),
    canView: hasAnyPermission([WORKLOG_PERMISSIONS.VIEW_OWN, WORKLOG_PERMISSIONS.VIEW_ANY]),
    canUpdate: hasAnyPermission([WORKLOG_PERMISSIONS.UPDATE_OWN, WORKLOG_PERMISSIONS.UPDATE_ANY]),
    canDelete: hasAnyPermission([WORKLOG_PERMISSIONS.DELETE_OWN, WORKLOG_PERMISSIONS.DELETE_ANY])
  }))

  // Role permission helpers
  const rolePermissions = computed(() => ({
    canViewOwn: hasPermission(ROLE_PERMISSIONS.VIEW_OWN),
    canViewAny: hasPermission(ROLE_PERMISSIONS.VIEW_ANY),
    canCreate: hasPermission(ROLE_PERMISSIONS.CREATE),
    canUpdate: hasPermission(ROLE_PERMISSIONS.ROLE_UPDATE),
    canDelete: hasPermission(ROLE_PERMISSIONS.DELETE_ROLE),
    canAssignPermissionToRole: hasPermission(ROLE_PERMISSIONS.ASSIGN_PERMISSION_TO_ROLE),
    canRemovePermissionFromRole: hasPermission(ROLE_PERMISSIONS.REMOVE_PERMISSION_FROM_ROLE),
    canAssignUserToRole: hasPermission(ROLE_PERMISSIONS.ASSIGN_USER_TO_ROLE),
    canRemoveUserFromRole: hasPermission(ROLE_PERMISSIONS.REMOVE_USER_FROM_ROLE),
    canView: hasAnyPermission([ROLE_PERMISSIONS.VIEW_OWN, ROLE_PERMISSIONS.VIEW_ANY]),
    canManageRoles: hasAllPermissions([
      ROLE_PERMISSIONS.CREATE,
      ROLE_PERMISSIONS.ASSIGN_PERMISSION_TO_ROLE,
      ROLE_PERMISSIONS.REMOVE_PERMISSION_FROM_ROLE
    ]),
    canManageUsers: hasAllPermissions([
      ROLE_PERMISSIONS.ASSIGN_USER_TO_ROLE,
      ROLE_PERMISSIONS.REMOVE_USER_FROM_ROLE
    ])
  }))

  // Project permission helpers
  const projectPermissions = computed(() => ({
    canCreate: hasPermission(PROJECT_PERMISSIONS.CREATE),
    canAddUser: hasPermission(PROJECT_PERMISSIONS.ADD_USER),
    canUpdate: hasPermission(PROJECT_PERMISSIONS.UPDATE),
    canDelete: hasPermission(PROJECT_PERMISSIONS.DELETE),
    canDeleteUser: hasPermission(PROJECT_PERMISSIONS.DELETE_USER),
    canAssignRole: hasPermission(PROJECT_PERMISSIONS.ASSIGN_ROLE),
    canCreateRole: hasPermission(PROJECT_PERMISSIONS.CREATE_ROLE),
    canViewMember: hasPermission(PROJECT_PERMISSIONS.VIEW_MEMBER),
    canViewMemberQuotation: hasPermission(PROJECT_PERMISSIONS.VIEW_MEMBER_QUOTATION),
    canManageUsers: hasAllPermissions([
      PROJECT_PERMISSIONS.ADD_USER,
      PROJECT_PERMISSIONS.DELETE_USER,
      PROJECT_PERMISSIONS.ASSIGN_ROLE
    ])
  }))

  // Check if user has admin-level permissions
  const isAdmin = computed(() => {
    return hasAnyPermission(PERMISSION_GROUPS.ADMIN)
  })

  // Check if user has project manager permissions
  const isProjectManager = computed(() => {
    return hasAnyPermission(PERMISSION_GROUPS.PROJECT_MANAGER)
  })

  // Check if user is a basic user
  const isBasicUser = computed(() => {
    return hasAnyPermission(PERMISSION_GROUPS.USER) && !isAdmin.value && !isProjectManager.value
  })

  // Project-specific permission helpers
  const getProjectPermissions = (projectId) => ({
    canAddUser: hasProjectPermission(projectId, PROJECT_PERMISSIONS.ADD_USER),
    canUpdate: hasProjectPermission(projectId, PROJECT_PERMISSIONS.UPDATE),
    canDelete: hasProjectPermission(projectId, PROJECT_PERMISSIONS.DELETE),
    canDeleteUser: hasProjectPermission(projectId, PROJECT_PERMISSIONS.DELETE_USER),
    canAssignRole: hasProjectPermission(projectId, PROJECT_PERMISSIONS.ASSIGN_ROLE),
    canCreateRole: hasProjectPermission(projectId, PROJECT_PERMISSIONS.CREATE_ROLE),
    canViewMember: hasProjectPermission(projectId, PROJECT_PERMISSIONS.VIEW_MEMBER),
    canViewMemberQuotation: hasProjectPermission(projectId, PROJECT_PERMISSIONS.VIEW_MEMBER_QUOTATION),
    canManageUsers: hasProjectPermission(projectId, PROJECT_PERMISSIONS.ADD_USER) && 
                   hasProjectPermission(projectId, PROJECT_PERMISSIONS.DELETE_USER) &&
                   hasProjectPermission(projectId, PROJECT_PERMISSIONS.ASSIGN_ROLE)
  })

  // Helper to check multiple permissions at once
  const checkPermissions = (permissionChecks) => {
    const results = {}
    
    for (const [key, permission] of Object.entries(permissionChecks)) {
      if (Array.isArray(permission)) {
        results[key] = hasAnyPermission(permission)
      } else {
        results[key] = hasPermission(permission)
      }
    }
    
    return results
  }

  // Helper to get user role level
  const getUserRoleLevel = () => {
    if (isAdmin.value) return 'admin'
    if (isProjectManager.value) return 'project_manager'
    if (isBasicUser.value) return 'user'
    return 'guest'
  }

  return {
    // Original permission functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasProjectPermission,
    hasProjectAccess,
    permissions,
    isLoading,
    error,
    refetchPermissions,
    
    // Permission constants
    PERMISSIONS,
    PERMISSION_GROUPS,
    WORKLOG_PERMISSIONS,
    ROLE_PERMISSIONS,
    PROJECT_PERMISSIONS,
    
    // Computed permission helpers
    worklogPermissions,
    rolePermissions,
    projectPermissions,
    
    // Role level helpers
    isAdmin,
    isProjectManager,
    isBasicUser,
    getUserRoleLevel,
    
    // Utility functions
    getProjectPermissions,
    checkPermissions
  }
}