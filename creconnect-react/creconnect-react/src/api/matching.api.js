import api from './client';

export const matchingApi = {
  getRecommended:       (limit) => api.get('/matching/recommended', { params: { limit } }),
  getCampaignMatches:   (campaignId, limit) => api.get(`/matching/campaign/${campaignId}`, { params: { limit } }),
};
