import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/modules/auth/store"
import { fetchUserPermissions, hasAnyPermission } from "@/services/permissionService.js"

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
    path: "/dropdown-demo",
    name: "DropdownDemo",
    component: () => import("@/pages/DropdownDemoPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/datepicker-test",
    name: "DatePickerTest",
    component: () => import("@/pages/DatePickerTestPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/api-pagination-demo",
    name: "ApiPaginationDemo",
    component: () => import("@/components/test/ApiPaginationDemo.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/select-demo",
    name: "SelectDemo",
    component: () => import("@/components/ui/SelectDemo.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/assign-role-demo",
    name: "AssignRoleDemo",
    component: () => import("@/components/ui/AssignRoleDemo.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/user-search-demo",
    name: "UserSearchDemo",
    component: () => import("@/components/ui/UserSearchDemo.vue"),
    meta: { requiresAuth: true },
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
      // First check with cached permissions (no API call if cache is fresh)
      let hasAccess = hasAnyPermission(to.meta.requiredPermissions)
      
      if (!hasAccess) {
        // Only make API call if we don't have access with cached permissions
        console.log('🔄 Refreshing permissions for route access check')
        await fetchUserPermissions(true) // Force refresh once
        
        // Check again with fresh permissions
        hasAccess = hasAnyPermission(to.meta.requiredPermissions)
        
        if (!hasAccess) {
          console.log('❌ Access denied to route:', to.path)
          next("/unauthorized")
          return
        }
      }
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
}

export default router
