const svc = require('../services/messages.service');
const { ok, created, paginated } = require('../utils/response');

const getConversations = async (req, res, next) => {
  try { ok(res, await svc.getConversations(req.user.id, req.user.role)); } catch (e) { next(e); }
};

const createConversation = async (req, res, next) => {
  try { created(res, await svc.createConversation(req.user.id, req.user.role, req.body.otherUserId)); } catch (e) { next(e); }
};

const getMessages = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.getMessages(req.params.id, req.user.id, req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

const sendMessage = async (req, res, next) => {
  try {
    // Accept attachment URL from JSON body (pre-uploaded) OR from multer file upload
    const attachment = req.body.attachment || req.file?.path || null;
    const msg = await svc.sendMessage(req.params.id, req.user.id, req.body.content, attachment);
    created(res, msg, 'Message sent');
  } catch (e) { next(e); }
};

const toggleReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return next(new (require('../utils/errors').ValidationError)('emoji is required'));
    const reactions = await svc.toggleReaction(req.params.messageId, req.user.id, emoji);
    ok(res, reactions, 'Reaction toggled');
  } catch (e) { next(e); }
};

const markConversationRead = async (req, res, next) => {
  try { ok(res, await svc.markConversationRead(req.params.id, req.user.id), 'Marked as read'); } catch (e) { next(e); }
};

const getUnreadCount = async (req, res, next) => {
  try { ok(res, { count: await svc.getUnreadCount(req.user.id) }); } catch (e) { next(e); }
};

module.exports = { getConversations, createConversation, getMessages, sendMessage, markConversationRead, getUnreadCount, toggleReaction };
