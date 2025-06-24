import { post } from '@/utils/requestClient.js'

export const login = async (credentials) => {
  try {
    const response = await post('/auth/login', credentials)
    return { username: credentials.username }
  } catch (error) {
    throw new Error(error.message || 'Login failed')
  }
}

export const forgotPassword = async (email) => {
  try {
    const response = await post('/forgot-password', { email })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to send reset link')
  }
}

export const resetPassword = async (resetData) => {
  try {
    const { token, password, confirmPassword } = resetData
    const response = await post('/reset-password', {
      token,
      'new-password': password,
      'confirm-password': confirmPassword
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to reset password')
  }
}