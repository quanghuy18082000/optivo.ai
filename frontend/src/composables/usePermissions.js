import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getUserPermissions } from '@/services/systemConfigService.js'

export function usePermissions() {
  const permissions = ref({
    roles: [],
    permissionNames: [],
    projectAccess: []
  })

  const isLoading = ref(false)
  const error = ref(null)

  // Fetch user permissions using vue-query
  const { refetch } = useQuery({
    queryKey: ['userPermissions'],
    queryFn: async () => {
      try {
        isLoading.value = true
        const response = await getUserPermissions()

        
        if (response) {
          // Transform API response to our internal format
          permissions.value = {
            roles: response.data.global_roles || [],
            permissionNames: extractAllPermissionNames(response),
            projectAccess: response.data.project_access || []
          }
        }
        
        return response
      } catch (err) {
        error.value = err.message || 'Failed to load permissions'
        throw err
      } finally {
        isLoading.value = false
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })

  // Extract all permission names from roles and project access
  const extractAllPermissionNames = (data) => {
    const permissionSet = new Set()

    console.log(1111, data)
  
    // Add permissions from global_roles (instead of roles)
    if (data.global_roles && Array.isArray(data.global_roles)) {
      data.global_roles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(permission => {
            permissionSet.add(permission.name)
          })
        }
      })
    }
  
    // Add permissions from project access
    if (data.project_access && Array.isArray(data.project_access)) {
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

  // Check if user has a specific permission
  const hasPermission = (permissionName) => {
    return permissions.value.permissionNames.includes(permissionName)
  }

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissionNames) => {
    return permissionNames.some(name => hasPermission(name))
  }

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissionNames) => {
    return permissionNames.every(name => hasPermission(name))
  }

  // Check if user has access to a specific project
  const hasProjectAccess = (projectId) => {
    return permissions.value.projectAccess.some(project => 
      project.project_id.toString() === projectId.toString()
    )
  }

  // Check if user has a specific permission for a project
  const hasProjectPermission = (projectId, permissionName) => {
    const project = permissions.value.projectAccess.find(p => 
      p.project_id.toString() === projectId.toString()
    )
    
    return project && project.permission_names && 
      project.permission_names.includes(permissionName)
  }

  // Get all projects user has access to
  const accessibleProjects = computed(() => {
    return permissions.value.projectAccess.map(project => project.project_id)
  })

  // Get all roles for a specific project
  const getProjectRoles = (projectId) => {
    const project = permissions.value.projectAccess.find(p => 
      p.project_id.toString() === projectId.toString()
    )
    
    return project ? project.roles || [] : []
  }

  return {
    permissions,
    isLoading,
    error,
    refetchPermissions: refetch,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasProjectAccess,
    hasProjectPermission,
    accessibleProjects,
    getProjectRoles
  }
}