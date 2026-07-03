import api from './client';

export const subscriptionsApi = {
  getMine:       ()      => api.get('/subscriptions/me'),
  listPlans:     ()      => api.get('/subscriptions/plans'),
  checkout:      (tier)  => api.post('/subscriptions/checkout', { tier }),
  billingPortal: ()      => api.post('/subscriptions/billing-portal'),
};
