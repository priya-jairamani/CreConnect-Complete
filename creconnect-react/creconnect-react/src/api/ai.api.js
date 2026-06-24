import api from './client';

export const aiApi = {
  /** GET /ai/matches/brand/:brandId  — pre-computed top creator matches */
  getBrandMatches:   (brandId, limit = 10)   => api.get(`/ai/matches/brand/${brandId}`,   { params: { limit } }),

  /** GET /ai/matches/creator/:creatorId  — pre-computed top brand matches */
  getCreatorMatches: (creatorId, limit = 10) => api.get(`/ai/matches/creator/${creatorId}`, { params: { limit } }),

  /** POST /ai/feedback  — record brand accept/reject on a suggested creator */
  sendFeedback: (brandId, creatorId, accepted) => api.post('/ai/feedback', { brandId, creatorId, accepted }),

  /** GET /ai/matches/brand/:brandId/live  — live score without cache (slower) */
  getLiveBrandMatches: (brandId, limit = 10) => api.get(`/ai/matches/brand/${brandId}/live`, { params: { limit } }),
};
