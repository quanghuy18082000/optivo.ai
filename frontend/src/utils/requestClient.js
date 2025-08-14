import axios from 'axios';
import { getAccessToken, getRefreshToken, refreshTokenRequest, storeAuthTokens, clearAuthTokens } from './tokenRefresh.js';
import { buildApiQueryString } from './urlQueryParams.js';

// Get the API_URL from the environment variable
const API_URL = import.meta.env.VITE_BASE_API_URL;

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of requests to retry after token refresh
let refreshSubscribers = [];

// Function to add callbacks to the queue
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Function to resolve all queued requests
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Function to reject all queued requests
const onRefreshError = (error) => {
  refreshSubscribers.forEach(callback => callback(null, error));
  refreshSubscribers = [];
};

// Create an Axios instance to centralize API configuration
const apiClient = axios.create({
  baseURL: API_URL,
  // withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add authorization token (if any)
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve access token using the helper function
    const accessToken = getAccessToken();
    
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error('Error:', error);
    return Promise.reject(error);
  }
);

// We'll handle logout manually to avoid circular dependencies

// Intercept responses to handle errors
apiClient.interceptors.response.use(
  (response) => { 
    return response; // Return the response
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried refreshing the token yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Check if we have a refresh token
      const refreshToken = getRefreshToken();
      
      if (refreshToken && !isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
          // Try to refresh the token
          const response = await refreshTokenRequest(refreshToken);
          const { access_token, refresh_token } = response;
          
          // Store the new tokens
          storeAuthTokens({ access_token, refresh_token });
          
          // Update the Authorization header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          
          // Notify all the subscribers about the new token
          onTokenRefreshed(access_token);
          isRefreshing = false;
          
          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh token fails, reject all queued requests
          onRefreshError(refreshError);
          isRefreshing = false;
          
          // Clear auth data and redirect to login
          clearAuthTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else if (isRefreshing) {
        // If we're already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token, error) => {
            if (error) {
              reject(error);
              return;
            }
            
            // Retry the request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      } else {
        // No refresh token available, clear auth data and redirect to login
        console.error('Unauthorized! Please log in again.');
        
        // Clear auth data and redirect to login
        clearAuthTokens();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Enhanced GET wrapper with proper query parameter handling
const get = (url, params = {}) => {
  // If no params, use simple get
  if (!params || Object.keys(params).length === 0) {
    return apiClient.get(url);
  }

  // Build query string with proper array handling
  const queryString = buildApiQueryString(params);
  
  // Append query string to URL
  const separator = url.includes('?') ? '&' : '?';
  const fullUrl = queryString ? `${url}${separator}${queryString}` : url;
  
  return apiClient.get(fullUrl);
};

// Enhanced POST wrapper with query parameter support
const post = (url, data, config = {}) => {
  const { params, ...restConfig } = config;
  
  if (params && Object.keys(params).length > 0) {
    const queryString = buildApiQueryString(params);
    const separator = url.includes('?') ? '&' : '?';
    const fullUrl = queryString ? `${url}${separator}${queryString}` : url;
    return apiClient.post(fullUrl, data, restConfig);
  }
  
  return apiClient.post(url, data, config);
};

// Enhanced PUT wrapper with query parameter support
const put = (url, data, config = {}) => {
  const { params, ...restConfig } = config;
  
  if (params && Object.keys(params).length > 0) {
    const queryString = buildApiQueryString(params);
    const separator = url.includes('?') ? '&' : '?';
    const fullUrl = queryString ? `${url}${separator}${queryString}` : url;
    return apiClient.put(fullUrl, data, restConfig);
  }
  
  return apiClient.put(url, data, config);
};

// Enhanced PATCH wrapper with query parameter support
const patch = (url, data, config = {}) => {
  const { params, ...restConfig } = config;
  
  if (params && Object.keys(params).length > 0) {
    const queryString = buildApiQueryString(params);
    const separator = url.includes('?') ? '&' : '?';
    const fullUrl = queryString ? `${url}${separator}${queryString}` : url;
    return apiClient.patch(fullUrl, data, restConfig);
  }
  
  return apiClient.patch(url, data, config);
};

// A simple DELETE wrapper
const del = (url) => apiClient.delete(url);

export { get, post, put, patch, del };
