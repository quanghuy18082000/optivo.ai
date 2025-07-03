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

// Initialize auth state from localStorage
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')