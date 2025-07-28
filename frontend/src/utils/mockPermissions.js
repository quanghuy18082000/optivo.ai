// Mock permissions data for testing
export const mockPermissionsResponse = {
  data: {
    global_roles: [
      {
        id: 1,
        name: "Admin",
        permissions: [
          { id: 1, name: "system_config_company.view" },
          { id: 2, name: "system_config_company.update" },
          { id: 3, name: "project.view_member" },
          { id: 4, name: "project.create" },
          { id: 5, name: "worklog.create" },
          { id: 6, name: "worklog.view_own" },
          { id: 7, name: "worklog.view_any" }
        ]
      }
    ],
    project_access: [
      {
        project_id: 1,
        project_name: "Test Project",
        permission_names: ["worklog.create", "worklog.view_own"],
        roles: ["Developer"]
      }
    ]
  }
}

// Function to use mock data instead of API call
export const getMockUserPermissions = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  console.log('🧪 Using mock permissions data')
  return mockPermissionsResponse
}