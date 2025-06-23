import axios from 'axios'

export const login = async (credentials) => {
  try {
    const response = await axios.post('https://jsonplaceholder.typicode.com/users', credentials)
    return { username: credentials.username }
  } catch (error) {
    throw new Error(error.message || 'Login failed')
  }
}