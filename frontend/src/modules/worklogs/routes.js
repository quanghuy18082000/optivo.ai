
const worklogRoutes = [
    {
      path: '/',
      name: 'worklog-dashboard',
      component: () => import('./pages/WorklogDashboard.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: "/worklog/create",
      name: "create-worklog",
      component: () => import("./pages/CreateWorklogPage.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/worklog/edit",
      name: "edit-worklog",
      component: () => import("./pages/EditWorklogPage.vue"),
      meta: { requiresAuth: false },
      props: true,
    },
  ]
  
  export default worklogRoutes
  