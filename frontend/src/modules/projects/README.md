# Project Permission Management Module

## Overview

This module provides project-specific role and permission management functionality. It allows creating roles that are specific to each project and assigning these roles to users within the context of individual projects.

## Features

### 1. Project-Specific Role Management

- Create roles that are specific to individual projects
- Edit and delete project roles
- View all roles within a project

### 2. Permission Assignment

- Assign global permissions to project-specific roles
- Use the same permission system as the global role management
- Organize permissions by modules/scopes

### 3. User Role Assignment

- Assign project-specific roles to users
- View all user assignments within a project
- Manage multiple roles per user per project

## File Structure

```
src/modules/projects/
├── components/
│   ├── AddProjectRoleModal.vue          # Modal for creating new project roles
│   └── AssignProjectRoleModal.vue       # Modal for assigning roles to users
├── pages/
│   └── ProjectPermissionManagementPage.vue  # Main page for project permission management
├── services/
│   └── projectPermissionService.js      # API service functions
└── routes.js                           # Updated with new route
```

## Usage

### Accessing the Module

Navigate to `/projects/permissions` to access the Project Permission Management page.

### Workflow

1. **Select Project**: Choose a project from the dropdown
2. **Manage Roles**:
   - Create project-specific roles
   - Assign permissions to roles
   - Delete roles when no longer needed
3. **Assign Users**:
   - Switch to "User Assignments" tab
   - Assign roles to users within the project context

### Components

#### ProjectPermissionManagementPage.vue

Main page component with:

- Project selector
- Role management sidebar
- Tabbed interface for permissions and user assignments
- Permission matrix for role configuration

#### AddProjectRoleModal.vue

Modal component for creating new project roles:

- Role name and description fields
- Project context display
- Form validation

#### AssignProjectRoleModal.vue

Modal component for assigning roles to users:

- User selection dropdown
- Multiple role selection
- Assignment summary
- Form validation

## API Integration

The module uses `projectPermissionService.js` which provides functions for:

- Project role CRUD operations
- Permission management
- User role assignments
- Project and user data retrieval

## Internationalization

Supports both English and Vietnamese translations under the `project_permission` namespace.

## Dependencies

- Vue 3 Composition API
- Vue Router
- Vue I18n
- UI Components (Modal, Select, Table, etc.)
- Toast notifications
- Auth store for user context

## Permissions Required

Users need the `project.manage_permissions` permission to access this module.
