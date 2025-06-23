import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from '@/modules/auth/routes'

const routes = [...authRoutes]

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