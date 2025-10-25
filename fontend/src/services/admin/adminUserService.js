import api from '../api';
import API_CONFIG from '../../config/apiConfig';

// Get all users with pagination and search
export const getUsers = (params = {}) => {
  return api.get(API_CONFIG.ENDPOINTS.ADMIN.USERS, { params });
};

// Get user by ID
export const getUser = (id) => {
  return api.get(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${id}`);
};

// Create user
export const createUser = (data) => {
  return api.post(API_CONFIG.ENDPOINTS.ADMIN.USERS, data);
};

// Update user
export const updateUser = (id, data) => {
  return api.put(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${id}`, data);
};

// Delete user
export const deleteUser = (id) => {
  return api.delete(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${id}`);
};

// Update user status
export const updateUserStatus = (id, status) => {
  return api.patch(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${id}/status`, { status });
};