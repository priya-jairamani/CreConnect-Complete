import api from './api';

export const creatorService = {
  /** GET /creators?niche=&minFollowers=&maxFollowers=&platform= */
  search: (filters) =>
    api.get('/creators', { params: filters }),

  /** GET /creators/:id */
  getById: (id) =>
    api.get(`/creators/${id}`),

  /** GET /creators/profile  (own profile) */
  getProfile: () =>
    api.get('/creators/profile'),

  /** PUT /creators/profile */
  updateProfile: (payload) =>
    api.put('/creators/profile', payload),

  /** GET /creators/collaborations */
  getCollaborations: () =>
    api.get('/creators/collaborations'),

  /** GET /creators/offers */
  getOffers: () =>
    api.get('/creators/offers'),

  /** POST /creators/offers/:id/respond */
  respondToOffer: (offerId, status) =>
    api.post(`/creators/offers/${offerId}/respond`, { status }),

  /** POST /creators/report */
  reportCreator: (payload) =>
    api.post('/creators/report', payload),

  /** GET /creators/notifications */
  getNotifications: () =>
    api.get('/creators/notifications'),
};
