import { ref, nextTick } from 'vue'

export function useDropdownPosition() {
  const popupStyle = ref({})

  const calculatePosition = (triggerElement, popupElement, options = {}) => {
    if (!triggerElement) return

    const {
      offset = 5,
      minWidth = null,
      maxWidth = null,
      maxHeight = 240,
      preferredPosition = 'bottom' // 'bottom', 'top', 'auto'
    } = options

    const triggerRect = triggerElement.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const isMobile = viewportWidth < 640 // sm breakpoint

    // Get popup dimensions - handle case where popup might not be rendered yet
    let popupWidth = triggerRect.width
    let popupHeight = maxHeight
    
    if (popupElement) {
      const popupRect = popupElement.getBoundingClientRect()
      popupWidth = popupRect.width || triggerRect.width
      popupHeight = Math.min(popupRect.height || maxHeight, maxHeight)
    }

    if (isMobile) {
      // On mobile, center the popup
      popupStyle.value = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed',
        maxWidth: 'calc(100vw - 20px)',
        width: minWidth ? `${Math.max(minWidth, triggerRect.width)}px` : `${triggerRect.width}px`,
        maxHeight: `${maxHeight}px`,
        zIndex: 50
      }
      return
    }

    // Calculate vertical position
    const spaceBelow = viewportHeight - triggerRect.bottom - offset
    const spaceAbove = triggerRect.top - offset
    
    let shouldOpenUp = false
    if (preferredPosition === 'top') {
      shouldOpenUp = spaceAbove >= popupHeight || spaceAbove > spaceBelow
    } else if (preferredPosition === 'auto') {
      shouldOpenUp = spaceBelow < popupHeight && spaceAbove > popupHeight
    }
    // For 'bottom', always try to open down unless no space

    // Calculate horizontal position
    let left = triggerRect.left
    const finalPopupWidth = Math.max(
      minWidth || triggerRect.width,
      Math.min(maxWidth || popupWidth, popupWidth)
    )

    // If popup would overflow on the right, align it to the right edge of trigger
    if (left + finalPopupWidth > viewportWidth - 10) {
      left = triggerRect.right - finalPopupWidth
    }

    // Ensure popup doesn't go off-screen on the left
    if (left < 10) {
      left = 10
    }

    // Ensure popup doesn't go off-screen on the right
    if (left + finalPopupWidth > viewportWidth - 10) {
      left = viewportWidth - finalPopupWidth - 10
    }

    // Calculate top position
    let top
    const availableHeight = shouldOpenUp ? spaceAbove : spaceBelow
    const finalMaxHeight = Math.min(maxHeight, availableHeight - 10)

    if (shouldOpenUp) {
      top = Math.max(10, triggerRect.top - finalMaxHeight - offset)
    } else {
      top = Math.min(viewportHeight - finalMaxHeight - 10, triggerRect.bottom + offset)
    }

    popupStyle.value = {
      top: `${top}px`,
      left: `${left}px`,
      position: 'fixed',
      transform: 'none',
      width: `${finalPopupWidth}px`,
      maxHeight: `${finalMaxHeight}px`,
      zIndex: 50
    }
  }

  const updatePosition = (triggerElement, popupElement, options = {}) => {
    nextTick(() => {
      calculatePosition(triggerElement, popupElement, options)
      // Additional positioning after DOM updates
      setTimeout(() => calculatePosition(triggerElement, popupElement, options), 10)
    })
  }

  return {
    popupStyle,
    calculatePosition,
    updatePosition
  }
}