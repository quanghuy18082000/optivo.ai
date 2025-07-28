import { onMounted, onBeforeUnmount } from 'vue'
import { useGlobalLoading } from './useGlobalLoading'

/**
 * Composable để quản lý loading state cho từng page
 * Tự động tích hợp với LoadingScreen global
 */
export function usePageLoading(pageKey) {
  const { setLoading } = useGlobalLoading()
  
  // Tạo unique key cho page nếu không được cung cấp
  const loadingKey = pageKey || `page-${Date.now()}-${Math.random()}`
  
  /**
   * Bắt đầu loading cho page
   */
  const startLoading = () => {
    setLoading(loadingKey, true)
  }
  
  /**
   * Kết thúc loading cho page
   */
  const stopLoading = () => {
    setLoading(loadingKey, false)
  }
  
  /**
   * Wrapper function để thực hiện async operation với loading
   */
  const withLoading = async (asyncFn) => {
    try {
      startLoading()
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }
  
  /**
   * Auto cleanup khi component unmount
   */
  onBeforeUnmount(() => {
    stopLoading()
  })
  
  return {
    startLoading,
    stopLoading,
    withLoading,
    loadingKey
  }
}

/**
 * Composable đặc biệt cho page initialization loading
 * Tự động bắt đầu loading khi component mount và cung cấp các method để quản lý
 */
export function usePageInitLoading(pageKey) {
  const pageLoading = usePageLoading(pageKey)
  
  // Tự động bắt đầu loading khi component mount
  onMounted(() => {
    pageLoading.startLoading()
  })
  
  return pageLoading
}