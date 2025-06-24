import { post } from '@/utils/requestClient.js'

export const login = async (credentials) => {
  try {
    const response = await post('/auth/login', credentials)
    return { username: credentials.username }
  } catch (error) {
    throw new Error(error.message || 'Login failed')
  }
}