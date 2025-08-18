import { get, put, post, del } from "@/utils/requestClient.js"

/**
 * Fetch system configuration for a specific company
 * @param {number} companyId - The company ID
 * @returns {Promise<Object>} Object with system configuration data
 */
export const getSystemConfiguration = async (companyId) => {
  try {
    const response = await get(`/system-config/companies/${companyId}/system-configuration`)

    // The API returns { data: { work_hours_per_day, worklog_edit_time_limit_minutes, etc. } }
    return response.data || { data: {} }
  } catch (error) {
    console.error("API Error:", error)
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch system configuration")
  }
}

// New endpoint variant without company context if needed
export const getGlobalSystemConfiguration = async () => {
  try {
    const response = await get(`/system-config/system-configuration`)
    return response.data || { data: {} }
  } catch (error) {
    console.error("API Error:", error)
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch system configuration")
  }
}

/**
 * Update system configuration for a specific company
 * @param {number} companyId - The company ID
 * @param {Object} configData - The configuration data to update
 * @returns {Promise<Object>} Updated configuration data
 */
export const updateSystemConfiguration = async (companyId, configData) => {
  try {
    const response = await put(`/system-config/companies/${companyId}/system-configuration`, configData)

    return response.data || { data: {} }
  } catch (error) {
    console.error("API Error:", error)
    throw new Error(error.response?.data?.message || error.message || "Failed to update system configuration")
  }
}

export async function getWorklogCategories(companyId) {
  try {
    const response = await get(`/worklogs/categories?company_id=${companyId}`);
    return response?.data?.data;
  } catch (error) {
    console.error('Error fetching worklog categories:', error);
    return [];
  }
}

export async function getCategorySuggestions(companyId) {
  try {
    const response = await get(`/worklogs/category-suggestions/?company_id=${companyId}`);
    return response?.data?.data;
  } catch (error) {
    console.error('Error fetching category suggestions:', error);
    return [];
  }
}

export async function deleteWorklogCategory(categoryId) {
  try {
    await del(`/worklogs/categories/${categoryId}`);
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function updateWorklogCategory(categoryId, data) {
  try {
    const response = await put(`/worklogs/categories/${categoryId}`, data);
    return response?.data?.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function createWorklogCategory(data) {
  try {
    const response = await post('/worklogs/categories', data);
    return response?.data?.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function approveCategorySuggestion(suggestionId) {
  try {
    const response = await post(`/worklogs/category-suggestions/${suggestionId}/approve`);
    return response?.data?.data;
  } catch (error) {
    console.error('Error approving category suggestion:', error);
    throw error;
  }
}

export async function rejectCategorySuggestion(suggestionId) {
  try {
    const response = await post(`/category-suggestions/${suggestionId}/reject`);
    return response?.data?.data;
  } catch (error) {
    console.error('Error rejecting category suggestion:', error);
    throw error;
  }
}
