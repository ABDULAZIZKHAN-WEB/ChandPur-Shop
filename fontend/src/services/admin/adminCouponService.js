import api from '../api';
import API_CONFIG from '../../config/apiConfig';

// Get coupons with filters
export const getCoupons = (params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.ADMIN.COUPONS, { params });
};

// Get coupon by ID
export const getCoupon = (id) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.COUPONS}/${id}`);
};

// Create coupon
export const createCoupon = (data) => {
  return api.post(API_CONFIG.ENDPOINTS.ADMIN.COUPONS, data);
};

// Update coupon
export const updateCoupon = (id, data) => {
  return api.put(`${API_CONFIG.ENDPOINTS.ADMIN.COUPONS}/${id}`, data);
};

// Delete coupon
export const deleteCoupon = (id) => {
  return api.delete(`${API_CONFIG.ENDPOINTS.ADMIN.COUPONS}/${id}`);
};

// Get coupon usage statistics
export const getCouponUsage = (id) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.COUPONS}/${id}/usage`);
};