import api from '../api';
import API_CONFIG from '../../config/apiConfig';

// Get orders with filters
export const getOrders = (params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.ADMIN.ORDERS, { params });
};

// Get order by ID
export const getOrder = (id) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.ORDERS}/${id}`);
};

// Update order status
export const updateOrderStatus = (id, data) => {
  return api.patch(`${API_CONFIG.ENDPOINTS.ADMIN.ORDERS}/${id}/status`, data);
};

// Add order note
export const addOrderNote = (id, data) => {
  return api.post(`${API_CONFIG.ENDPOINTS.ADMIN.ORDERS}/${id}/notes`, data);
};

// Generate invoice
export const generateInvoice = (id) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.ORDERS}/${id}/invoice`, {
    responseType: 'blob'
  });
};

// Export orders to CSV
export const exportOrders = () => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.ORDERS}/export`, {
    responseType: 'blob'
  });
};