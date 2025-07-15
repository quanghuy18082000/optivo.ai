const projectRoutes = [
  {
    path: "/projects",
    name: "project-dashboard",
    component: () => import("./pages/ProjectDashboard.vue"),
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['project.view']  // Dựa trên data: project.view
    },
  },
  {
    path: "/projects/add",
    name: "add-project",
    component: () => import("./pages/AddProjectPage.vue"),
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['project.create']  // Dựa trên data: project.create
    },
  },
]

export default projectRoutes