import api from './api';
import API_CONFIG from '../config/apiConfig';

export const getProducts = (params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.PRODUCTS, { params });
};

export const getProduct = (slug) => {
  return api.get(`${API_CONFIG.ENDPOINTS.PRODUCT_DETAIL}/${slug}`);
};

export const getFeaturedProducts = () => {
  return api.get(API_CONFIG.ENDPOINTS.FEATURED_PRODUCTS);
};

export const searchProducts = (query, params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.SEARCH_PRODUCTS, { 
    params: { q: query, ...params } 
  });
};

export const getProductsByCategory = (slug, params = {}) => {
  return api.get(`${API_CONFIG.ENDPOINTS.PRODUCTS_BY_CATEGORY}/${slug}`, { params });
};

export const getCategories = () => {
  return api.get(API_CONFIG.ENDPOINTS.CATEGORIES);
};

export const getCategory = (slug) => {
  return api.get(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${slug}`);
};

export const getBanners = (params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.BANNERS, { params });
};