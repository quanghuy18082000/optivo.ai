import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from '@/modules/auth/routes'
import worklogRoutes from '@/modules/worklogs/routes'
import projectRoutes from "@/modules/projects/routes" // Imp
import NotFoundPage from '@/views/NotFoundPage.vue'
import ServerErrorPage from '@/views/ServerErrorPage.vue'

const routes = [
  ...authRoutes, 
  ...worklogRoutes, 
  ...projectRoutes,
  // Error routes
  {
    path: '/server-error',
    name: 'ServerError',
    component: ServerErrorPage,
    meta: {
      title: 'Server Error'
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

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router