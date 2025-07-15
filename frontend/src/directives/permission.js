import { usePermissions } from '@/composables/usePermissions'

export const vPermission = {
  mounted(el, binding) {
    const { hasPermission } = usePermissions()
    const permission = binding.value
    
    if (!hasPermission(permission)) {
      // Remove element if user doesn't have permission
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

export const vAnyPermission = {
  mounted(el, binding) {
    const { hasAnyPermission } = usePermissions()
    const permissions = binding.value
    
    if (!hasAnyPermission(permissions)) {
      // Remove element if user doesn't have any of the permissions
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

export const vAllPermissions = {
  mounted(el, binding) {
    const { hasAllPermissions } = usePermissions()
    const permissions = binding.value
    
    if (!hasAllPermissions(permissions)) {
      // Remove element if user doesn't have all permissions
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

export const vProjectPermission = {
  mounted(el, binding) {
    const { hasProjectPermission } = usePermissions()
    const { projectId, permission } = binding.value
    
    if (!hasProjectPermission(projectId, permission)) {
      // Remove element if user doesn't have project permission
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}