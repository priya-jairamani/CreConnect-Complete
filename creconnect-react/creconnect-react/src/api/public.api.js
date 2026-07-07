import api from './client';

export const publicApi = {
  getDiscover: () => api.get('/public/discover'),
};
