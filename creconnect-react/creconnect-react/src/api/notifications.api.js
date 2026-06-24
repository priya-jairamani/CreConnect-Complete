import api from './client';

export const notificationsApi = {
  getAll:       ()                      => api.get('/notifications'),
  getUnread:    ()                      => api.get('/notifications/unread-count'),
  markRead:     (id)                    => api.patch(`/notifications/${id}/read`),
  markAllRead:  ()                      => api.patch('/notifications/read-all'),
  delete:       (id)                    => api.delete(`/notifications/${id}`),
  createSelf:   (message, type)         => api.post('/notifications/self', { message, type }),
};
