import { useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '../store'
import { login, forgotPassword as forgotPasswordService, resetPassword as resetPasswordService } from '../services/authService'
import { loginWithMicrosoft } from '../services/oauthService'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const isLoading = ref(false)
  const success = ref(false)

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

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordService,
    onSuccess: () => {
      success.value = true
    },
    onError: (err) => {
      success.value = false
      throw new Error(err.message || 'Failed to send reset link')
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordService,
    onSuccess: () => {
      success.value = true
      // Redirect to login after successful reset
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    },
    onError: (err) => {
      success.value = false
      throw new Error(err.message || 'Failed to reset password')
    },
  })

  const loginUser = (values) => {
    loginMutation.mutate(values)
  }

  const forgotPassword = (email) => {
    success.value = false
    forgotPasswordMutation.mutate(email)
  }

  const resetPassword = (resetData) => {
    success.value = false
    resetPasswordMutation.mutate(resetData)
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

  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('isAuthenticated')
      
      // Logout from OAuth providers

      
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
    forgotPassword,
    resetPassword,
    loginWithMicrosoft: handleMicrosoftLogin,
    logout,
    error: loginMutation.error || microsoftLoginMutation.error || forgotPasswordMutation.error || resetPasswordMutation.error,
    isLoading: isLoading.value || loginMutation.isPending || microsoftLoginMutation.isPending || forgotPasswordMutation.isPending || resetPasswordMutation.isPending,
    success: success.value
  }
}