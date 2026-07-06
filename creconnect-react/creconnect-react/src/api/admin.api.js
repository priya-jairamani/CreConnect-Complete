import api from './client';

export const adminApi = {
  getUsers:        (params) => api.get('/admin/users', { params }),
  updateStatus:    (id, data) => api.patch(`/admin/users/${id}/status`, data),
  getCampaigns:    (params) => api.get('/admin/campaigns', { params }),
  getContent:      (params) => api.get('/admin/content', { params }),
  moderateContent: (id, action) => api.patch(`/admin/content/${id}/${action}`),
  getReports:      (params) => api.get('/admin/reports', { params }),
  resolveReport:   (id, action, data) => api.patch(`/admin/reports/${id}/${action}`, data),
  sendAnnouncement: (data) => api.post('/admin/announce', {
    message: data.message ?? data.body,
    audience: data.audience,
  }),
  getAuditLogs:    (params) => api.get('/admin/audit-logs', { params }),
  getAnalytics:    (params) => api.get('/analytics/admin', { params }),

  // Operations — support tickets
  getTickets:   (params) => api.get('/admin/tickets', { params }),
  createTicket: (data) => api.post('/admin/tickets', data),
  updateTicket: (id, data) => api.patch(`/admin/tickets/${id}`, data),

  // Revenue & Payments
  getPayments:         (params) => api.get('/admin/payments', { params }),
  getSubscriptions:    (params) => api.get('/admin/subscriptions', { params }),
  getRevenueSummary:   () => api.get('/admin/revenue'),
  disputePayment:      (id, reason) => api.patch(`/admin/payments/${id}/dispute`, { reason }),
  resolveDispute:      (id, resolution) => api.patch(`/admin/payments/${id}/resolve-dispute`, { resolution }),

  // Platform settings
  getSettings:    () => api.get('/admin/settings'),
  updateSettings: (data) => api.patch('/admin/settings', data),

  // Notifications
  getNotifications:       (params) => api.get('/admin/notifications', { params }),
  getFailedNotifications: (params) => api.get('/admin/notifications/failed', { params }),
  sendPushNotification:   (data) => api.post('/admin/notifications/push', data),
};
