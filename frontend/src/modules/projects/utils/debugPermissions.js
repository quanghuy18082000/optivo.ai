/**
 * Debug utilities for permission system
 */

export const debugRouteParams = (route) => {
  console.log('=== Route Debug Info ===')
  console.log('Route params:', route.params)
  console.log('Project ID:', route.params.projectId)
  console.log('Project ID type:', typeof route.params.projectId)
  console.log('Project ID value check:', {
    isUndefined: route.params.projectId === undefined,
    isNull: route.params.projectId === null,
    isStringUndefined: route.params.projectId === 'undefined',
    isStringNull: route.params.projectId === 'null',
    isEmpty: route.params.projectId === '',
    length: route.params.projectId?.length
  })
  console.log('Full route:', route)
}

export const debugPermissionCall = (projectId, userId) => {
  console.log('=== Permission Call Debug ===')
  console.log('Project ID:', projectId)
  console.log('User ID:', userId)
  console.log('Project ID type:', typeof projectId)
  console.log('User ID type:', typeof userId)
  console.log('Project ID parsed:', parseInt(projectId, 10))
  console.log('User ID parsed:', parseInt(userId, 10))
  console.log('Project ID is valid number:', !isNaN(parseInt(projectId, 10)) && parseInt(projectId, 10) > 0)
  console.log('User ID is valid number:', !isNaN(parseInt(userId, 10)) && parseInt(userId, 10) > 0)
}

export const debugAuthStore = (authStore) => {
  console.log('=== Auth Store Debug ===')
  console.log('Auth store:', authStore)
  console.log('User:', authStore.user)
  console.log('User ID:', authStore.user?.id)
  console.log('User ID type:', typeof authStore.user?.id)
  console.log('Is logged in:', !!authStore.user?.id)
}

export const debugPermissionResponse = (response) => {
  console.log('=== Permission Response Debug ===')
  console.log('Full response:', response)
  console.log('Response data:', response?.data)
  console.log('Permissions:', response?.data?.permissions)
  console.log('Roles:', response?.data?.roles)
  console.log('User ID:', response?.data?.user_id)
}

export default {
  debugRouteParams,
  debugPermissionCall,
  debugAuthStore,
  debugPermissionResponse
}