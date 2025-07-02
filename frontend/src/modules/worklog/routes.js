
const worklogRoutes = [
    {
      path: '/',
      name: 'worklog-dashboard',
      component: () => import('./pages/WorklogDashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: "/worklog/create",
      name: "create-worklog",
      component: () => import("./pages/CreateWorklogPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/worklog/edit/:id",
      name: "edit-worklog",
      component: () => import("./pages/EditWorklogPage.vue"),
      meta: { requiresAuth: true },
      props: true,
    },
  ]
  
  export default worklogRoutes
  