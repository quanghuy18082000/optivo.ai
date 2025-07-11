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
    const response = await get('/projects/')
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
    // If date is provided, add it as a query parameter
    const url = date ? `/worklogs?date=${date}` : '/worklogs';
    const response = await post(url, worklogData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create worklog');
  }
}

export const createWorklogBatch = async (worklogsData, date) => {
  try {
    // If date is provided, add it as a query parameter
    const url = date ? `/worklogs/batch?date=${date}` : '/worklogs/batch';
    const response = await post(url, worklogsData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create batch worklogs');
  }
}

export const updateWorklogBatch = async (worklogsData, date) => {
  try {
    
    // If date is provided, add it as a query parameter
    const url = date ? `/worklogs/batch?date=${date}` : '/worklogs/batch';
    
    const response = await put(url, worklogsData);
    
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