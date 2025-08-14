import { ref, watch, onUnmounted } from 'vue'

// Global state để theo dõi các dropdown đang mở
const activeDropdowns = ref(new Set())
let globalClickListener = null
let listenerCount = 0

export function useDropdownManager() {
  const dropdownId = Symbol('dropdown')
  
  const registerDropdown = (isOpen, closeCallback) => {
    listenerCount++
    
    // Add global click listener nếu chưa có
    if (!globalClickListener) {
      globalClickListener = (event) => {
        // Check if click is on any dropdown content
        const isClickInsideDropdown = event.target.closest('.dropdown-content') ||
                                     event.target.closest('.multiselect-dropdown') ||
                                     event.target.closest('.datepicker-popup') ||
                                     event.target.closest('.dropdown-trigger')
        
        if (!isClickInsideDropdown) {
          // Close all dropdowns
          activeDropdowns.value.forEach(({ close }) => close())
          activeDropdowns.value.clear()
        }
      }
      
      // Use capture phase to ensure we get the event first
      document.addEventListener('click', globalClickListener, { capture: true })
    }
    
    // Watch isOpen để register/unregister
    const stopWatching = watch(isOpen, (open) => {
      if (open) {
        // Đóng tất cả dropdown khác trước
        activeDropdowns.value.forEach(({ close, id }) => {
          if (id !== dropdownId) close()
        })
        
        // Clear và add dropdown hiện tại
        activeDropdowns.value.clear()
        activeDropdowns.value.add({
          id: dropdownId,
          close: closeCallback
        })
      } else {
        // Remove dropdown này khỏi active list
        for (const dropdown of activeDropdowns.value) {
          if (dropdown.id === dropdownId) {
            activeDropdowns.value.delete(dropdown)
            break
          }
        }
      }
    }, { immediate: true })
    
    // Cleanup function
    const cleanup = () => {
      stopWatching()
      listenerCount--
      
      // Remove dropdown khỏi active list
      for (const dropdown of activeDropdowns.value) {
        if (dropdown.id === dropdownId) {
          activeDropdowns.value.delete(dropdown)
          break
        }
      }
      
      // Remove global listener nếu không còn dropdown nào
      if (listenerCount === 0 && globalClickListener) {
        document.removeEventListener('click', globalClickListener, { capture: true })
        globalClickListener = null
        activeDropdowns.value.clear()
      }
    }
    
    return cleanup
  }
  
  const closeAllDropdowns = () => {
    activeDropdowns.value.forEach(({ close }) => close())
    activeDropdowns.value.clear()
  }
  
  return {
    registerDropdown,
    closeAllDropdowns
  }
}

// ESC key handler global
let escapeListener = null
let escapeListenerCount = 0

export function useEscapeKey(callback) {
  escapeListenerCount++
  
  if (!escapeListener) {
    escapeListener = (event) => {
      if (event.key === 'Escape') {
        // Close the most recently opened dropdown
        if (activeDropdowns.value.size > 0) {
          const lastDropdown = Array.from(activeDropdowns.value).pop()
          lastDropdown.close()
        }
      }
    }
    
    document.addEventListener('keydown', escapeListener)
  }
  
  const cleanup = () => {
    escapeListenerCount--
    
    if (escapeListenerCount === 0 && escapeListener) {
      document.removeEventListener('keydown', escapeListener)
      escapeListener = null
    }
  }
  
  onUnmounted(cleanup)
  
  return cleanup
}