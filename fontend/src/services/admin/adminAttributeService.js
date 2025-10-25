import api from '../api';
import API_CONFIG from '../../config/apiConfig';

// Get product attributes
export const getProductAttributes = (productId) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/${productId}/attributes`);
};

// Create product attribute
export const createProductAttribute = (productId, data) => {
  return api.post(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/${productId}/attributes`, data);
};

// Update product attribute
export const updateProductAttribute = (productId, attributeId, data) => {
  return api.put(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/${productId}/attributes/${attributeId}`, data);
};

// Delete product attribute
export const deleteProductAttribute = (productId, attributeId) => {
  return api.delete(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/${productId}/attributes/${attributeId}`);
};