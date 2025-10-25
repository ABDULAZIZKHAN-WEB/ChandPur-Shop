import api from './api';
import API_CONFIG from '../config/apiConfig';

export const getOrders = (params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.ORDERS, { params });
};

export const getOrder = (id) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`);
};

export const createOrder = (data) => {
  return api.post(API_CONFIG.ENDPOINTS.ORDERS, data);
};