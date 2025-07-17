import { usePermissionHelpers } from '@/composables/usePermissionHelpers'

// Helper function to safely remove element
const removeElement = (el) => {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

// Helper function to hide element instead of removing (alternative approach)
const hideElement = (el) => {
  el.style.display = 'none'
}

export const vPermission = {
  mounted(el, binding) {
    const { hasPermission } = usePermissionHelpers()
    const permission = binding.value
    
    if (!hasPermission(permission)) {
      removeElement(el)
    }
  },
  updated(el, binding) {
    const { hasPermission } = usePermissionHelpers()
    const permission = binding.value
    
    if (!hasPermission(permission)) {
      removeElement(el)
    }
  }
}

export const vAnyPermission = {
  mounted(el, binding) {
    const { hasAnyPermission } = usePermissionHelpers()
    const permissions = binding.value
    
    if (!hasAnyPermission(permissions)) {
      removeElement(el)
    }
  },
  updated(el, binding) {
    const { hasAnyPermission } = usePermissionHelpers()
    const permissions = binding.value
    
    if (!hasAnyPermission(permissions)) {
      removeElement(el)
    }
  }
}

export const vAllPermissions = {
  mounted(el, binding) {
    const { hasAllPermissions } = usePermissionHelpers()
    const permissions = binding.value
    
    if (!hasAllPermissions(permissions)) {
      removeElement(el)
    }
  },
  updated(el, binding) {
    const { hasAllPermissions } = usePermissionHelpers()
    const permissions = binding.value
    
    if (!hasAllPermissions(permissions)) {
      removeElement(el)
    }
  }
}

export const vProjectPermission = {
  mounted(el, binding) {
    const { hasProjectPermission } = usePermissionHelpers()
    const { projectId, permission } = binding.value
    
    if (!hasProjectPermission(projectId, permission)) {
      removeElement(el)
    }
  },
  updated(el, binding) {
    const { hasProjectPermission } = usePermissionHelpers()
    const { projectId, permission } = binding.value
    
    if (!hasProjectPermission(projectId, permission)) {
      removeElement(el)
    }
  }
}

// New directive for role-based visibility
export const vRole = {
  mounted(el, binding) {
    const { isAdmin, isProjectManager, isBasicUser } = usePermissionHelpers()
    const role = binding.value
    
    let hasRole = false
    switch (role) {
      case 'admin':
        hasRole = isAdmin.value
        break
      case 'project_manager':
        hasRole = isProjectManager.value
        break
      case 'user':
        hasRole = isBasicUser.value
        break
    }
    
    if (!hasRole) {
      removeElement(el)
    }
  },
  updated(el, binding) {
    const { isAdmin, isProjectManager, isBasicUser } = usePermissionHelpers()
    const role = binding.value
    
    let hasRole = false
    switch (role) {
      case 'admin':
        hasRole = isAdmin.value
        break
      case 'project_manager':
        hasRole = isProjectManager.value
        break
      case 'user':
        hasRole = isBasicUser.value
        break
    }
    
    if (!hasRole) {
      removeElement(el)
    }
  }
}