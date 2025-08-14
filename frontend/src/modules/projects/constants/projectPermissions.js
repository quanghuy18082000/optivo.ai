/**
 * Project-specific permission constants
 */
export const PROJECT_PERMISSIONS = {
  // Basic project permissions
  VIEW: 'project.view',
  UPDATE: 'project.update', // Changed from EDIT to UPDATE
  DELETE: 'project.delete',
  
  // Quotation permissions
  UPDATE_QUOTATION: 'project.update_quotation', // Changed from EDIT_QUOTATION
  VIEW_QUOTATION: 'project.view_quotation',
  
  // Plan permissions
  UPDATE_PLAN: 'project.update_plan', // Changed from EDIT_PLAN
  VIEW_PLAN: 'project.view_plan',
  
  // Role management permissions
  CREATE_ROLE: 'project.create_role',
  EDIT_ROLE: 'project.edit_role',
  DELETE_ROLE: 'project.delete_role',
  ASSIGN_ROLE: 'project.assign_role',
  
  // User management permissions
  ADD_USER: 'project.add_user',
  DELETE_USER: 'project.delete_user',
  VIEW_USERS: 'project.view_users',
  
  // Member permissions (for viewing project members)
  VIEW_MEMBER: 'project.view_member',
  VIEW_MEMBER_QUOTATION: 'project.view_member_quotation'
}

/**
 * Permission groups for easier management
 */
export const PERMISSION_GROUPS = {
  PROJECT_MANAGEMENT: [
    PROJECT_PERMISSIONS.VIEW,
    PROJECT_PERMISSIONS.UPDATE,
    PROJECT_PERMISSIONS.DELETE
  ],
  
  QUOTATION_MANAGEMENT: [
    PROJECT_PERMISSIONS.VIEW_QUOTATION,
    PROJECT_PERMISSIONS.UPDATE_QUOTATION,
    PROJECT_PERMISSIONS.VIEW_MEMBER_QUOTATION
  ],
  
  PLAN_MANAGEMENT: [
    PROJECT_PERMISSIONS.VIEW_PLAN,
    PROJECT_PERMISSIONS.UPDATE_PLAN
  ],
  
  ROLE_MANAGEMENT: [
    PROJECT_PERMISSIONS.CREATE_ROLE,
    PROJECT_PERMISSIONS.EDIT_ROLE,
    PROJECT_PERMISSIONS.DELETE_ROLE,
    PROJECT_PERMISSIONS.ASSIGN_ROLE
  ],
  
  USER_MANAGEMENT: [
    PROJECT_PERMISSIONS.ADD_USER,
    PROJECT_PERMISSIONS.DELETE_USER,
    PROJECT_PERMISSIONS.VIEW_USERS
  ]
}

export default PROJECT_PERMISSIONS