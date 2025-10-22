import axios from 'axios';

// Create an axios instance with default settings
const api = axios.create({
  baseURL: 'http://localhost:8000', // Laravel backend URL
  withCredentials: true, // Required for authentication cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Add a request interceptor to include CSRF token
api.interceptors.request.use(
  async (config) => {
    // Get CSRF token from meta tag or endpoint
    let token = document.head.querySelector('meta[name="csrf-token"]');
    
    if (!token) {
      try {
        const response = await axios.get('http://localhost:8000/csrf-token', {
          withCredentials: true
        });
        token = response.data.token;
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    } else {
      token = token.content;
    }
    
    if (token) {
      config.headers['X-CSRF-TOKEN'] = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;