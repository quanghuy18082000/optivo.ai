/**
 * Permission constants for the application
 * These should match the backend permission enums
 */

export const WORKLOG_PERMISSIONS = {
  CREATE: "worklog.create",
  VIEW_OWN: "worklog.view_own",
  VIEW_ANY: "worklog.view_any",
  UPDATE_ANY: "worklog.update_any",
  UPDATE_OWN: "worklog.update_own",
  DELETE_ANY: "worklog.delete_any",
  DELETE_OWN: "worklog.delete_own"
}

export const ROLE_PERMISSIONS = {
  VIEW_OWN: "role_permission.view_own",
  VIEW_ANY: "role_permission.view_any",
  CREATE: "role_permission.create",
  ASSIGN_PERMISSION_TO_ROLE: "role_permission.assign_permission_to_role",
  REMOVE_PERMISSION_FROM_ROLE: "role_permission.remove_permission_from_role",
  ASSIGN_USER_TO_ROLE: "role_permission.assign_user_to_role",
  REMOVE_USER_FROM_ROLE: "role_permission.remove_user_from_role"
}

export const PROJECT_PERMISSIONS = {
  CREATE: "project.create",
  ADD_USER: "project.add_user",
  UPDATE_PROJECT: "project.update_project",
  DELETE_USER: "project.delete_user",
  ASSIGN_ROLE: "project.assign_role",
  CREATE_ROLE: "project.create_role",
  VIEW_MEMBER_OWN: "project.view_member_own",
  VIEW_MEMBER_ANY: "project.view_member_any"
}

// Combined permissions object for easy access
export const PERMISSIONS = {
  WORKLOG: WORKLOG_PERMISSIONS,
  ROLE: ROLE_PERMISSIONS,
  PROJECT: PROJECT_PERMISSIONS
}

// Helper function to get all permissions as an array
export const getAllPermissions = () => {
  return [
    ...Object.values(WORKLOG_PERMISSIONS),
    ...Object.values(ROLE_PERMISSIONS),
    ...Object.values(PROJECT_PERMISSIONS)
  ]
}

// Helper function to get permissions by category
export const getPermissionsByCategory = (category) => {
  switch (category.toLowerCase()) {
    case 'worklog':
      return Object.values(WORKLOG_PERMISSIONS)
    case 'role':
      return Object.values(ROLE_PERMISSIONS)
    case 'project':
      return Object.values(PROJECT_PERMISSIONS)
    default:
      return []
  }
}

// Permission groups for common use cases
export const PERMISSION_GROUPS = {
  // Admin permissions
  ADMIN: [
    ROLE_PERMISSIONS.CREATE,
    ROLE_PERMISSIONS.ASSIGN_PERMISSION_TO_ROLE,
    ROLE_PERMISSIONS.REMOVE_PERMISSION_FROM_ROLE,
    ROLE_PERMISSIONS.ASSIGN_USER_TO_ROLE,
    ROLE_PERMISSIONS.REMOVE_USER_FROM_ROLE,
    PROJECT_PERMISSIONS.CREATE,
    PROJECT_PERMISSIONS.CREATE_ROLE
  ],
  
  // Project manager permissions
  PROJECT_MANAGER: [
    PROJECT_PERMISSIONS.ADD_USER,
    PROJECT_PERMISSIONS.DELETE_USER,
    PROJECT_PERMISSIONS.ASSIGN_ROLE,
    PROJECT_PERMISSIONS.VIEW_MEMBER_ANY,
    WORKLOG_PERMISSIONS.VIEW_ANY,
    WORKLOG_PERMISSIONS.UPDATE_ANY,
    WORKLOG_PERMISSIONS.DELETE_ANY
  ],
  
  // Basic user permissions
  USER: [
    WORKLOG_PERMISSIONS.CREATE,
    WORKLOG_PERMISSIONS.VIEW_OWN,
    WORKLOG_PERMISSIONS.UPDATE_OWN,
    WORKLOG_PERMISSIONS.DELETE_OWN,
    PROJECT_PERMISSIONS.VIEW_MEMBER_OWN,
    ROLE_PERMISSIONS.VIEW_OWN
  ]
}