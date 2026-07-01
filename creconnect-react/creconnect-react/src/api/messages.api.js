import api from './client';

export const messagesApi = {
  getUnreadCount:     ()                             => api.get('/messages/unread-count'),
  getConversations:  ()                             => api.get('/messages/conversations'),
  createConversation: (otherUserId)                 => api.post('/messages/conversations', { otherUserId }),
  getMessages:        (conversationId, params)      => api.get(`/messages/conversations/${conversationId}/messages`, { params }),
  sendMessage:        (conversationId, body)        => api.post(`/messages/conversations/${conversationId}/messages`, body),
  markRead:           (conversationId)               => api.post(`/messages/conversations/${conversationId}/read`),
  toggleReaction:     (conversationId, messageId, emoji) => api.patch(`/messages/conversations/${conversationId}/messages/${messageId}/reaction`, { emoji }),
};
