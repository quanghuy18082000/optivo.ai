import { get, post, put, del } from '@/utils/requestClient.js'
import { useToast } from '@/composables/useToast'

const toast = useToast()

export const getProjects = async (requestBody = {}) => {
  try {
    // Use the real API endpoint
    const response = await post('/projects/members-detail', requestBody)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
  }
}

export const getProjectById = async (projectId) => {
  try {
    // Use the real API endpoint
    const response = await get(`/projects/${projectId}`)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch project details')
  }
}
export const createProject = async (projectData) => {
  try {
    
    // Use the real API endpoint
    const response = await post('/projects/', projectData)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create project')
  }
}

export const updateProject = async (projectId, projectData) => {
  try {
    // Use the real API endpoint
    const response = await put(`/projects/${projectId}`, projectData)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update project')
  }
}
/**
 * Delete a project by ID
 * @param {string|number} projectId - The ID of the project to delete
 * @returns {Promise<Object>} - The response data
 */
export const deleteProject = async (projectId) => {
  try {
    // Use the real API endpoint
    const response = await del(`/projects/${projectId}`)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    toast.error("Failed to delete project. Please try again.")
    // Rethrow the error so it can be caught by the calling function
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete project')
  }
}