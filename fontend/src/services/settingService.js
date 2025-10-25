import api from './api';
import API_CONFIG from '../config/apiConfig';

// Get all public settings
export const getPublicSettings = () => {
  return api.get('/api/settings');
};

// Get settings by group
export const getSettingsByGroup = (group) => {
  return api.get(`/api/settings/group/${group}`);
};