import axios from 'axios';

// Get the API_URL from the environment variable
const API_URL = import.meta.env.VITE_BASE_API_URL;

// Create an Axios instance to centralize API configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Optional: Set a timeout (in milliseconds) for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add authorization token (if any)
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve token from localStorage (or any other state management tool)
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle Unauthorized error (e.g., redirect to login page)
      console.error('Unauthorized! Please log in again.');
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
