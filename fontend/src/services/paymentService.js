import api from './api';
import API_CONFIG from '../config/apiConfig';

export const initiatePayment = async (orderData) => {
  try {
    console.log('Making payment request with data:', orderData);
    const response = await api.post(API_CONFIG.ENDPOINTS.PAYMENT_INITIATE, orderData);
    console.log('Payment response:', response);
    return response;
  } catch (error) {
    console.error('Payment service error:', error);
    // If it's a validation error, return it in the same format as success responses
    if (error.response?.status === 400) {
      return error.response;
    }
    throw error;
  }
};

export const validateCoupon = (data) => {
  return api.post(API_CONFIG.ENDPOINTS.COUPONS_VALIDATE, data);
};