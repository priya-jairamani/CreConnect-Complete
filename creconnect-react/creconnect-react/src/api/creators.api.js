import api from './client';

export const creatorsApi = {
  getProfile:        ()              => api.get('/creators/me'),
  updateProfile:     (data)          => api.patch('/creators/me', data),
  getStats:          ()              => api.get('/creators/me/stats'),
  getCollaborations: (params)        => api.get('/creators/me/collaborations', { params }),
  getOffers:         ()              => api.get('/creators/me/offers'),
  getApplications:   ()              => api.get('/creators/me/applications'),
  addPlatform:       (data)          => api.post('/creators/me/platforms', data),
  removePlatform:    (id)            => api.delete(`/creators/me/platforms/${id}`),
  getPublicProfile:  (username)      => api.get(`/creators/${username}`),
  getPublicMedia:    (creatorId)     => api.get(`/creators/${creatorId}/public-media`),

  /* ── Social platform media ────────────────────────────────────── */
  getPlatformPosts: (platformId) => api.get(`/social/platforms/${platformId}/posts`),
  syncPlatformPosts:(platformId) => api.post(`/social/platforms/${platformId}/sync`),

  /* ── Media Gallery ──────────────────────────────────────────────
     Backend stores: fileUrl, thumbnailUrl, title, description,
     platform, contentType, tags[], visibility, isFeatured,
     views, likes, comments, reach, order, campaignId, createdAt
  */
  getMedia:          (params)        => api.get('/creators/me/media', { params }),
  addMedia:          (data)          => api.post('/creators/me/media', data),
  updateMedia:       (id, data)      => api.patch(`/creators/me/media/${id}`, data),
  deleteMedia:       (id)            => api.delete(`/creators/me/media/${id}`),
  setFeatured:       (id, isFeatured)=> api.patch(`/creators/me/media/${id}/featured`, { isFeatured }),
  reorderMedia:      (orderedIds)    => api.patch('/creators/me/media/reorder', { orderedIds }),
};
