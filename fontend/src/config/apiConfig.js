// API Configuration
const API_CONFIG = {
  // Base URL for all API requests
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',

  // API Endpoints
  ENDPOINTS: {
    // Authentication endpoints
    REGISTER: '/api/register',
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    USER: '/api/user',
    UPDATE_PROFILE: '/api/user/profile',
    UPDATE_PASSWORD: '/api/user/password',


    // Sanctum CSRF endpoint
    CSRF_COOKIE: '/sanctum/csrf-cookie',

    // Public endpoints
    CATEGORIES: '/api/categories',
    PRODUCTS: '/api/products',
    PRODUCT_DETAIL: '/api/products',
    FEATURED_PRODUCTS: '/api/products/featured',
    SEARCH_PRODUCTS: '/api/products/search',
    PRODUCTS_BY_CATEGORY: '/api/products/category',
    BANNERS: '/api/banners',
    REVIEWS: '/api/reviews',

    // Protected endpoints
    CART: '/api/cart',
    ORDERS: '/api/orders',
    WISHLIST: '/api/wishlist',
    COUPONS_VALIDATE: '/api/coupons/validate',
    PAYMENT_INITIATE: '/api/payment/initiate',

    // Admin endpoints
    ADMIN: {
      DASHBOARD: '/api/admin/dashboard',
      CATEGORIES: '/api/admin/categories',
      PRODUCTS: '/api/admin/products',
      ORDERS: '/api/admin/orders',
      USERS: '/api/admin/users',
      COUPONS: '/api/admin/coupons',
      REVIEWS: '/api/admin/reviews',
      BANNERS: '/api/admin/banners',
      SETTINGS: '/api/admin/settings',
      REPORTS: '/api/admin/reports',
    },
  },

  // Default headers for API requests
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },

  // Axios configuration
  AXIOS_CONFIG: {
    withCredentials: true, // Required for Sanctum cookie authentication
  },
};

export default API_CONFIG;