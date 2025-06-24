
const worklogRoutes = [
    {
      path: '/',
      name: 'worklog-dashboard',
      component: () => import('./pages/WorklogDashboard.vue'),
      meta: { requiresAuth: true }
    }
  ]
  
  export default worklogRoutes
  

  