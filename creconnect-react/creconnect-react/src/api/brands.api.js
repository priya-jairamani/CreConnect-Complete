import api from './client';

export const brandsApi = {
  getProfile:        ()                 => api.get('/brands/me'),
  updateProfile:     (data)             => api.patch('/brands/me', data),
  getStats:          ()                 => api.get('/brands/me/stats'),
  getCampaigns:      (params)           => api.get('/brands/me/campaigns', { params }),
  getCollaborations:  (params)           => api.get('/brands/me/collaborations', { params }),
  getApplications:    (params)           => api.get('/brands/me/applications',   { params }),
  listBrands:        (params)           => api.get('/brands/list', { params }),

  /* ── Brand Media Gallery ──────────────────────────────────────── */
  getMedia:          (params)           => api.get('/brands/me/media', { params }),
  addMedia:          (data)             => api.post('/brands/me/media', data),
  updateMedia:       (id, data)         => api.patch(`/brands/me/media/${id}`, data),
  deleteMedia:       (id)               => api.delete(`/brands/me/media/${id}`),
  setFeatured:       (id, isFeatured)   => api.patch(`/brands/me/media/${id}/featured`, { isFeatured }),
};
