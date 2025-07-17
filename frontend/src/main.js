import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import i18n from './locales'
import { useAuthStore } from '@/modules/auth/store'
import vue3GoogleLogin from 'vue3-google-login'
import '@unocss/reset/tailwind.css'
import 'uno.css'

// Import Vue Toastification
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Import ECharts core and required components
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// Register ECharts components
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
])

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(VueQueryPlugin)
app.use(vue3GoogleLogin, {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  })

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
  
  // You can use the toast notification system to show errors
  const toast = app.config.globalProperties.$toast
  if (toast) {
    toast.error(i18n.global.t('errors.somethingWentWrong'))
  }
  
  // For network errors, you might want to handle them differently
  if (err.name === 'NetworkError' || (err.response && err.response.status >= 500)) {
    router.push({ name: 'ServerError' })
  }
}

// Configure and use Vue Toastification
const toastOptions = {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false
}
app.use(Toast, toastOptions)

// Initialize auth state from localStorage
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')

import { vPermission, vAnyPermission, vAllPermissions, vProjectPermission, vRole } from './directives/permission'

app.directive('permission', vPermission)
app.directive('any-permission', vAnyPermission)
app.directive('all-permissions', vAllPermissions)
app.directive('project-permission', vProjectPermission)
app.directive('role', vRole)