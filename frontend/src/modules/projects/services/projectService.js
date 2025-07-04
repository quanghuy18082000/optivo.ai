import { post } from '@/utils/requestClient.js'
import { getMockProjects } from "../data/mockData" // Import mock data

export const getProjects = async (params = {}) => {
  // For now, use mock data. In a real app, this would be an API call.
  // try {
  //   const response = await get('/projects', params)
  //   return response.data
  // } catch (error) {
  //   throw new Error(error.response?.data?.message || error.message || 'Failed to fetch projects')
  // }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return getMockProjects(params)
}

export const createProject = async (projectData) => {
  try {
    // For development, we'll simulate the API call
    console.log('Creating project with data:', projectData)
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Mock successful response
    const mockResponse = {
      project_id: Math.floor(Math.random() * 1000) + 1,
      project_name: projectData.project_name,
      start_time: projectData.start_time,
      end_time: projectData.end_time,
      status: 'active',
      quotation: projectData.quotation,
      plan: projectData.plan
    }
    
    return { data: mockResponse }
    
    // Uncomment this when the real API is available:
    // const response = await post('/projects', projectData)
    // return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create project')
  }
}

// You can add more project-related services here, e.g., updateProject, deleteProject