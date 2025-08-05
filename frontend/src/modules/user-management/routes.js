import { ROLE_PERMISSIONS } from "@/constants/permissions.js";

export default [
    {
      path: "/users",
      name: "UserManagement",
      component: () => import("./pages/UserManagementPage.vue"),
      meta: {
        title: "User Management",
        requiresAuth: true,
        requiredPermissions: [
          ROLE_PERMISSIONS.VIEW_OWN,
          ROLE_PERMISSIONS.VIEW_ANY
        ],
      },
    },
    {
      path: "/permissions",
      name: "PermissionManagement",
      component: () => import("./pages/PermissionManagementPage.vue"),
      meta: {
        title: "Permission Management",
        requiresAuth: true,
        requiredPermissions: [
          ROLE_PERMISSIONS.VIEW_OWN,
          ROLE_PERMISSIONS.VIEW_ANY
        ],
      },
    },
  ]
  