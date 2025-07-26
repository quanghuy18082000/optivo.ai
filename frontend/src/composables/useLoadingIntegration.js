import { watch } from 'vue'
import { useGlobalLoading } from '@/composables/useGlobalLoading.js'

/**
 * Utility composable to integrate loading states with global loading screen
 * @param {string} key - Unique key for this loading state
 * @param {Ref} isLoading - Reactive loading state to watch
 * @param {Object} options - Options for the integration
 */
export function useLoadingIntegration(key, isLoading, options = {}) {
  const { setLoading } = useGlobalLoading()
  
  // Watch the loading state and sync with global loading
  watch(isLoading, (newValue) => {
    setLoading(key, newValue)
  }, { 
    immediate: options.immediate !== false // Default to true
  })
  
  return {
    setLoading
  }
}

/**
 * Common loading keys for consistency
 */
export const LOADING_KEYS = {
  WORKLOGS: 'worklogs',
  PROJECTS: 'projects', 
  PERMISSIONS: 'userPermissions',
  POSITIONS: 'positions',
  USERS: 'users',
  PROFILE: 'profile',
  DASHBOARD: 'dashboard'
}