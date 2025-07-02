import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    role: null,
    provider: null,
    accessToken: null,
    refreshToken: null,
  }),
  actions: {
    login(authData, role = 'user', provider = null) {
      console.log(authData)
      // Handle the new auth response format
      if (authData.access_token && authData.user_info) {
        // Store tokens
        this.accessToken = authData.access_token
        this.refreshToken = authData.refresh_token
        
        // Store user info
        this.user = authData.user_info
        
        // Set authentication state
        this.isAuthenticated = true
        this.role = role
        this.provider = provider
        
        // Save to localStorage
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('accessToken', authData.access_token)
        localStorage.setItem('refreshToken', authData.refresh_token)
        localStorage.setItem('userInfo', JSON.stringify(authData.user_info))
        
        if (provider) {
          localStorage.setItem('authProvider', provider)
        }
      } else {
        // Fallback for older format
        this.user = authData
        this.isAuthenticated = true
        this.role = role
        this.provider = provider
        localStorage.setItem('isAuthenticated', 'true')
        
        if (provider) {
          localStorage.setItem('authProvider', provider)
        }
      }
    },
    logout() {
      this.user = null
      this.isAuthenticated = false
      this.role = null
      this.provider = null
      this.accessToken = null
      this.refreshToken = null
      
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('authProvider')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
    },
    initializeAuth() {
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      const authProvider = localStorage.getItem('authProvider')
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const userInfo = localStorage.getItem('userInfo')
      
      if (isAuthenticated === 'true') {
        this.isAuthenticated = true
        this.provider = authProvider
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        
        if (userInfo) {
          try {
            this.user = JSON.parse(userInfo)
          } catch (error) {
            console.error('Failed to parse user info from localStorage', error)
          }
        }
      }
    },
  },
})