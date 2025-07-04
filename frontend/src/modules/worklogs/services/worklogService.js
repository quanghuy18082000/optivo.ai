import { get, post, put, del } from '@/utils/requestClient.js'

export const getWorklogs = async (params = {}) => {
  try {  
    const response = await get('/worklogs/', params)
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

export const getProjects = async () => {
  try {
    const response = await get('/projects')
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

export const createWorklog = async (worklogData) => {
  try {
    const response = await post('/worklogs', worklogData)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create worklog')
  }
}

export const updateWorklog = async (id, worklogData) => {
  try {
    const response = await put(`/worklogs/${id}`, worklogData)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update worklog')
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

export const deleteWorklogEntry = async (worklogId, entryId) => {
  try {
    const response = await del(`/worklogs/${worklogId}/entries/${entryId}`)
    return response.data
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete worklog entry')
  }
}