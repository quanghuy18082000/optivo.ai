import { get } from '@/utils/requestClient.js'

/**
 * Fetch users from the API with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.size - Page size (default: 10)
 * @returns {Promise<Object>} Object with message, data array and pagination info
 */
export const getUsers = async (params = {}) => {
  try {
    // Set default pagination
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10,
      ...params, // Spread other params like search, etc.
    };

    const response = await get('/users/', queryParams );
    
    // The API returns { 
    //   message: "string", 
    //   data: [{ user_id: 0, name: "string" }],
    //   pagination: { page, size, total, total_pages, has_next, has_previous }
    // }
    return response.data || { message: "Success", data: [], pagination: {} };
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users');
  }
}

/**
 * Fetch all users for dropdown/select components (no pagination)
 * @param {Object} params - Query parameters (optional search, etc.)
 * @returns {Promise<Object>} Object with message and data array
 */
export const getUsersForDropdown = async (params = {}) => {
  try {
    // Set large size to get all users for dropdown
    const queryParams = {
      page: 1,
      size: 100, // Large number to get all users
      ...params, // Spread other params like search, etc.
    };

    const response = await get('/users/', queryParams );
    
    // Return the same format as getUsers but with all users
    return response.data || { message: "Success", data: [], pagination: {} };
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users for dropdown');
  }
}