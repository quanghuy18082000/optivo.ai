import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchUserPermissions } from '@/services/permissionService.js'

/**
 * Composable to handle permission refreshing on route changes
 * This ensures permissions are up-to-date when navigating between pages
 */
export function useRoutePermissions() {
  const route = useRoute()
  
  // Watch for route changes and refresh permissions if needed
  watch(
    () => route.path,
    async (newPath, oldPath) => {
      // Only refresh if we're actually changing routes (not initial load)
      if (oldPath && newPath !== oldPath) {
        console.log('🔄 Route changed from', oldPath, 'to', newPath)
        
        // Check if the new route requires permissions
        if (route.meta?.requiredPermissions) {
          console.log('🔍 New route requires permissions:', route.meta.requiredPermissions)
          
          try {
            // Refresh permissions to ensure we have the latest data
            await fetchUserPermissions()
            console.log('✅ Permissions refreshed for route change')
          } catch (error) {
            console.error('❌ Failed to refresh permissions on route change:', error)
          }
        }
      }
    },
    { immediate: false } // Don't run on initial mount
  )
  
  return {
    // Could add more route-specific permission utilities here if needed
  }
}