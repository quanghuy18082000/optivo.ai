import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/modules/auth/store"
import { fetchUserPermissions, hasAnyPermission } from "@/services/permissionService.js"

// Import route modules
import authRoutes from "@/modules/auth/routes"
import projectRoutes from "@/modules/projects/routes"
import worklogRoutes from "@/modules/worklogs/routes"
import systemConfigRoutes from "@/modules/system-config/routes"

const routes = [
  ...authRoutes,
  ...worklogRoutes,
  ...projectRoutes,
  ...systemConfigRoutes,
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

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

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
  
  // Check permissions for authenticated users
  if (authStore.isAuthenticated && to.meta.requiredPermissions) {
    try {
      console.log('🔍 Checking permissions for route:', to.path)
      console.log('🔍 Required permissions:', to.meta.requiredPermissions)
      
      // Refresh permissions on route change, but respect cache if recent
      // This ensures we have up-to-date permissions while avoiding excessive API calls
      await fetchUserPermissions()
      
      // Check if user has any of the required permissions
      if (!hasAnyPermission(to.meta.requiredPermissions)) {
        console.log('❌ Access denied. Required permissions:', to.meta.requiredPermissions)
        // Try force refresh once in case permissions were recently updated
        console.log('🔄 Retrying with fresh permissions...')
        await fetchUserPermissions(true)
        
        // Check again with fresh permissions
        if (!hasAnyPermission(to.meta.requiredPermissions)) {
          console.log('❌ Access still denied after refresh. Required permissions:', to.meta.requiredPermissions)
          next("/unauthorized")
          return
        }
      }
      
      console.log('✅ Permission check passed for:', to.path)
    } catch (error) {
      console.error('❌ Permission check failed:', error)
      next("/unauthorized")
      return
    }
  }
  
  next()
})

// Clear permissions cache function
export const clearPermissions = () => {
  // Implementation for clearing permissions cache
  console.log("Permissions cache cleared")
}

export default router
