export default [
    {
      path: "/users",
      name: "UserManagement",
      component: () => import("./pages/UserManagementPage.vue"),
      meta: {
        title: "User Management",
        requiresAuth: true,
      },
    },
  ]
  