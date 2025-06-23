
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
  }
]

export default authRoutes
