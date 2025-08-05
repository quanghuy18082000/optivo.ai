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