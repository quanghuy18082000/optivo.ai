import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/modules/auth/store"
import { fetchUserPermissions, hasAnyPermission, hasProjectPermission, shouldFetchPermissionsForRoute } from "@/services/permissionService.js"
import { useGlobalLoading } from "@/composables/useGlobalLoading.js"

// Import route modules
import authRoutes from "@/modules/auth/routes"
import projectRoutes from "@/modules/projects/routes"
import worklogRoutes from "@/modules/worklogs/routes"
import systemConfigRoutes from "@/modules/system-config/routes"
import userManagementRoutes from "@/modules/user-management/routes"

const routes = [
  ...authRoutes,
  ...worklogRoutes,
  ...projectRoutes,
  ...systemConfigRoutes,
  ...userManagementRoutes,
  {
    path: "/permission-test",
    name: "PermissionTest",
    component: () => import("@/pages/PermissionTestPage.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/unauthorized",
    name: "Unauthorized",
    component: () => import("@/pages/UnauthorizedPage.vue"),
  },
  {
    path: "/server-error",
    name: "ServerError",
    component: () => import("@/views/ServerErrorPage.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundPage.vue"),
  },
]

/**
 * Check route permissions with project-specific logic
 */
const checkRoutePermissions = async (to) => {
  const requiredPermissions = to.meta.requiredPermissions
  
  // Handle different permission formats
  if (Array.isArray(requiredPermissions)) {
    // Simple array of permissions - check globally
    return hasAnyPermission(requiredPermissions)
  }
  
  if (typeof requiredPermissions === 'object' && requiredPermissions.anyOf) {
    // Object with anyOf property
    const permissions = Array.isArray(requiredPermissions.anyOf) 
      ? requiredPermissions.anyOf 
      : [requiredPermissions.anyOf]
    
    // Check if this is a project-specific route
    const projectId = to.params.projectId
    if (projectId) {
      // For project routes, check permissions within that specific project
      console.log(`🔍 Checking project-specific permissions for project ${projectId}:`, permissions)
      const hasAccess = permissions.some(permission => hasProjectPermission(projectId, permission))
      console.log(`${hasAccess ? '✅' : '❌'} Project permission check result:`, hasAccess)
      return hasAccess
    } else {
      // For non-project routes, check globally
      console.log('🔍 Checking global permissions:', permissions)
      return hasAnyPermission(permissions)
    }
  }
  
  // Fallback for other formats
  return hasAnyPermission([requiredPermissions])
}

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const { setLoading } = useGlobalLoading()

  // If user is not authenticated and trying to access a protected route
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login")
    return
  } 
  
  // If user is authenticated and trying to access login page, redirect to home
  if (to.path === "/login" && authStore.isAuthenticated) {
    next("/")
    return
  }
  
  // If user is not authenticated and trying to access root path, redirect to login
  if (to.path === "/" && !authStore.isAuthenticated) {
    next("/login")
    return
  }
  
  // For authenticated users, fetch permissions before route access if needed
  if (authStore.isAuthenticated && to.meta.requiresAuth) {
    const loadingKey = `permissions-${to.path}`
    
    try {
      // Check if we need to fetch permissions for this route
      const needsFetch = shouldFetchPermissionsForRoute(to.path, false)
      
      if (needsFetch) {
        console.log('🔄 Fetching user permissions before route access:', to.path)
        
        // Show loading screen
        setLoading(loadingKey, true)
        
        await fetchUserPermissions(true)
        console.log('✅ User permissions fetched successfully')
      } else {
        console.log('📋 Using cached permissions for route:', to.path)
      }
      
      // Check permissions if route requires them
      if (to.meta.requiredPermissions) {
        const hasAccess = await checkRoutePermissions(to)
        
        if (!hasAccess) {
          console.log('❌ Access denied to route:', to.path)
          setLoading(loadingKey, false) // Hide loading before redirect
          next("/unauthorized")
          return
        }
        
        console.log('✅ Route access granted:', to.path)
      }
      
      // Hide loading screen
      setLoading(loadingKey, false)
    } catch (error) {
      console.error('❌ Permission fetch/check failed:', error)
      setLoading(loadingKey, false) // Hide loading on error
      next("/unauthorized")
      return
    }
  }
  
  next()
})

// Clear permissions cache function
export const clearPermissions = () => {
  // Implementation for clearing permissions cache
}

export default router
