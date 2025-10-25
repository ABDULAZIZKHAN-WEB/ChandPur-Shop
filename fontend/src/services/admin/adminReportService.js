import api from '../api';
import API_CONFIG from '../../config/apiConfig';

// Get sales report
export const getSalesReport = (params = {}) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.REPORTS}/sales`, { params });
};

// Get products report
export const getProductsReport = (params = {}) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.REPORTS}/products`, { params });
};

// Get customers report
export const getCustomersReport = (params = {}) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.REPORTS}/customers`, { params });
};

// Get inventory report
export const getInventoryReport = () => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.REPORTS}/inventory`);
};