
const worklogRoutes = [
  {
    path: '/',
    name: 'worklog-dashboard',
    component: () => import('./pages/WorklogDashboard.vue'),
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['worklog.view_own']
    }
  },
  {
    path: "/worklog/create",
    name: "create-worklog",
    component: () => import("./pages/CreateWorklogPage.vue"),
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['worklog.create']
    },
  },
  {
    path: "/worklog/edit",
    name: "edit-worklog",
    component: () => import("./pages/EditWorklogPage.vue"),
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['worklog.update_own']  // Dựa trên data: worklog.update_own
    },
    props: true,
  },
]
  
export default worklogRoutes
  