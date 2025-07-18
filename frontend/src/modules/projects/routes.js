const projectRoutes = [
  {
    path: "/projects",
    name: "project-dashboard",
    component: () => import("./pages/ProjectDashboard.vue"),
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['project.view_member_any']  // Dựa trên data: project.view
    },
  },
  {
    path: "/projects/add",
    name: "add-project",
    component: () => import("./pages/AddProjectPage.vue"),
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['project.add_user']  // Dựa trên data: project.create
    },
  },
  {
    path: "/projects/edit/:id",
    name: "edit-project",
    component: () => import("./pages/EditProjectPage.vue"),
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['project.update_project']  // Based on project update permission
    },
  },
]

export default projectRoutes