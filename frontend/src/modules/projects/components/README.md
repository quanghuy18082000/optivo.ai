# Project Permission Management Components

This directory contains the refactored components for the Project Permission Management page.

## Component Structure

### 1. **TabNavigation.vue**

- **Purpose**: Handles tab switching between "Role Permissions" and "User Assignments"
- **Props**:
  - `activeTab`: Current active tab
- **Events**:
  - `update:activeTab`: Emitted when tab is changed

### 2. **ProjectRolesList.vue**

- **Purpose**: Displays the list of project roles with add/delete functionality
- **Props**:
  - `roles`: Array of project roles
  - `selectedRole`: Currently selected role
  - `loading`: Loading state for roles
- **Events**:
  - `add-role`: Emitted when add role button is clicked
  - `select-role`: Emitted when a role is selected
  - `delete-role`: Emitted when delete role button is clicked

### 3. **RolePermissionsEditor.vue**

- **Purpose**: Main editor for role permissions, includes permission modules and save functionality
- **Props**:
  - `selectedRole`: Currently selected role
  - `permissionModules`: Array of permission modules
  - `hasPermission`: Function to check if role has permission
  - `loading`: Loading state for role details
  - `saving`: Saving state
  - `canEdit`: Whether user can edit permissions
- **Events**:
  - `save`: Emitted when save button is clicked
  - `select-all-permissions`: Emitted when select/clear all is clicked
  - `toggle-permission`: Emitted when individual permission is toggled

### 4. **PermissionModule.vue**

- **Purpose**: Displays a single permission module with its permissions
- **Props**:
  - `module`: Permission module object
  - `hasPermission`: Function to check if role has permission
- **Events**:
  - `select-all`: Emitted when select/clear all is clicked for this module
  - `toggle-permission`: Emitted when individual permission is toggled

### 5. **UserAssignmentsTab.vue**

- **Purpose**: Complete tab for managing user role assignments
- **Props**:
  - `selectedUserForAssignment`: Selected user for assignment
  - `selectedRoleForAssignment`: Selected role for assignment
  - `availableUsersOptions`: Available users dropdown options
  - `projectRolesOptions`: Project roles dropdown options
  - `loadingUsers`: Loading state for users
  - `loadingRoles`: Loading state for roles
  - `assigningRole`: Assigning role state
  - `canAssignRole`: Permission to assign roles
  - `canAddUser`: Permission to add users
  - `canDeleteUser`: Permission to delete users
  - `loadingUserAssignments`: Loading state for user assignments
  - `userAssignmentColumns`: Table columns for user assignments
  - `projectUsersWithRoles`: User assignments data
- **Events**:
  - `assign-role`: Emitted when assign role button is clicked
  - `update:selectedUserForAssignment`: Emitted when user selection changes
  - `update:selectedRoleForAssignment`: Emitted when role selection changes

## Benefits of Refactoring

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Maintainability**: Easier to maintain and debug individual components
4. **Testability**: Each component can be tested independently
5. **Readability**: Main page component is much cleaner and easier to understand
6. **Performance**: Smaller components can be optimized individually

## Usage

The main page (`ProjectPermissionManagementPage.vue`) now acts as a container that:

- Manages the overall state
- Handles API calls
- Coordinates between components
- Passes data down to child components
- Handles events from child components

Each child component focuses on its specific UI and functionality, making the codebase more modular and maintainable.
