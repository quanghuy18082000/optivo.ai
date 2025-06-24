import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    role: null,
    provider: null,
  }),
  actions: {
    login(user, role, provider = null) {
      this.user = user
      this.isAuthenticated = true
      this.role = role
      this.provider = provider
      localStorage.setItem('isAuthenticated', 'true')
      if (provider) {
        localStorage.setItem('authProvider', provider)
      }
    },
    logout() {
      this.user = null
      this.isAuthenticated = false
      this.role = null
      this.provider = null
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('authProvider')
      localStorage.removeItem('token')
    },
    initializeAuth() {
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      const authProvider = localStorage.getItem('authProvider')
      if (isAuthenticated === 'true') {
        this.isAuthenticated = true
        this.provider = authProvider
      }
    },
  },
})