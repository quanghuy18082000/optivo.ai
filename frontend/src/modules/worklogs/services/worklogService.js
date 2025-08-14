import { get, post, put, del } from '@/utils/requestClient.js'

export const getWorklogs = async (params = {}) => {
  try {  
    const response = await get('/worklogs/list/grouped-by-date', params)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch worklogs');
  }
}

export const getWorklogById = async (id) => {
  try {
    const response = await get(`/worklogs/${id}`)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch worklog details');
  }
}

export const getWorklogDetailsByDate = async (date) => {
  try {
    const response = await get('/worklogs/details/by-date', { date })
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch worklog details by date');
  }
}

export const getProjects = async () => {
  try {
    const response = await get('/projects/me')
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch projects');
  }
}

export const getCategories = async () => {
  try {
    const response = await get('/worklogs/categories')
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch categories');
  }
}

export const createWorklog = async (worklogData, date) => {
  try {
    const config = date ? { params: { date } } : {};
    const response = await post('/worklogs', worklogData, config);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create worklog');
  }
}

export const createWorklogBatch = async (worklogsData, date) => {
  try {
    const config = date ? { params: { date } } : {};
    const response = await post('/worklogs/batch', worklogsData, config);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create batch worklogs');
  }
}

export const updateWorklogBatch = async (worklogsData, date) => {
  try {
    const config = date ? { params: { date } } : {};
    const response = await put('/worklogs/batch', worklogsData, config);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update batch worklogs');
  }
}

export const deleteWorklog = async (id) => {
  try {
    const response = await del(`/worklogs/${id}`)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete worklog')
  }
}

export const deleteWorklogEntry = async (worklogId, projectId) => {
  try {
    const response = await del(`/worklogs/${worklogId}/project/${projectId}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete worklog entry')
  }
}

// Enhanced getWorklogs with array parameter support
export const getWorklogsWithFilters = async (filters = {}) => {
  try {
    // Example filters:
    // {
    //   projectIds: [1, 2, 3, 4],
    //   categoryIds: [10, 20],
    //   startDate: '2024-01-01',
    //   endDate: '2024-01-31',
    //   userId: 123
    // }
    // Will generate: /worklogs/list/grouped-by-date?projectIds[]=1&projectIds[]=2&projectIds[]=3&projectIds[]=4&categoryIds[]=10&categoryIds[]=20&startDate=2024-01-01&endDate=2024-01-31&userId=123
    
    const response = await get('/worklogs/list/grouped-by-date', filters)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch filtered worklogs');
  }
}

// Get projects with filtering support
export const getProjectsWithFilters = async (filters = {}) => {
  try {
    // Example filters:
    // {
    //   status: ['active', 'pending'],
    //   teamIds: [1, 2, 3],
    //   search: 'project name'
    // }
    // Will generate: /projects?status[]=active&status[]=pending&teamIds[]=1&teamIds[]=2&teamIds[]=3&search=project%20name
    
    const response = await get('/projects', filters)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch filtered projects');
  }
}