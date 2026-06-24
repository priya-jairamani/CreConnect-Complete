import api from './client';

export const paymentsApi = {
  createEscrow:   (collaborationId) => api.post(`/payments/escrow/${collaborationId}`),
  releasePayment: (paymentId)       => api.post(`/payments/release/${paymentId}`),
  getHistory:     ()                => api.get('/payments/history'),
};
