import api from './api';

export const adminService = {
  /** GET /admin/stats */
  getStats: () =>
    api.get('/admin/stats'),

  /** GET /admin/users?role=creator|brand&status= */
  getUsers: (params) =>
    api.get('/admin/users', { params }),

  /** PATCH /admin/users/:id/status */
  updateUserStatus: (id, status) =>
    api.patch(`/admin/users/${id}/status`, { status }),

  /** DELETE /admin/users/:id */
  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`),

  /** GET /admin/content */
  getContent: () =>
    api.get('/admin/content'),

  /** PATCH /admin/content/:id/status */
  moderateContent: (id, action) =>
    api.patch(`/admin/content/${id}/status`, { action }),

  /** GET /admin/reports */
  getReports: () =>
    api.get('/admin/reports'),

  /** PATCH /admin/reports/:id */
  resolveReport: (id, resolution) =>
    api.patch(`/admin/reports/${id}`, { resolution }),
};
