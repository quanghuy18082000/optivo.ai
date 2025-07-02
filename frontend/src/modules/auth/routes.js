
const authRoutes = [
  {
    path: '/login',
    component: () => import('./pages/LoginPage.vue'),
  },
  {
    path: '/forgot-password',
    component: () => import('./pages/ForgotPassword.vue'),
  },
  {
    path: '/reset-password',
    component: () => import('./pages/ResetPasswordPage.vue'),
  },
  {
    path: '/profile',
    component: () => import('./pages/ProfilePage.vue'),
    meta: { requiresAuth: true }
  }
]

export default authRoutes
