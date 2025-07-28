import { get, put } from "@/utils/requestClient.js"

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
