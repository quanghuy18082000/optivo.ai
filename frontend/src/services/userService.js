import { get } from '@/utils/requestClient.js'

/**
 * Fetch all users from the API
 * @returns {Promise<Object>} Object with message and data array of user objects with user_id and name
 */
export const getUsers = async () => {
  try {  
    const response = await get('/users/')
    
    // The API returns { message: "string", data: [{ user_id: 0, name: "string" }] }
    // We want to return this structure directly
    return response.data || { message: "Success", data: [] }
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users');
  }
}