import { get, post, put, del } from '@/utils/requestClient.js'

/**
 * Create a new role
 * @param {Object} roleData - Role data
 * @param {string} roleData.name - Role name
 * @param {string} roleData.description - Role description
 * @param {number} roleData.company_id - Company ID
 * @returns {Promise<Object>} Created role object
 */
export const createRole = async (roleData) => {
  try {
    const response = await post('/system-config/roles', roleData)
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create role');
  }
}

/**
 * Get all roles
 * @param {Object} params - Query parameters
 * @param {number} params.company_id - Company ID to filter roles
 * @returns {Promise<Object>} Object with data array of role objects
 */
export const getRoles = async (params = {}) => {
  try {
    const response = await get('/system-config/roles', params )
    return response.data || { data: [] }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch roles');
  }
}

/**
 * Update a role
 * @param {number} roleId - Role ID
 * @param {Object} roleData - Updated role data
 * @returns {Promise<Object>} Updated role object
 */
export const updateRole = async (roleId, roleData) => {
  try {
    const response = await put(`/system-config/roles/${roleId}`, roleData)
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update role');
  }
}

/**
 * Delete a role
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} Success response
 */
export const deleteRole = async (roleId) => {
  try {
    const response = await del(`/system-config/roles/${roleId}`)
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete role');
  }
}

/**
 * Get role by ID with permissions
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} Object with role data including permissions
 */
export const getRoleById = async (roleId, params = {}) => {
  try {
    const response = await get(`/system-config/roles/${roleId}`, params)
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch role details');
  }
}

/**
 * Get all permissions
 * @returns {Promise<Object>} Object with data array of permission objects
 */
export const getPermissions = async () => {
  try {
    const response = await get('/system-config/permissions')
    return response.data || { data: [] }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch permissions');
  }
}

/**
 * Update role permissions
 * @param {number} roleId - Role ID
 * @param {Array<number>} permissionIds - Array of permission IDs to assign
 * @returns {Promise<Object>} Success response
 */
export const updateRolePermissions = async (roleId, permissionIds) => {
  try {
    const response = await post(`/system-config/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    })
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update role permissions');
  }
}

/**
 * Assign roles to a user
 * @param {number} userId - User ID
 * @param {Array<number>} roleIds - Array of role IDs to assign
 * @returns {Promise<Object>} Success response
 */
export const assignRolesToUser = async (userId, roleIds) => {
  try {
    const response = await post(`/system-config/users/${userId}/roles`, {
      role_ids: roleIds
    })
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to assign roles to user');
  }
}

/**
 * Unassign a role from a user
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID to unassign
 * @returns {Promise<Object>} Success response
 */
export const unassignRoleFromUser = async (userId, roleId) => {
  try {
    const response = await del(`/system-config/users/${userId}/roles/${roleId}`)
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to unassign role from user');
  }
}