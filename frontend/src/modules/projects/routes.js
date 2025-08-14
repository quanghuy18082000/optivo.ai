const projectRoutes = [
  {
    path: "/projects",
    name: "project-dashboard",
    component: () => import("./pages/ProjectDashboard.vue"),
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['project.view_member']  // Dựa trên data: project.view
    },
  },
  {
    path: "/projects/add",
    name: "add-project",
    component: () => import("./pages/AddProjectPage.vue"),
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['project.create']  // Fixed: Use correct permission name
    },
  },
  {
    path: "/projects/edit/:projectId",
    name: "edit-project",
    component: () => import("./pages/EditProjectPage.vue"),
    meta: { 
      requiresAuth: true,
      requiresProjectPermissions: true, // Will be checked in component
    },
  },
  {
    path: "/projects/:projectId/permissions",
    name: "project-permission-management",
    component: () => import("./pages/ProjectPermissionManagementPage.vue"),
    meta: { 
      requiresAuth: true,
      requiresProjectPermissions: true, // Will be checked in component
    },
  },

]

export default projectRoutes