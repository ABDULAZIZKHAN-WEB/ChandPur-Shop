import api from './api';
import API_CONFIG from '../config/apiConfig';

export const getProductReviews = (productId, params = {}) => {
  return api.get(`${API_CONFIG.ENDPOINTS.REVIEWS}/product/${productId}`, { params });
};

export const createReview = (data) => {
  return api.post(API_CONFIG.ENDPOINTS.REVIEWS, data);
};

export const updateReview = (id, data) => {
  return api.put(`${API_CONFIG.ENDPOINTS.REVIEWS}/${id}`, data);
};

export const deleteReview = (id) => {
  return api.delete(`${API_CONFIG.ENDPOINTS.REVIEWS}/${id}`);
};