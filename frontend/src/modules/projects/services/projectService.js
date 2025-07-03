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

// You can add more project-related services here, e.g., createProject, updateProject, deleteProject
