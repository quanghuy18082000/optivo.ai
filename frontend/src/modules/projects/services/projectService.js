import { get, post, put, del } from '@/utils/requestClient.js'
import { useToast } from '@/composables/useToast'

const toast = useToast()

export const getProjects = async (params = {}) => {
  try {
    // // Use the real API endpoint
    // const response = await get('/projects/', params)
    // return response.data

    return [
      {
        "project_id": 1,
        "project_name": "Project 1",
        "workload_member_detail": [
          {
            "member": {
              "id": 1,
              "user_name": "Tan",
              "position": {
                "id": 1,
                "name": "Dev Backend"
              }
            },
            "plan": [
              {
                "start_date": "2025-07-10",
                "end_date": "2025-08-10",
                "allocation_rate": 0.3
              }
            ],
            "quotation": [
              {
                "start_date": "2025-06-10",
                "end_date": "2025-09-10",
                "allocation_rate": 0.5
              }
            ],
            "actual": [
              {
                "start_date": "2025-07-14",
                "end_date": "2025-07-20",
                "allocation_rate": 0.5
              },
              {
                "start_date": "2025-07-21",
                "end_date": "2025-07-27",
                "allocation_rate": 0.5
              },
              {
                "start_date": "2025-07-28",
                "end_date": "2025-08-03",
                "allocation_rate": 0.5
              },
              {
                "start_date": "2025-08-04",
                "end_date": "2025-08-10",
                "allocation_rate": 0.5
              }
            ]
          },
          {
            "member": {
              "id": 1,
              "user_name": "Tan",
              "position": {
                "id": 2,
                "name": "Dev Frontend"
              }
            },
            "plan": [
              {
                "start_date": "2025-07-10",
                "end_date": "2025-08-10",
                "allocation_rate": 0.3
              }
            ],
            "quotation": [
              {
                "start_date": "2025-06-10",
                "end_date": "2025-06-10",
                "allocation_rate": 0.5
              }
            ],
            "actual": [
              {
                "start_date": "2025-07-14",
                "end_date": "2025-07-20",
                "allocation_rate": 0.5
              }
            ]
          },
          {
            "member": {
              "id": 2,
              "user_name": "Linh",
              "position": {
                "id": 3,
                "name": "UI/UX Designer"
              }
            },
            "plan": [
              {
                "start_date": "2025-07-15",
                "end_date": "2025-08-20",
                "allocation_rate": 0.4
              },
              {
                "start_date": "2025-08-21",
                "end_date": "2025-09-10",
                "allocation_rate": 0.2
              }
            ],
            "quotation": [
              {
                "start_date": "2025-06-12",
                "end_date": "2025-06-18",
                "allocation_rate": 0.6
              },
              {
                "start_date": "2025-06-19",
                "end_date": "2025-06-25",
                "allocation_rate": 0.4
              }
            ],
            "actual": [
              {
                "start_date": "2025-07-14",
                "end_date": "2025-07-20",
                "allocation_rate": 0.5
              }
            ]
          }
        ]
      }
    ];
  } catch (error) {
    console.error('API Error:', error);
    
    // Return mock data for testing

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