import api from '../api';
import API_CONFIG from '../../config/apiConfig';

// Get reviews with filters
export const getReviews = (params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.ADMIN.REVIEWS, { params });
};

// Approve review
export const approveReview = (id) => {
  return api.patch(`${API_CONFIG.ENDPOINTS.ADMIN.REVIEWS}/${id}/approve`);
};

// Reject review
export const rejectReview = (id) => {
  return api.patch(`${API_CONFIG.ENDPOINTS.ADMIN.REVIEWS}/${id}/reject`);
};

// Delete review
export const deleteReview = (id) => {
  return api.delete(`${API_CONFIG.ENDPOINTS.ADMIN.REVIEWS}/${id}`);
};