/**
 * Permission constants for the application
 * These should match the backend permission enums
 */

export const WORKLOG_PERMISSIONS = {
  CREATE: "worklog.create",
  VIEW_OWN: "worklog.view_own",
  VIEW_ANY: "worklog.view_any",
  UPDATE_OWN: "worklog.update_own",
  UPDATE_ANY: "worklog.update_any",
  DELETE_OWN: "worklog.delete_own",
  DELETE_ANY: "worklog.delete_any"
}

export const ROLE_PERMISSIONS = {
  VIEW_OWN: "role_permission.view_own",
  VIEW_ANY: "role_permission.view_any",
  CREATE: "role_permission.create",
  ASSIGN_PERMISSION_TO_ROLE: "role_permission.assign_permission_to_role",
  REMOVE_PERMISSION_FROM_ROLE: "role_permission.remove_permission_from_role",
  ASSIGN_USER_TO_ROLE: "role_permission.assign_user_to_role",
  REMOVE_USER_FROM_ROLE: "role_permission.remove_user_from_role",
  DELETE_ROLE: "role_permission.delete_role",
  ROLE_UPDATE: "role_permission.role_update"
}

export const PROJECT_PERMISSIONS = {
  CREATE: "project.create",
  ADD_USER: "project.add_user",
  UPDATE: "project.update",
  DELETE_USER: "project.delete_user",
  ASSIGN_ROLE: "project.assign_role",
  CREATE_ROLE: "project.create_role",
  VIEW_MEMBER: "project.view_member",
  VIEW_MEMBER_QUOTATION: "project.view_member_quotation",
  DELETE: "project.delete"
}

export const SYSTEM_CONFIG_PERMISSIONS = {
  COMPANY_VIEW: "system_config_company.view",
  COMPANY_UPDATE: "system_config_company.update"
}



// Combined permissions object for easy access
export const PERMISSIONS = {
  WORKLOG: WORKLOG_PERMISSIONS,
  ROLE: ROLE_PERMISSIONS,
  PROJECT: PROJECT_PERMISSIONS,
  SYSTEM_CONFIG: SYSTEM_CONFIG_PERMISSIONS
}

// Helper function to get all permissions as an array
export const getAllPermissions = () => {
  return [
    ...Object.values(WORKLOG_PERMISSIONS),
    ...Object.values(ROLE_PERMISSIONS),
    ...Object.values(PROJECT_PERMISSIONS),
    ...Object.values(SYSTEM_CONFIG_PERMISSIONS)
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
    case 'system_config':
      return Object.values(SYSTEM_CONFIG_PERMISSIONS)
    default:
      return []
  }
}

// Permission display names mapping
export const PERMISSION_DISPLAY_NAMES = {
  // Worklog permissions
  "worklog.create": "Create Worklog",
  "worklog.view_own": "View Own Worklog",
  "worklog.view_any": "View Any Worklog",
  "worklog.update_own": "Update Own Worklog",
  "worklog.update_any": "Update Any Worklog",
  "worklog.delete_own": "Delete Own Worklog",
  "worklog.delete_any": "Delete Any Worklog",

  // Role permissions
  "role_permission.view_own": "View Own Roles",
  "role_permission.view_any": "View Any Roles",
  "role_permission.create": "Create Role",
  "role_permission.assign_permission_to_role": "Assign Permission to Role",
  "role_permission.remove_permission_from_role": "Remove Permission from Role",
  "role_permission.assign_user_to_role": "Assign User to Role",
  "role_permission.remove_user_from_role": "Remove User from Role",
  "role_permission.delete_role": "Delete Role",
  "role_permission.role_update": "Update Role",

  // Project permissions
  "project.create": "Create Project",
  "project.add_user": "Add User to Project",
  "project.update": "Update Project",
  "project.delete_user": "Remove User from Project",
  "project.assign_role": "Assign Role in Project",
  "project.create_role": "Create Project Role",
  "project.view_member": "View Project Members",
  "project.view_member_quotation": "View Member Quotation",
  "project.delete": "Delete Project",

  // System config permissions
  "system_config_company.view": "View Company Settings",
  "system_config_company.update": "Update Company Settings"
}

// Scope display names mapping
export const SCOPE_DISPLAY_NAMES = {
  "global": "Global Permissions",
  "worklog": "Work Log Management",
  "role_permission": "Role & Permission Management", 
  "project": "Project Management",
  "system_config_company": "System Configuration"
}

// Helper function to get display name for permission
export const getPermissionDisplayName = (permissionName) => {
  return PERMISSION_DISPLAY_NAMES[permissionName] || formatPermissionName(permissionName)
}

// Helper function to get display name for scope
export const getScopeDisplayName = (scope) => {
  return SCOPE_DISPLAY_NAMES[scope] || formatScopeName(scope)
}

// Fallback formatting functions
const formatPermissionName = (permissionName) => {
  const parts = permissionName.split(".");
  if (parts.length >= 2) {
    const action = parts[parts.length - 1];
    const module = parts.slice(0, -1).join(" ");

    const formattedAction = action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, " ");
    const formattedModule = module.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    return `${formattedAction} ${formattedModule}`;
  }

  return permissionName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

const formatScopeName = (scope) => {
  return scope.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
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
    PROJECT_PERMISSIONS.VIEW_MEMBER,
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
    PROJECT_PERMISSIONS.VIEW_MEMBER,
    ROLE_PERMISSIONS.VIEW_OWN
  ]
}