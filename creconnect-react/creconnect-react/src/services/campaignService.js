import api from './api';

export const campaignService = {
  /** GET /campaigns */
  getAll: () =>
    api.get('/campaigns'),

  /** GET /campaigns/:id */
  getById: (id) =>
    api.get(`/campaigns/${id}`),

  /** POST /campaigns */
  create: (payload) =>
    api.post('/campaigns', payload),

  /** PUT /campaigns/:id */
  update: (id, payload) =>
    api.put(`/campaigns/${id}`, payload),

  /** DELETE /campaigns/:id */
  remove: (id) =>
    api.delete(`/campaigns/${id}`),

  /** PATCH /campaigns/:id/status */
  updateStatus: (id, status) =>
    api.patch(`/campaigns/${id}/status`, { status }),

  /** GET /collaborations */
  getCollaborations: () =>
    api.get('/collaborations'),

  /** GET /collaborations/:id */
  getCollabById: (id) =>
    api.get(`/collaborations/${id}`),

  /** POST /collaborations */
  createCollab: (payload) =>
    api.post('/collaborations', payload),

  /** PATCH /collaborations/:id/status */
  updateCollabStatus: (id, status) =>
    api.patch(`/collaborations/${id}/status`, { status }),
};
