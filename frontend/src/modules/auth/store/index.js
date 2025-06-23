import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    role: null,
  }),
  actions: {
    login(user, role) {
      this.user = user
      this.isAuthenticated = true
      this.role = role
      localStorage.setItem('isAuthenticated', 'true')
    },
    logout() {
      this.user = null
      this.isAuthenticated = false
      this.role = null
      localStorage.removeItem('isAuthenticated')
    },
  },
})