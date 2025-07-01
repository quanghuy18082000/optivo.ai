
const worklogRoutes = [
    {
      path: '/',
      name: 'worklog-dashboard',
      component: () => import('./pages/WorklogDashboard.vue'),
      meta: { requiresAuth: false }
    }
  ]
  
  export default worklogRoutes
  

  