import { useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '../store'
import { login, forgotPassword as forgotPasswordService, resetPassword as resetPasswordService } from '../services/authService'
import { loginWithMicrosoft, loginWithGoogle } from '../services/oauthService'
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

      console.log(222, data)
      // Handle the new response format with access_token, refresh_token, and user_info
      authStore.login(data, 'user')
      router.push('/')
    },
    onError: (err) => {
      return err.message || 'invalid'
    },
  })

  const microsoftLoginMutation = useMutation({
    mutationFn: loginWithMicrosoft,
    onSuccess: (data) => {
      // Handle the new response format with access_token, refresh_token, and user_info
      authStore.login(data, 'user', 'microsoft')
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
      // Handle the new response format with access_token, refresh_token, and user_info
      authStore.login(data, 'user', 'google')
      router.push('/dashboard')
    },
    onError: (err) => {
      console.error('Google login error:', err)
      throw new Error(err.message || 'Google login failed')
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
    // For testing purposes, we can use a mock user if the API is not available
    loginMutation.mutate(values);
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

  const handleGoogleLogin = async (code) => {
    try {
      isLoading.value = true
      await googleLoginMutation.mutateAsync(code)
    } catch (error) {
      console.error('Google login failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // Clear auth store (which will also clear localStorage)
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
    loginWithGoogle: handleGoogleLogin,
    logout,
    error: loginMutation.error || microsoftLoginMutation.error || googleLoginMutation.error || forgotPasswordMutation.error || resetPasswordMutation.error,
    isLoading: isLoading.value || loginMutation.isPending || microsoftLoginMutation.isPending || googleLoginMutation.isPending || forgotPasswordMutation.isPending || resetPasswordMutation.isPending,
    success: success.value
  }
}