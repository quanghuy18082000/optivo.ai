const projectRoutes = [
    {
      path: "/projects",
      name: "project-dashboard",
      component: () => import("./pages/ProjectDashboard.vue"),
      meta: { requiresAuth: true },
    },
  ]
  
  export default projectRoutes
  