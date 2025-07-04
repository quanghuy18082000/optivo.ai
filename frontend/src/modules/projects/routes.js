const projectRoutes = [
  {
    path: "/projects",
    name: "project-dashboard",
    component: () => import("./pages/ProjectDashboard.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/projects/add",
    name: "add-project",
    component: () => import("./pages/AddProjectPage.vue"),
    meta: { requiresAuth: true },
  },
]

export default projectRoutes