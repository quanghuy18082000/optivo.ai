<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-bold mb-4">Global Permission Scope Demo</h3>

    <!-- Current Implementation -->
    <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 class="font-semibold mb-2 text-blue-800">
        ✅ Current Implementation:
      </h4>
      <div class="space-y-2 text-sm">
        <div class="flex items-center space-x-2">
          <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span
            >Role Management now shows
            <strong>Global Permissions Only</strong></span
          >
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>Project-specific permissions are filtered out</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>Visual indicator shows "Global Permissions Only"</span>
        </div>
      </div>
    </div>

    <!-- Permission Scope Comparison -->
    <div class="mb-6">
      <h4 class="font-semibold mb-3">Permission Scope Comparison:</h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Before -->
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h5 class="font-semibold text-red-800 mb-2">
            ❌ Before (All Scopes)
          </h5>
          <div class="text-sm space-y-1">
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 bg-red-400 rounded-full"></span>
              <span>Global permissions</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 bg-red-400 rounded-full"></span>
              <span>Project permissions</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 bg-red-400 rounded-full"></span>
              <span>Worklog permissions</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 bg-red-400 rounded-full"></span>
              <span>System config permissions</span>
            </div>
            <div class="text-red-600 text-xs mt-2">
              <strong>Issue:</strong> Mixed global and project-specific
              permissions
            </div>
          </div>
        </div>

        <!-- After -->
        <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h5 class="font-semibold text-green-800 mb-2">
            ✅ After (Global Only)
          </h5>
          <div class="text-sm space-y-1">
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Global permissions only</span>
            </div>
            <div class="flex items-center space-x-2 text-gray-400">
              <span class="w-2 h-2 bg-gray-300 rounded-full"></span>
              <span class="line-through"
                >Project permissions (filtered out)</span
              >
            </div>
            <div class="flex items-center space-x-2 text-gray-400">
              <span class="w-2 h-2 bg-gray-300 rounded-full"></span>
              <span class="line-through"
                >Worklog permissions (filtered out)</span
              >
            </div>
            <div class="flex items-center space-x-2 text-gray-400">
              <span class="w-2 h-2 bg-gray-300 rounded-full"></span>
              <span class="line-through"
                >System config permissions (filtered out)</span
              >
            </div>
            <div class="text-green-600 text-xs mt-2">
              <strong>Benefit:</strong> Clean separation of global vs project
              permissions
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Implementation Details -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Implementation Details:</h4>
      <div class="p-4 bg-gray-100 rounded-lg">
        <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{
          `// In PermissionManagementPage.vue
const permissionModules = computed(() => {
  if (!permissions.value.length) return [];

  // Filter permissions to only show global scope
  const globalPermissions = permissions.value.filter(permission => 
    permission.scope === "global"
  );

  // Group permissions by scope (only global now)
  const groupedPermissions = globalPermissions.reduce((acc, permission) => {
    const scope = permission.scope || "global";
    // ... rest of logic
  }, {});

  return Object.entries(groupedPermissions).map(([scope, perms]) => ({
    name: getScopeDisplayName(scope), // "Global Permissions"
    key: scope,
    permissions: perms,
    description: \`\${getScopeDisplayName(scope)} permissions\`,
  }));
});`
        }}</pre>
      </div>
    </div>

    <!-- Scope Display Names -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Updated Scope Display Names:</h4>
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="flex justify-between p-2 bg-white rounded border">
            <code class="text-blue-600">"global"</code>
            <span class="text-gray-700">→ "Global Permissions"</span>
          </div>
          <div
            class="flex justify-between p-2 bg-gray-100 rounded border text-gray-500"
          >
            <code>"worklog"</code>
            <span>→ "Work Log Management" (filtered)</span>
          </div>
          <div
            class="flex justify-between p-2 bg-gray-100 rounded border text-gray-500"
          >
            <code>"project"</code>
            <span>→ "Project Management" (filtered)</span>
          </div>
          <div
            class="flex justify-between p-2 bg-gray-100 rounded border text-gray-500"
          >
            <code>"system_config_company"</code>
            <span>→ "System Configuration" (filtered)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Benefits -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Benefits of Global-Only Scope:</h4>
      <div class="space-y-2 text-sm">
        <div class="flex items-start space-x-2">
          <span class="text-green-600 mt-0.5">✅</span>
          <div>
            <strong>Clear Separation:</strong> Global permissions are managed
            separately from project-specific ones
          </div>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-blue-600 mt-0.5">🎯</span>
          <div>
            <strong>Focused Management:</strong> Role managers only see
            permissions relevant to global roles
          </div>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-purple-600 mt-0.5">🔧</span>
          <div>
            <strong>Reduced Complexity:</strong> Simpler UI without
            project-specific permission clutter
          </div>
        </div>
        <div class="flex items-start space-x-2">
          <span class="text-orange-600 mt-0.5">⚡</span>
          <div>
            <strong>Better UX:</strong> Visual indicator clearly shows scope
            limitation
          </div>
        </div>
      </div>
    </div>

    <!-- Example Global Permissions -->
    <div class="mb-6">
      <h4 class="font-semibold mb-2">Example Global Permissions:</h4>
      <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            <code class="text-green-700">CREATE_QUOTATION</code>
          </div>
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            <code class="text-green-700">MANAGE_USERS</code>
          </div>
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            <code class="text-green-700">SYSTEM_ADMIN</code>
          </div>
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            <code class="text-green-700">VIEW_REPORTS</code>
          </div>
        </div>
        <div class="text-green-600 text-xs mt-2">
          <strong>Note:</strong> These permissions apply system-wide, not to
          specific projects
        </div>
      </div>
    </div>

    <!-- Test Instructions -->
    <div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 class="font-semibold mb-2 text-yellow-800">🧪 Test Instructions:</h4>
      <div class="space-y-1 text-sm text-yellow-700">
        <div>
          1. Navigate to
          <strong>User Management → Permission Management</strong>
        </div>
        <div>2. Select any role from the sidebar</div>
        <div>3. Verify only "Global Permissions" section appears</div>
        <div>4. Check for "Global Permissions Only" indicator in header</div>
        <div>5. Confirm no project/worklog/system permissions are shown</div>
      </div>
    </div>

    <!-- Navigation Button -->
    <div class="flex space-x-4">
      <router-link
        to="/user-management/permissions"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Test Permission Management
      </router-link>

      <button
        @click="showScopeExample"
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
      >
        Show Scope Filter Logic
      </button>
    </div>
  </div>
</template>

<script setup>
// Demo function
const showScopeExample = () => {
  const examplePermissions = [
    {
      name: "CREATE_QUOTATION",
      scope: "global",
      displayName: "Create Quotation",
    },
    { name: "project.create", scope: "project", displayName: "Create Project" },
    { name: "worklog.view", scope: "worklog", displayName: "View Worklog" },
    { name: "MANAGE_USERS", scope: "global", displayName: "Manage Users" },
  ];

  const globalOnly = examplePermissions.filter((p) => p.scope === "global");

  alert(`Scope Filter Example:

All Permissions (${examplePermissions.length}):
${examplePermissions.map((p) => `• ${p.name} (${p.scope})`).join("\n")}

Filtered Global Only (${globalOnly.length}):
${globalOnly.map((p) => `• ${p.name} (${p.scope})`).join("\n")}

Result: Only global permissions are shown in role management!`);
};
</script>
