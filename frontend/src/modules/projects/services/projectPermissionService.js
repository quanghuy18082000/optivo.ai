import { get, post, put, del } from '@/utils/requestClient.js'

/**
 * Create a new project-specific role
 * @param {Object} roleData - Role data
 * @param {string} roleData.name - Role name
 * @param {string} roleData.description - Role description
 * @param {number} roleData.project_id - Project ID
 * @param {number} roleData.company_id - Company ID
 * @returns {Promise<Object>} Created role object
 */
export const createProjectRole = async (project_id, roleData) => {
  try {
    const response = await post('/projects/' + project_id +'/roles', roleData)
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create project role');
  }
}

/**
 * Get all roles for a specific project
 * @param {number} projectId - Project ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Object with data array of role objects
 */
export const getProjectRoles = async (projectId, params = {}) => {
  try {
    const response = await get(`/projects/${projectId}/roles`, params)
    return response.data || { data: [] }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch project roles');
  }
}

/**
 * Get role by ID with permissions for a project
 * @param {number} projectId - Project ID
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} Object with role data including permissions
 */
export const getProjectRoleById = async (projectId, roleId) => {
  try {
    const response = await get(`/projects/${projectId}/roles/${roleId}/permissions`)
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch project role details');
  }
}

/**
 * Update a project role
 * @param {number} projectId - Project ID
 * @param {number} roleId - Role ID
 * @param {Object} roleData - Updated role data
 * @returns {Promise<Object>} Updated role object
 */

export const updateProjectRole = async (projectId, roleId, roleData) => {
  try {
    const response = await put(`/projects/${projectId}/roles/${roleId}`, roleData)
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update project role');
  }
}

/**
 * Delete a project role
 * @param {number} projectId - Project ID
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} Success response
 */
export const deleteProjectRole = async (projectId, roleId) => {
  try {
    const response = await del(`/projects/${projectId}/roles/${roleId}`)
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete project role');
  }
}

/**
 * Update project role permissions
 * @param {number} projectId - Project ID
 * @param {number} roleId - Role ID
 * @param {Array<number>} permissionIds - Array of permission IDs to assign
 * @returns {Promise<Object>} Success response
 */
export const updateProjectRolePermissions = async (projectId, roleId, permissionIds) => {
  try {
    const response = await put(`/projects/${projectId}/roles/${roleId}/permissions`, permissionIds)
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update project role permissions');
  }
}

/**
 * Assign project roles to a user
 * @param {number} projectId - Project ID
 * @param {number} userId - User ID
 * @param {Array<number>} roleIds - Array of role IDs to assign
 * @returns {Promise<Object>} Success response
 */
export const assignProjectRolesToUser = async (projectId, userId, roleIds) => {
  try {
    const response = await put(`/projects/${projectId}/users/${userId}/roles`, {
      role_ids: roleIds
    })
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to assign project roles to user');
  }
}

/**
 * Unassign a project role from a user
 * @param {number} projectId - Project ID
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID to unassign
 * @returns {Promise<Object>} Success response
 */
export const unassignProjectRoleFromUser = async (projectId, userId, roleId) => {
  try {
    const response = await del(`/projects/${projectId}/users/${userId}/roles/${roleId}`)
    return response.data || { data: {} }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to unassign project role from user');
  }
}

/**
 * Get users with their roles in a specific project
 * @param {number} projectId - Project ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Object with data array of user objects with roles
 */
export const getProjectUsersWithRoles = async (projectId, params = {}) => {
  try {
    const response = await get(`/projects/${projectId}/users-roles`, params)
    return response.data || { data: [] }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch project users with roles');
  }
}

/**
 * Get user assignments for a project with pagination
 * @param {number} projectId - Project ID
 * @param {Object} params - Query parameters (page, limit, search, etc.)
 * @returns {Promise<Object>} Object with data array and pagination info
 */
export const getProjectUserAssignments = async (projectId, params = {}) => {
  try {
    const response = await get(`/projects/${projectId}/users/roles`, params)
    return response.data || { 
      data: [], 
      current_page: 1, 
      total_pages: 0, 
      total_count: 0,
      per_page: 10
    }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch project user assignments');
  }
}

/**
 * Get user's roles in a specific project
 * @param {number} projectId - Project ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Object with user's roles in the project
 */
export const getUserProjectRoles = async (projectId, userId) => {
  try {
    const response = await get(`/projects/${projectId}/users/${userId}/roles`)
    return response.data || { data: [] }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user project roles');
  }
}

/**
 * Get all projects for dropdown/selection
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Object with data array of project objects
 */
export const getProjectsForDropdown = async (params = {}) => {
  try {
    const response = await get('/projects/dropdown', params)
    return response.data || { data: [] }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch projects for dropdown');
  }
}

/**
 * Get user's permissions in a specific project
 * @param {number} projectId - Project ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Object with user's permissions and roles in the project
 */
export const getUserProjectPermissions = async (projectId, userId) => {
  try {
    // Validate inputs
    if (!projectId || projectId === 'undefined' || projectId === 'null') {
      throw new Error('Invalid project ID provided');
    }
    
    if (!userId || userId === 'undefined' || userId === 'null') {
      throw new Error('Invalid user ID provided');
    }

    // Convert to numbers if they're strings
    const validProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
    const validUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    // Check if conversion was successful
    if (isNaN(validProjectId) || validProjectId <= 0) {
      throw new Error('Project ID must be a valid positive number');
    }
    
    if (isNaN(validUserId) || validUserId <= 0) {
      throw new Error('User ID must be a valid positive number');
    }

    console.log('Fetching permissions for:', { projectId: validProjectId, userId: validUserId });
    
    const response = await get(`/projects/${validProjectId}/users/${validUserId}/permissions`)
    return response.data || { data: { user_id: validUserId, permissions: [], roles: [] } }
  } catch (error) {
    console.error('getUserProjectPermissions error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user project permissions');
  }
}

// Re-export permissions service from global roleService
export { getPermissions } from '@/services/roleService.js'