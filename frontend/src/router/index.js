import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from '@/modules/auth/routes'
import worklogRoutes from '@/modules/worklogs/routes'
import projectRoutes from "@/modules/projects/routes" // Imp
import NotFoundPage from '@/views/NotFoundPage.vue'
import ServerErrorPage from '@/views/ServerErrorPage.vue'
import UnauthorizedPage from '@/views/UnauthorizedPage.vue'
import { getUserPermissions } from '@/services/systemConfigService.js'
import { useGlobalLoading } from '@/composables/useGlobalLoading.js'

const routes = [
  ...authRoutes, 
  ...worklogRoutes, 
  ...projectRoutes,

  // Demo route (development only)
  {
    path: '/test-multiselect',
    name: 'TestMultiSelect',
    component: () => import('@/components/TestMultiSelect.vue'),
    meta: {
      title: 'Test MultiSelect',
      requiresAuth: true
    }
  },
  {
    path: '/test-project-filters',
    name: 'TestProjectFilters',
    component: () => import('@/components/TestProjectFilters.vue'),
    meta: {
      title: 'Test Project Filters',
      requiresAuth: true
    }
  },
  {
    path: '/test-checkbox-group',
    name: 'TestCheckboxGroup',
    component: () => import('@/components/TestCheckboxGroup.vue'),
    meta: {
      title: 'Test CheckboxGroup',
      requiresAuth: true
    }
  },
  {
    path: '/test-multiselect-fixed',
    name: 'TestMultiSelectFixed',
    component: () => import('@/components/TestMultiSelectFixed.vue'),
    meta: {
      title: 'Test MultiSelect Fixed',
      requiresAuth: true
    }
  },

  // Error routes
  {
    path: '/server-error',
    name: 'ServerError',
    component: ServerErrorPage,
    meta: {
      title: 'Server Error'
    }
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedPage,
    meta: {
      title: 'Access Denied'
    }
  },
  // 404 route - must be the last one
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
    meta: {
      title: '404 Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Store user permissions in memory
let userPermissions = null

// Function to check if user has required permissions
const hasRequiredPermissions = (requiredPermissions, userPermissionNames) => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true
  return requiredPermissions.every(perm => userPermissionNames.includes(perm))
}

router.beforeEach(async (to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  const { setLoading } = useGlobalLoading()
  
  // If route requires authentication but user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }
  
  // If route requires specific permissions
  if (to.meta.requiredPermissions && isAuthenticated) {
    try {
      // If permissions not loaded yet, fetch them
      if (!userPermissions) {
        setLoading('routePermissions', true)
        
        const response = await getUserPermissions()
        if (response && response.data) {
          // Extract all permission names
          const permissionNames = []
          
          // Add permissions from roles
          if (response.data.global_roles) {
            response.data.global_roles.forEach(role => {
              if (role.permissions) {
                role.permissions.forEach(permission => {
                  permissionNames.push(permission.name)
                })
              }
            })
          }
          
          // Add permissions from project access
          if (response.data.project_access) {
            response.data.project_access.forEach(project => {
              if (project.permission_names) {
                project.permission_names.forEach(permName => {
                  if (!permissionNames.includes(permName)) {
                    permissionNames.push(permName)
                  }
                })
              }
            })
          }
          
          userPermissions = {
            roles: response.data.global_roles || [],
            permissionNames,
            projectAccess: response.data.project_access || []
          }
        }
      }
      
      // Check if user has required permissions
      if (hasRequiredPermissions(to.meta.requiredPermissions, userPermissions.permissionNames)) {
        setLoading('routePermissions', false)
        next()
      } else {
        setLoading('routePermissions', false)
        // Redirect to unauthorized page or home
        next({ name: 'unauthorized' })
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      setLoading('routePermissions', false)
      next('/login')
    }
  } else {
    // No special permission requirements
    next()
  }
})

// Clear permissions on logout
export const clearPermissions = () => {
  userPermissions = null
}

export default router