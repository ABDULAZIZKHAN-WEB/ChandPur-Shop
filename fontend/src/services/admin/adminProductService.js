import api from '../api';
import API_CONFIG from '../../config/apiConfig';

// Get products with filters
export const getProducts = (params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS, { params });
};

// Get product by ID
export const getProduct = (id) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/${id}`);
};

// Create product with image support
export const createProduct = (data) => {
  // If data is FormData, don't set Content-Type (let browser set it with boundary)
  if (data instanceof FormData) {
    return api.post(API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  return api.post(API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS, data);
};

// Update product with image support
export const updateProduct = (id, data) => {
  // If data is FormData, don't set Content-Type (let browser set it with boundary)
  if (data instanceof FormData) {
    // Add _method parameter to simulate PUT request
    data.append('_method', 'PUT');
    return api.post(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  return api.put(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/${id}`, data);
};

// Delete product
export const deleteProduct = (id) => {
  return api.delete(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/${id}`);
};

// Get categories
export const getCategories = () => {
  return api.get(API_CONFIG.ENDPOINTS.ADMIN.CATEGORIES);
};

// Export products to CSV
export const exportProducts = () => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/export`, {
    responseType: 'blob'
  });
};

// Import products from CSV
export const importProducts = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Upload product gallery images
export const uploadGallery = (id, images) => {
  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append('images[]', image);
  });
  
  return api.post(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/${id}/gallery`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Delete gallery image
export const deleteGalleryImage = (id, image) => {
  return api.delete(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/${id}/gallery/${image}`);
};