import { get } from '@/utils/requestClient.js'

/**
 * Fetch all positions from the API
 * @returns {Promise<Object>} Object with data array of position objects with id, name, and description
 */
export const getPositions = async () => {
  try {  
    const response = await get('/system-config/positions/')
    
    // The API returns { data: [{ id: 0, name: "string", description: "string" }] }
    return response.data || { data: [] }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch positions');
  }
}

/**
 * Fetch current user's combined roles and permissions
 * @returns {Promise<Object>} Object with data containing roles, permissions and project access
 */
export const getUserPermissions = async () => {
  try {
    const response = await get('/system-config/users/combined-roles/me')
    
    // The API returns complex permission structure with roles and project access
    return response.data || { data: { roles: [], project_access: [] } }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user permissions');
  }
}