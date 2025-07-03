import { post } from '@/utils/requestClient.js'
import { storeAuthTokens, clearAuthTokens, refreshTokenRequest } from '@/utils/tokenRefresh.js'

export const refreshToken = async (refreshToken) => {
  return refreshTokenRequest(refreshToken);
}

export const login = async (credentials) => {
  try {
    const response = await post('/auth/login', credentials)
    const data = response.data?.data
    
    // Store tokens in localStorage
    storeAuthTokens(data);
    
    return data
  } catch (error) {
    throw new Error(error.message || 'Login failed')
  }
}

export const logout = () => {
  // Clear all authentication data from localStorage
  clearAuthTokens();
  
  // Redirect to login page
  window.location.href = '/login'
}


export const forgotPassword = async (email) => {
  try {
    const response = await post('/auth/forgot-password', { email })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to send reset link')
  }
}

export const resetPassword = async (resetData) => {
  try {
    const { token, password, confirmPassword } = resetData
    const response = await post('/auth/reset-password', {
      token,
      'new_password': password
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to reset password')
  }
}

export const changePassword = async (passwordData) => {
  try {
    const { currentPassword, newPassword } = passwordData
    const response = await post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to change password')
  }
}

export const updateProfile = async (profileData) => {
  try {
    const response = await post('/auth/update-profile', profileData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to update profile')
  }
}