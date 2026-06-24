import api from './api';

export const notificationService = {
  /** GET /notifications */
  getAll: () =>
    api.get('/notifications'),

  /** PATCH /notifications/:id/read */
  markRead: (id) =>
    api.patch(`/notifications/${id}/read`),

  /** PATCH /notifications/read-all */
  markAllRead: () =>
    api.patch('/notifications/read-all'),

  /**
   * POST /admin/notifications/push
   * Sends a push notification to a segmented audience.
   */
  sendPush: ({ message, audience, deliveryMode, scheduledAt }) =>
    api.post('/admin/notifications/push', { message, audience, deliveryMode, scheduledAt }),

  /** GET /admin/notifications/failed */
  getFailedLog: () =>
    api.get('/admin/notifications/failed'),
};
