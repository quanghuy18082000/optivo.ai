# Permission System Documentation

## Overview

This permission system provides a comprehensive way to handle user permissions in the frontend application. It includes constants, composables, and directives to manage access control.

## Files Structure

```
src/
├── constants/
│   └── permissions.js          # Permission constants and groups
├── composables/
│   ├── usePermissions.js       # Core permission logic
│   └── usePermissionHelpers.js # Extended helpers with constants
├── directives/
│   └── permission.js           # Vue directives for template usage
└── examples/
    └── PermissionUsageExample.vue # Usage examples
```

## Permission Constants

### Available Permission Categories

1. **WORKLOG_PERMISSIONS**

   - CREATE, VIEW_OWN, VIEW_ANY, UPDATE_OWN, UPDATE_ANY, DELETE_OWN, DELETE_ANY

2. **ROLE_PERMISSIONS**

   - VIEW_OWN, VIEW_ANY, CREATE, ASSIGN_PERMISSION_TO_ROLE, REMOVE_PERMISSION_FROM_ROLE, ASSIGN_USER_TO_ROLE, REMOVE_USER_FROM_ROLE

3. **PROJECT_PERMISSIONS**
   - CREATE, ADD_USER, UPDATE_PROJECT, DELETE_USER, ASSIGN_ROLE, CREATE_ROLE, VIEW_MEMBER_OWN, VIEW_MEMBER_ANY

### Permission Groups

- **ADMIN**: High-level administrative permissions
- **PROJECT_MANAGER**: Project management permissions
- **USER**: Basic user permissions

## Usage Examples

### 1. Using Directives in Templates

```vue
<template>
  <!-- Single permission -->
  <button v-permission="WORKLOG_PERMISSIONS.CREATE">Create Worklog</button>

  <!-- Any of multiple permissions -->
  <button
    v-any-permission="[
      WORKLOG_PERMISSIONS.UPDATE_OWN,
      WORKLOG_PERMISSIONS.UPDATE_ANY,
    ]"
  >
    Update Worklog
  </button>

  <!-- All permissions required -->
  <button
    v-all-permissions="[
      PROJECT_PERMISSIONS.ADD_USER,
      PROJECT_PERMISSIONS.ASSIGN_ROLE,
    ]"
  >
    Manage Users
  </button>

  <!-- Role-based visibility -->
  <div v-role="'admin'">Admin Only Content</div>

  <!-- Project-specific permission -->
  <button
    v-project-permission="{
      projectId: '123',
      permission: PROJECT_PERMISSIONS.UPDATE_PROJECT,
    }"
  >
    Update Project
  </button>
</template>

<script setup>
import { usePermissionHelpers } from "@/composables/usePermissionHelpers";

const { WORKLOG_PERMISSIONS, PROJECT_PERMISSIONS } = usePermissionHelpers();
</script>
```

### 2. Using Composable Helpers

```vue
<script setup>
import { usePermissionHelpers } from "@/composables/usePermissionHelpers";

const {
  // Permission constants
  WORKLOG_PERMISSIONS,
  ROLE_PERMISSIONS,
  PROJECT_PERMISSIONS,

  // Permission check functions
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,

  // Computed permission helpers
  worklogPermissions,
  rolePermissions,
  projectPermissions,

  // Role level helpers
  isAdmin,
  isProjectManager,
  isBasicUser,
  getUserRoleLevel,

  // Utility functions
  getProjectPermissions,
  checkPermissions,
} = usePermissionHelpers();

// Check individual permissions
const canCreateWorklog = hasPermission(WORKLOG_PERMISSIONS.CREATE);

// Check multiple permissions
const canUpdateWorklog = hasAnyPermission([
  WORKLOG_PERMISSIONS.UPDATE_OWN,
  WORKLOG_PERMISSIONS.UPDATE_ANY,
]);

// Use computed helpers
console.log("Worklog permissions:", worklogPermissions.value);
console.log("User role level:", getUserRoleLevel());

// Project-specific permissions
const projectPermissions = getProjectPermissions("123");
console.log("Can add user to project:", projectPermissions.canAddUser);

// Batch permission checks
const permissionResults = checkPermissions({
  canCreate: WORKLOG_PERMISSIONS.CREATE,
  canUpdate: [WORKLOG_PERMISSIONS.UPDATE_OWN, WORKLOG_PERMISSIONS.UPDATE_ANY],
  canManage: PROJECT_PERMISSIONS.ADD_USER,
});
</script>
```

### 3. Conditional Rendering

```vue
<template>
  <!-- Using computed properties -->
  <div v-if="worklogPermissions.canCreate">
    <CreateWorklogForm />
  </div>

  <!-- Using permission functions -->
  <div v-if="hasPermission(ROLE_PERMISSIONS.CREATE)">
    <CreateRoleButton />
  </div>

  <!-- Using role helpers -->
  <AdminPanel v-if="isAdmin" />
  <ProjectManagerPanel v-if="isProjectManager" />
  <UserPanel v-if="isBasicUser" />
</template>
```

### 4. Route Guards

```javascript
// In router/index.js or route guards
import { usePermissionHelpers } from "@/composables/usePermissionHelpers";

const { hasPermission, isAdmin, WORKLOG_PERMISSIONS } = usePermissionHelpers();

// Route guard example
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin && !isAdmin.value) {
    next("/unauthorized");
  } else if (
    to.meta.requiresPermission &&
    !hasPermission(to.meta.requiresPermission)
  ) {
    next("/unauthorized");
  } else {
    next();
  }
});
```

## Available Directives

- `v-permission="permissionString"` - Show element if user has specific permission
- `v-any-permission="[permission1, permission2]"` - Show if user has any of the permissions
- `v-all-permissions="[permission1, permission2]"` - Show if user has all permissions
- `v-project-permission="{ projectId, permission }"` - Show if user has project-specific permission
- `v-role="'admin'|'project_manager'|'user'"` - Show based on user role level

## Best Practices

1. **Always use constants** instead of hardcoded permission strings
2. **Use computed properties** for complex permission logic
3. **Prefer directives** for simple show/hide logic in templates
4. **Use composable helpers** for complex business logic
5. **Cache permission results** when doing multiple checks
6. **Handle loading states** when permissions are being fetched

## Error Handling

The permission system includes error handling for:

- Network failures when fetching permissions
- Invalid permission strings
- Missing project IDs
- Malformed permission data

## Performance Considerations

- Permissions are cached using vue-query with 5-minute stale time
- Computed properties are used to avoid recalculation
- Directives are optimized to minimize DOM manipulation

## Migration Guide

If you're migrating from hardcoded permission strings:

1. Replace hardcoded strings with constants from `@/constants/permissions`
2. Update imports to use `usePermissionHelpers` instead of `usePermissions`
3. Update directives to use the new enhanced versions
4. Test all permission-related functionality

## Troubleshooting

Common issues and solutions:

1. **Permissions not updating**: Check if `refetchPermissions()` is called after role changes
2. **Directive not working**: Ensure directives are properly registered in main.js
3. **Constants not found**: Check import paths and constant names
4. **Performance issues**: Use computed properties instead of function calls in templates
