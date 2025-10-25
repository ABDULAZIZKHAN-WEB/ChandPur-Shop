import api from '../api';
import API_CONFIG from '../../config/apiConfig';

// Get all settings
export const getSettings = () => {
  return api.get(API_CONFIG.ENDPOINTS.ADMIN.SETTINGS);
};

// Update settings
export const updateSettings = (data) => {
  return api.post(API_CONFIG.ENDPOINTS.ADMIN.SETTINGS, data);
};