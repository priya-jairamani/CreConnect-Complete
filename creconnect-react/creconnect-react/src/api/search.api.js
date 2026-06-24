import api from './client';

export const searchApi = {
  creators:  (params) => api.get('/search/creators', { params }),
  brands:    (params) => api.get('/search/brands', { params }),
  campaigns: (params) => api.get('/search/campaigns', { params }),
};
