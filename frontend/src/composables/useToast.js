import { ref, h, render } from 'vue';
import SimpleToast from '@/components/ui/SimpleToast.vue';

// Create a reactive array to store active toasts
const toasts = ref([]);

// Counter for generating unique IDs
let toastCounter = 0;

// Function to create a toast
const createToast = (message, options = {}) => {
  const id = toastCounter++;
  const type = options.type || 'info';
  const duration = options.duration || 3000;
  const position = options.position || 'top-right';
  
  // Create a div to mount the toast
  const container = document.createElement('div');
  container.id = `toast-${id}`;
  document.body.appendChild(container);
  
  // Create the toast component
  const toastVNode = h(SimpleToast, {
    message,
    type,
    duration,
    position,
    onDestroy: () => removeToast(id)
  });
  
  // Render the toast
  render(toastVNode, container);
  
  // Add to active toasts
  toasts.value.push({ id, container });
  
  // Auto-remove after duration
  setTimeout(() => {
    removeToast(id);
  }, duration);
  
  return id;
};

// Function to remove a toast
const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    const { container } = toasts.value[index];
    
    // Unmount the component
    render(null, container);
    
    // Remove the container
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    // Remove from active toasts
    toasts.value.splice(index, 1);
  }
};

// Shorthand methods for different toast types
const success = (message, options = {}) => {
  return createToast(message, { ...options, type: 'success' });
};

const error = (message, options = {}) => {
  return createToast(message, { ...options, type: 'error' });
};

const warning = (message, options = {}) => {
  return createToast(message, { ...options, type: 'warning' });
};

const info = (message, options = {}) => {
  return createToast(message, { ...options, type: 'info' });
};

export function useToast() {
  return {
    toasts,
    createToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
}