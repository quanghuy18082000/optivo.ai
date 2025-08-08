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

// Debounce mechanism to prevent too frequent API calls
let debounceTimer = null
const DEBOUNCE_DELAY = 500 // 0.5 second

// Track last route to avoid unnecessary calls
let lastRoute = null

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
 * Check if we need to fetch permissions for this route
 */
export const shouldFetchPermissionsForRoute = (routePath, forceRefresh = false) => {
  const now = Date.now()
  const cacheAge = permissionsCache.lastFetched ? now - permissionsCache.lastFetched : null
  
  // Always fetch if forced or no cache
  if (forceRefresh || !permissionsCache.lastFetched) {
    return true
  }
  
  // Fetch if cache is expired
  if (cacheAge && cacheAge > CACHE_DURATION) {
    return true
  }
  
  // Fetch if route changed (different route might need different permissions)
  if (lastRoute !== routePath) {
    lastRoute = routePath
    return true
  }
  
  return false
}

/**
 * Fetch and cache user permissions with debounce
 */
export const fetchUserPermissionsDebounced = async (forceRefresh = false) => {
  return new Promise((resolve, reject) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // Set new timer
    debounceTimer = setTimeout(async () => {
      try {
        const result = await fetchUserPermissions(forceRefresh)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }, DEBOUNCE_DELAY)
  })
}

/**
 * Fetch and cache user permissions
 */
export const fetchUserPermissions = async (forceRefresh = false) => {
  const now = Date.now()
  const cacheAge = permissionsCache.lastFetched ? now - permissionsCache.lastFetched : null
  
  // Return cached data if still valid and not forcing refresh
  if (!forceRefresh && 
      permissionsCache.lastFetched && 
      (now - permissionsCache.lastFetched) < CACHE_DURATION) {
    return permissionsCache
  }

  // Prevent multiple simultaneous requests
  if (permissionsCache.isLoading) {
    console.log('⏳ Permission request already in progress, waiting...')
    // Wait for current request to complete with timeout
    let waitTime = 0
    const maxWaitTime = 10000 // 10 seconds max wait
    while (permissionsCache.isLoading && waitTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100))
      waitTime += 100
    }
    
    if (waitTime >= maxWaitTime) {
      console.warn('⚠️ Permission request timeout, resetting loading state')
      permissionsCache.isLoading = false
    }
    
    return permissionsCache
  }

  try {
    console.log('🔄 Fetching user permissions from API...', { forceRefresh, cacheAge: cacheAge ? `${Math.round(cacheAge / 1000)}s` : 'none' })
    permissionsCache.isLoading = true
    
    const response = await getUserPermissions()
    
    if (response?.data) {
      // Transform API response
      const transformedPermissions = {
        globalRoles: response.data.global_roles || [],
        projectAccess: response.data.project_access || [],
        allPermissions: extractAllPermissionNames(response.data),
        lastFetched: now,
        isLoading: false
      }
      
      // Update cache
      permissionsCache = transformedPermissions
      console.log('✅ Permissions cached successfully', { 
        globalRoles: transformedPermissions.globalRoles.length,
        projectAccess: transformedPermissions.projectAccess.length,
        allPermissions: transformedPermissions.allPermissions.length
      })
      
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
  if (!permissionsCache.globalRoles || !Array.isArray(permissionsCache.globalRoles)) {
    return false
  }
  
  const hasPermission = permissionsCache.globalRoles.some(role => 
    role.permissions && role.permissions.some(p => p.name === permissionName)
  )
  
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
  
  console.log(`🔍 Checking permission "${permissionName}" for project ${projectId}:`, {
    projectFound: !!project,
    projectPermissions: project?.permission_names || [],
    hasPermission: project && project.permission_names && project.permission_names.includes(permissionName)
  })
  
  return project && project.permission_names && 
    project.permission_names.includes(permissionName)
}

/**
 * Clear permissions cache
 */
export const clearPermissionsCache = () => {
  // Clear debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  
  // Reset route tracking
  lastRoute = null
  
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