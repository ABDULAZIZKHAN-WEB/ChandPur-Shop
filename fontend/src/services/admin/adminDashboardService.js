import api from '../api';
import API_CONFIG from '../../config/apiConfig';

export const getDashboardStatistics = () => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD}/statistics`);
};

export const getRecentOrders = () => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD}/recent-orders`);
};

export const getTopProducts = () => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD}/top-products`)
    .catch(error => {
      console.error('Error fetching top products:', error);
      return { data: [] };
    });
};

export const getSalesChart = (params = {}) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD}/sales-chart`, { params });
};

export const getLowStockProducts = () => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD}/low-stock`);
};