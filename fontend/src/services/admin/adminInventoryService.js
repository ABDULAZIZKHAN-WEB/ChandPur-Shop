import api from '../api';
import API_CONFIG from '../../config/apiConfig';

// Get low stock products
export const getLowStockProducts = (params = {}) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/low-stock`, { params });
};

// Get out of stock products
export const getOutOfStockProducts = (params = {}) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/out-of-stock`, { params });
};

// Get inventory report
export const getInventoryReport = () => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.REPORTS}/inventory`);
};

// Update product quantity
export const updateProductQuantity = (id, data) => {
  return api.put(`${API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS}/${id}`, data);
};

// Get all products with inventory filters
export const getInventoryProducts = (params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS, { params });
};