import axios from 'axios';

// Get the API_URL from the environment variable
const API_URL = import.meta.env.VITE_BASE_API_URL;

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
    // Retrieve access token from localStorage
    const accessToken = localStorage.getItem('accessToken');
    // const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    console.log("🚀 ~ file: requestClient.js:23 ~ config:", config);
    return config;
  },
  (error) => {
    console.error('Error:', error);
    return Promise.reject(error);
  }
);

// Intercept responses to handle errors
apiClient.interceptors.response.use(
  (response) => { 
    console.log('Response:', response);
    return response; // Make sure to return the response
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response && error.response.status === 401) {
      // Handle Unauthorized error (e.g., redirect to login page)
      console.error('Unauthorized! Please log in again.');
      
      // Clear auth data
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// A simple GET wrapper
const get = (url, params = {}) => apiClient.get(url, { params });

// A simple POST wrapper
const post = (url, data) => apiClient.post(url, data);

// A simple PUT wrapper
const put = (url, data) => apiClient.put(url, data);

// A simple DELETE wrapper
const del = (url) => apiClient.delete(url);

export { get, post, put, del };
