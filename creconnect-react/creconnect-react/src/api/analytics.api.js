import api from './client';

export const analyticsApi = {
  getBrand:   () => api.get('/analytics/brand'),
  getCreator: () => api.get('/analytics/creator'),
  getAdmin:   () => api.get('/analytics/admin'),
};
