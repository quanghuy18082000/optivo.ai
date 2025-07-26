import { ref, computed } from 'vue'

// Global loading state
const loadingStates = ref(new Map())

export function useGlobalLoading() {
  // Add a loading state with a unique key
  const setLoading = (key, isLoading) => {
    if (isLoading) {
      loadingStates.value.set(key, true)
    } else {
      loadingStates.value.delete(key)
    }
  }

  // Check if any loading state is active
  const isGlobalLoading = computed(() => {
    return loadingStates.value.size > 0
  })

  // Clear all loading states
  const clearAllLoading = () => {
    loadingStates.value.clear()
  }

  // Remove specific loading state
  const removeLoading = (key) => {
    loadingStates.value.delete(key)
  }

  return {
    setLoading,
    removeLoading,
    clearAllLoading,
    isGlobalLoading
  }
}