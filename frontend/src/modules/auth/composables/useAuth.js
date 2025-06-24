import { useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '../store'
import { login } from '../services/authService'
import { loginWithMicrosoft, loginWithGoogle, logoutMicrosoft, logoutGoogle } from '../services/oauthService'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const isLoading = ref(false)

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      authStore.login({ username: data.username }, 'user')
      router.push('/dashboard')
    },
    onError: (err) => {
      return err.message || 'invalid'
    },
  })

  const microsoftLoginMutation = useMutation({
    mutationFn: loginWithMicrosoft,
    onSuccess: (data) => {
      // Store the token if returned from backend
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      authStore.login({ email: data.email, provider: 'microsoft' }, 'user')
      router.push('/dashboard')
    },
    onError: (err) => {
      console.error('Microsoft login error:', err)
      throw new Error(err.message || 'Microsoft login failed')
    },
  })

  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data) => {
      // Store the token if returned from backend
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      authStore.login({ email: data.email, provider: 'google' }, 'user')
      router.push('/dashboard')
    },
    onError: (err) => {
      console.error('Google login error:', err)
      throw new Error(err.message || 'Google login failed')
    },
  })

  const loginUser = (values) => {
    loginMutation.mutate(values)
  }

  const handleMicrosoftLogin = async () => {
    try {
      isLoading.value = true
      await microsoftLoginMutation.mutateAsync()
    } catch (error) {
      console.error('Microsoft login failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const handleGoogleLogin = async () => {
    try {
      isLoading.value = true
      await googleLoginMutation.mutateAsync()
    } catch (error) {
      console.error('Google login failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('isAuthenticated')
      
      // Logout from OAuth providers
      await logoutMicrosoft()
      logoutGoogle()
      
      // Clear auth store
      authStore.logout()
      
      // Redirect to login
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return { 
    loginUser, 
    loginWithMicrosoft: handleMicrosoftLogin,
    loginWithGoogle: handleGoogleLogin,
    logout,
    error: loginMutation.error || microsoftLoginMutation.error || googleLoginMutation.error,
    isLoading: isLoading.value || loginMutation.isPending || microsoftLoginMutation.isPending || googleLoginMutation.isPending
  }
}