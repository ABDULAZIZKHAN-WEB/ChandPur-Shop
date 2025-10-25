import api from '../api';
import API_CONFIG from '../../config/apiConfig';

// Get banners with filters
export const getBanners = (params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.ADMIN.BANNERS, { params });
};

// Get banner by ID
export const getBanner = (id) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.BANNERS}/${id}`);
};

// Create banner
export const createBanner = (data) => {
  return api.post(API_CONFIG.ENDPOINTS.ADMIN.BANNERS, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Update banner
export const updateBanner = (id, data) => {
  // If data is FormData, add method spoofing for PUT request
  if (data instanceof FormData) {
    data.append('_method', 'PUT');
    return api.post(`${API_CONFIG.ENDPOINTS.ADMIN.BANNERS}/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  return api.put(`${API_CONFIG.ENDPOINTS.ADMIN.BANNERS}/${id}`, data);
};

// Delete banner
export const deleteBanner = (id) => {
  return api.delete(`${API_CONFIG.ENDPOINTS.ADMIN.BANNERS}/${id}`);
};

// Reorder banners
export const reorderBanners = (data) => {
  return api.post(`${API_CONFIG.ENDPOINTS.ADMIN.BANNERS}/reorder`, data);
};