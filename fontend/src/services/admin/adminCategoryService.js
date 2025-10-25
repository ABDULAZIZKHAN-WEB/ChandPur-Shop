import api from '../api';
import API_CONFIG from '../../config/apiConfig';

// Get all categories
export const getCategories = (params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.ADMIN.CATEGORIES, { params });
};

// Get category by ID
export const getCategory = (id) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.CATEGORIES}/${id}`);
};

// Create category with image support
export const createCategory = (data) => {
  // If data is FormData, don't set Content-Type (let browser set it with boundary)
  if (data instanceof FormData) {
    return api.post(API_CONFIG.ENDPOINTS.ADMIN.CATEGORIES, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  return api.post(API_CONFIG.ENDPOINTS.ADMIN.CATEGORIES, data);
};

// Update category with image support
export const updateCategory = (id, data) => {
  // If data is FormData, don't set Content-Type (let browser set it with boundary)
  if (data instanceof FormData) {
    // Add _method parameter to simulate PUT request
    data.append('_method', 'PUT');
    return api.post(`${API_CONFIG.ENDPOINTS.ADMIN.CATEGORIES}/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  return api.put(`${API_CONFIG.ENDPOINTS.ADMIN.CATEGORIES}/${id}`, data);
};

// Delete category
export const deleteCategory = (id) => {
  return api.delete(`${API_CONFIG.ENDPOINTS.ADMIN.CATEGORIES}/${id}`);
};

// Reorder categories
export const reorderCategories = (data) => {
  return api.post(`${API_CONFIG.ENDPOINTS.ADMIN.CATEGORIES}/reorder`, data);
};