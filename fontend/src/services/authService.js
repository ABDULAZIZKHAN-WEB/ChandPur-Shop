import api from './api';
import API_CONFIG from '../config/apiConfig';

// Ensure CSRF cookie before authentication requests
const ensureCSRF = async () => {
  try {
    await api.get(API_CONFIG.ENDPOINTS.CSRF_COOKIE);
  } catch (error) {
    console.warn('Failed to fetch CSRF cookie:', error);
  }
};

export const register = async (data) => {
  await ensureCSRF();
  return api.post(API_CONFIG.ENDPOINTS.REGISTER, data);
};

export const login = async (data) => {
  await ensureCSRF();
  return api.post(API_CONFIG.ENDPOINTS.LOGIN, data);
};

export const logout = () => api.post(API_CONFIG.ENDPOINTS.LOGOUT);

export const getUser = () => api.get(API_CONFIG.ENDPOINTS.USER);

export const updateProfile = (data) => api.put(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, data);

export const updatePassword = (data) => api.put(API_CONFIG.ENDPOINTS.UPDATE_PASSWORD, data);