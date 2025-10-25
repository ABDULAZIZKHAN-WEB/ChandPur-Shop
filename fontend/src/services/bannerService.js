import api from './api';
import API_CONFIG from '../config/apiConfig';

export const getBanners = (position = null) => {
  const params = position ? { position } : {};
  return api.get(API_CONFIG.ENDPOINTS.BANNERS, { params });
};