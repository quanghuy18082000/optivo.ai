import axios from 'axios';

// Get the API_URL from the environment variable
const API_URL = import.meta.env.VITE_BASE_API_URL;

/**
 * Function to refresh the access token using the refresh token
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<Object>} - The new tokens
 */
export const refreshTokenRequest = async (refreshToken) => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
      refresh_token: refreshToken
    });
    return response.data?.data;
  } catch (error) {
    throw new Error(error.message || 'Token refresh failed');
  }
};

/**
 * Function to store authentication tokens in localStorage
 * @param {Object} data - The authentication data containing tokens
 */
export const storeAuthTokens = (data) => {
  if (data && data.access_token) {
    localStorage.setItem('accessToken', data.access_token);
    
    if (data.refresh_token) {
      localStorage.setItem('refreshToken', data.refresh_token);
    }
    
    localStorage.setItem('isAuthenticated', 'true');
    
    if (data.user) {
      localStorage.setItem('userInfo', JSON.stringify(data.user));
    }
  }
};

/**
 * Function to clear all authentication data from localStorage
 */
export const clearAuthTokens = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
};

/**
 * Function to get the current access token from localStorage
 * @returns {string|null} - The access token or null if not found
 */
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Function to get the current refresh token from localStorage
 * @returns {string|null} - The refresh token or null if not found
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};