import api from './api';
import API_CONFIG from '../config/apiConfig';

export const getWishlist = () => {
  return api.get(API_CONFIG.ENDPOINTS.WISHLIST);
};

export const addToWishlist = (data) => {
  return api.post(API_CONFIG.ENDPOINTS.WISHLIST, data);
};

export const removeFromWishlist = (id) => {
  return api.delete(`${API_CONFIG.ENDPOINTS.WISHLIST}/${id}`);
};

export const clearWishlist = () => {
  return api.delete(API_CONFIG.ENDPOINTS.WISHLIST);
};