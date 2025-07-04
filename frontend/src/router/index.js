import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from '@/modules/auth/routes'
import worklogRoutes from '@/modules/worklogs/routes'
import projectRoutes from "@/modules/projects/routes" // Imp

const routes = [...authRoutes, ...worklogRoutes, ...projectRoutes]

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