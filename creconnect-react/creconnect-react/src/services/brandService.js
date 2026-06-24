import api from './api';

export const brandService = {
  /** GET /brands?niche=&minBudget=&maxBudget= */
  search: (filters) =>
    api.get('/brands', { params: filters }),

  /** GET /brands/:id */
  getById: (id) =>
    api.get(`/brands/${id}`),

  /** GET /brands/profile */
  getProfile: () =>
    api.get('/brands/profile'),

  /** PUT /brands/profile */
  updateProfile: (payload) =>
    api.put('/brands/profile', payload),

  /** GET /brands/recommended-creators */
  getRecommendedCreators: () =>
    api.get('/brands/recommended-creators'),

  /** POST /brands/send-offer */
  sendOffer: (payload) =>
    api.post('/brands/send-offer', payload),

  /** GET /brands/reminders */
  getReminders: () =>
    api.get('/brands/reminders'),
};
