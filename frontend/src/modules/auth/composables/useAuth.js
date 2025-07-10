import { useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '../store'
import { login, forgotPassword as forgotPasswordService, resetPassword as resetPasswordService } from '../services/authService'
import { loginWithMicrosoft, loginWithGoogle } from '../services/oauthService'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const isLoading = ref(false)
  const success = ref(false)
  const toast = useToast()
  const { t } = useI18n()

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Handle the new response format with access_token, refresh_token, and user_info
      authStore.login(data, 'user')
      
      router.push('/')
    },
    onError: (err) => {
      // Show error toast
      toast.error(err.message || t('auth.login.failed'))
      
      return err.message || 'invalid'
    },
  })

  const microsoftLoginMutation = useMutation({
    mutationFn: loginWithMicrosoft,
    onSuccess: (data) => {
      // Handle the new response format with access_token, refresh_token, and user_info
      authStore.login(data?.data, 'user', 'microsoft')
      
      // Show success toast
      
      router.push('/')
    },
    onError: (err) => {
      console.error('Microsoft login error:', err)
      
      // Show error toast
      toast.error(err.message || t('auth.login.failed'))
      
      throw new Error(err.message || 'Microsoft login failed')
    },
  })

  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data) => {
      // Handle the new response format with access_token, refresh_token, and user_info
      authStore.login(data?.data, 'user', 'google')
      
      // Show success toast
      toast.success(t('auth.login.google_success') || 'Google login successful')
      
      router.push('/')
    },
    onError: (err) => {
      console.error('Google login error:', err)
      
      // Show error toast
      toast.error(err.message || t('auth.login.google_failed') || 'Google login failed')
      
      throw new Error(err.message || 'Google login failed')
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordService,
    onSuccess: (data) => {
      success.value = true
      
      // Show success toast
      toast.success(data?.message || t('auth.forgot.success'))
    },
    onError: (err) => {
      success.value = false
      
      // Show error toast
      toast.error(err.message || t('auth.forgot.failed'))
      
      throw new Error(err.message || 'Failed to send reset link')
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordService,
    onSuccess: (data) => {
      success.value = true
      
      // Show success toast
      toast.success(data.message || t('auth.reset_password.success'))
      
      // Redirect to login after successful reset
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    },
    onError: (err) => {
      success.value = false
      
      // Show error toast
      toast.error(err.message || t('auth.reset_password.failed') || 'Failed to reset password')
      
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
      
      // Show success toast
      toast.success(t('auth.logout.success') || 'You have been logged out successfully')
      
      // Redirect to login
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      
      // Show error toast
      toast.error(error.message || t('auth.logout.failed') || 'Logout failed')
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