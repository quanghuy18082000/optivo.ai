import { get, post, put, del } from '@/utils/requestClient.js'

export const getWorklogs = async (params = {}) => {
  try {  
    const response = await get('/api/worklogs', params)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch worklogs')
  }
}

export const getProjects = async () => {
  try {
    const response = await get('/api/projects')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch projects')
  }
}

export const getCategories = async () => {
  try {
    const response = await get('/api/categories')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch categories')
  }
}

export const createWorklog = async (worklogData) => {
  try {
    const response = await post('/api/worklogs', worklogData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to create worklog')
  }
}

export const updateWorklog = async (id, worklogData) => {
  try {
    const response = await put(`/api/worklogs/${id}`, worklogData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update worklog')
  }
}

export const deleteWorklog = async (id) => {
  try {
    const response = await del(`/api/worklogs/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete worklog')
  }
}