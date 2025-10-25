import api from './api';
import API_CONFIG from '../config/apiConfig';

export const getCart = () => {
  return api.get(API_CONFIG.ENDPOINTS.CART);
};

export const addToCart = (data) => {
  return api.post(API_CONFIG.ENDPOINTS.CART, data);
};

export const updateCartItem = (id, data) => {
  return api.put(`${API_CONFIG.ENDPOINTS.CART}/${id}`, data);
};

export const removeFromCart = (id) => {
  return api.delete(`${API_CONFIG.ENDPOINTS.CART}/${id}`);
};

export const clearCart = () => {
  return api.delete(API_CONFIG.ENDPOINTS.CART);
};