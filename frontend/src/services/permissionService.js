import { getUserPermissions } from '@/services/systemService.js'

// Global permissions cache
let permissionsCache = {
  globalRoles: [],
  projectAccess: [],
  allPermissions: [],
  lastFetched: null,
  isLoading: false
}

// Cache duration (2 minutes) - reduced for more frequent updates
const CACHE_DURATION = 2 * 60 * 1000

/**
 * Extract all permission names from API response
 */
const extractAllPermissionNames = (data) => {
  const permissionSet = new Set()

  // Add permissions from global_roles
  if (data?.global_roles && Array.isArray(data.global_roles)) {
    data.global_roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(permission => {
          permissionSet.add(permission.name)
        })
      }
    })
  }

  // Add permissions from project access
  if (data?.project_access && Array.isArray(data.project_access)) {
    data.project_access.forEach(project => {
      if (project.permission_names && Array.isArray(project.permission_names)) {
        project.permission_names.forEach(permName => {
          permissionSet.add(permName)
        })
      }
    })
  }

  return Array.from(permissionSet)
}

/**
 * Fetch and cache user permissions
 */
export const fetchUserPermissions = async (forceRefresh = false) => {
  const now = Date.now()
  const cacheAge = permissionsCache.lastFetched ? now - permissionsCache.lastFetched : null
  
  console.log('🔍 fetchUserPermissions called:', { 
    forceRefresh, 
    cacheAge: cacheAge ? `${Math.round(cacheAge / 1000)}s` : 'no cache',
    cacheValid: cacheAge ? cacheAge < CACHE_DURATION : false
  })
  
  // Return cached data if still valid and not forcing refresh
  if (!forceRefresh && 
      permissionsCache.lastFetched && 
      (now - permissionsCache.lastFetched) < CACHE_DURATION) {
    console.log('🔍 Using cached permissions (age:', Math.round(cacheAge / 1000), 'seconds)')
    return permissionsCache
  }

  // Prevent multiple simultaneous requests
  if (permissionsCache.isLoading) {
    console.log('🔍 Permissions already loading, waiting...')
    // Wait for current request to complete
    while (permissionsCache.isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return permissionsCache
  }

  try {
    console.log('🔍 Fetching fresh permissions from API (force:', forceRefresh, ')')
    permissionsCache.isLoading = true
    
    const response = await getUserPermissions()
    console.log('🔍 Raw API Response:', response)
    
    if (response?.data) {
      // Transform API response
      const transformedPermissions = {
        globalRoles: response.data.global_roles || [],
        projectAccess: response.data.project_access || [],
        allPermissions: extractAllPermissionNames(response.data),
        lastFetched: now,
        isLoading: false
      }
      
      console.log('🔄 Transformed Permissions:', transformedPermissions)
      console.log('📊 Permission Summary:', {
        globalRoles: transformedPermissions.globalRoles.length,
        projectAccess: transformedPermissions.projectAccess.length,
        allPermissions: transformedPermissions.allPermissions.length
      })
      
      // Update cache
      permissionsCache = transformedPermissions
      
      return permissionsCache
    } else {
      throw new Error('Invalid API response structure')
    }
  } catch (error) {
    console.error('❌ Failed to fetch permissions:', error)
    permissionsCache.isLoading = false
    throw error
  }
}

/**
 * Check if user has a global permission
 */
export const hasGlobalPermission = (permissionName) => {
  console.log('🔍 Checking global permission:', permissionName)
  console.log('🔍 Available global roles:', permissionsCache.globalRoles)
  
  if (!permissionsCache.globalRoles || !Array.isArray(permissionsCache.globalRoles)) {
    console.log('❌ No global roles available')
    return false
  }
  
  const hasPermission = permissionsCache.globalRoles.some(role => 
    role.permissions && role.permissions.some(p => p.name === permissionName)
  )
  
  console.log('✅ Global permission check result:', hasPermission)
  return hasPermission
}

/**
 * Check if user has a specific permission (global OR project-specific)
 */
export const hasPermission = (permissionName, projectId = null) => {
  // Check global permission first
  if (hasGlobalPermission(permissionName)) {
    return true
  }
  
  // If projectId provided, check project-specific permission
  if (projectId) {
    return hasProjectPermission(projectId, permissionName)
  }
  
  // Check if permission exists in any project
  return permissionsCache.allPermissions?.includes(permissionName) || false
}

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (permissionNames) => {
  if (!Array.isArray(permissionNames)) {
    return false
  }
  
  return permissionNames.some(name => hasPermission(name))
}

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (permissionNames) => {
  if (!Array.isArray(permissionNames)) {
    return false
  }
  
  return permissionNames.every(name => hasPermission(name))
}

/**
 * Check if user has a specific permission for a project
 */
export const hasProjectPermission = (projectId, permissionName) => {
  const project = permissionsCache.projectAccess?.find(p => 
    p.project_id.toString() === projectId.toString()
  )
  
  return project && project.permission_names && 
    project.permission_names.includes(permissionName)
}

/**
 * Clear permissions cache
 */
export const clearPermissionsCache = () => {
  console.log('🔄 Clearing permissions cache')
  permissionsCache = {
    globalRoles: [],
    projectAccess: [],
    allPermissions: [],
    lastFetched: null,
    isLoading: false
  }
}

/**
 * Get current permissions cache
 */
export const getPermissionsCache = () => {
  return { ...permissionsCache }
}