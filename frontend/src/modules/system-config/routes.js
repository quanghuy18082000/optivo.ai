export default [
    {
      path: "/system-config",
      name: "SystemConfig",
      component: () => import("./pages/SystemConfigPage.vue"),
      meta: {
        requiresAuth: true,
        title: "System Configuration",
        requiredPermissions: ['system_config_company.view']
      },
    },
  ]
  