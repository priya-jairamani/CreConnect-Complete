import api from './client';

export const copilotApi = {
  /**
   * POST /copilot/chat
   * message  — the user's natural language input
   * context  — optional page/entity context { page, brandId, creatorId }
   */
  chat: (message, context = {}) =>
    api.post('/copilot/chat', { message, context }),
};
