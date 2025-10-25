import axios from 'axios';
import API_CONFIG from '../config/apiConfig';

// Create an axios instance with default settings
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: API_CONFIG.AXIOS_CONFIG.withCredentials,
  headers: API_CONFIG.HEADERS,
});

// Track CSRF cookie fetch status
let csrfCookieFetched = false;
let csrfFetchPromise = null;

// Function to get CSRF token from cookie
const getCSRFToken = () => {
  const name = "XSRF-TOKEN=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      const token = c.substring(name.length, c.length);
      // Decode the token properly
      return decodeURIComponent(token);
    }
  }
  return "";
};

// Function to ensure CSRF cookie is set
const ensureCSRFCookie = async () => {
  // If we're already fetching, return the existing promise
  if (csrfFetchPromise) {
    return csrfFetchPromise;
  }
  
  // If we've already fetched, just get the token
  if (csrfCookieFetched) {
    return getCSRFToken();
  }
  
  // Create a new promise for fetching the CSRF cookie
  csrfFetchPromise = axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CSRF_COOKIE}`, {
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .then((response) => {
    csrfCookieFetched = true;
    const token = getCSRFToken();
    return token;
  })
  .catch((error) => {
    csrfCookieFetched = false;
    return null;
  })
  .finally(() => {
    csrfFetchPromise = null;
  });
  
  return csrfFetchPromise;
};

// Add a request interceptor to include CSRF token
api.interceptors.request.use(
  async (config) => {
    // Always ensure CSRF cookie is set for POST, PUT, PATCH, DELETE requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      const csrfToken = await ensureCSRFCookie();
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    csrfFetchPromise = null;
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // Only redirect if we're not already on the login page
      // AND we're trying to access a protected route
      const protectedRoutes = [
        '/dashboard',
        '/cart',
        '/checkout',
        '/orders',
        '/wishlist',
        '/profile',
        '/admin'
      ];
      
      const currentPath = window.location.pathname;
      const isProtectedRoute = protectedRoutes.some(route => 
        currentPath.startsWith(route)
      );
      
      if (isProtectedRoute && 
          currentPath !== '/login' && 
          currentPath !== '/login/') {
        window.location.href = '/login';
      }
      // For public routes, we just let the error propagate without redirecting
    } else if (error.response?.status === 419) {
      // CSRF token mismatch - reset the fetch status and retry
      csrfCookieFetched = false;
      csrfFetchPromise = null;
      
      // Retry the request once
      if (!error.config._retry) {
        error.config._retry = true;
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;