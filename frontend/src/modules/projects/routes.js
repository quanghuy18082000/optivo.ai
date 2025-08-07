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
      requiredPermissions: {
        anyOf: ['project.update']  // Check project-specific permission
      }
    },
  },
  {
    path: "/projects/:projectId/permissions",
    name: "project-permission-management",
    component: () => import("./pages/ProjectPermissionManagementPage.vue"),
    // meta: { 
    //   requiresAuth: true,
    //   requiredPermissions: {
    //     anyOf: [
    //       'project.create_role',
    //       'project.assign_role', 
    //       'project.add_user',
    //       'project.delete_user'
    //     ]
    //   }
    // },
  },

]

export default projectRoutes