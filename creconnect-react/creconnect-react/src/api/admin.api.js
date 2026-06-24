import api from './client';

export const adminApi = {
  getUsers:        (params) => api.get('/admin/users', { params }),
  updateStatus:    (id, data) => api.patch(`/admin/users/${id}/status`, data),
  getContent:      (params) => api.get('/admin/content', { params }),
  moderateContent: (id, action) => api.patch(`/admin/content/${id}/${action}`),
  getReports:      (params) => api.get('/admin/reports', { params }),
  resolveReport:   (id, action, data) => api.patch(`/admin/reports/${id}/${action}`, data),
  sendAnnouncement: (data) => api.post('/admin/announce', data),
  getAuditLogs:    (params) => api.get('/admin/audit-logs', { params }),
  getAnalytics:    () => api.get('/analytics/admin'),
};
