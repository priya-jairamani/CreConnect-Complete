const { Conversation, Message, CreatorProfile, BrandProfile, User } = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const { emitToConversation } = require('../config/socket');
const { logActivity } = require('../utils/activity');

async function getConversations(userId, role) {
  const where = role === 'CREATOR'
    ? { '$creator.userId$': userId }
    : { '$brand.userId$':   userId };

  return Conversation.findAll({
    where,
    order: [['lastMessageAt', 'DESC']],
    include: [
      { model: CreatorProfile, as: 'creator', attributes: ['userId', 'displayName', 'avatarUrl', 'username'] },
      { model: BrandProfile,   as: 'brand',   attributes: ['userId', 'companyName', 'logoUrl'] },
    ],
  });
}

async function createConversation(userId, role, otherUserId) {
  let creatorId, brandId;

  if (role === 'CREATOR') {
    const creator = await CreatorProfile.findOne({ where: { userId } });
    if (!creator) throw new ForbiddenError();
    // Accept either User.id OR BrandProfile.id
    const brand = await BrandProfile.findOne({ where: { userId: otherUserId } })
               ?? await BrandProfile.findByPk(otherUserId);
    if (!brand) throw new NotFoundError('Brand not found');
    creatorId = creator.id;
    brandId   = brand.id;
  } else {
    const brand = await BrandProfile.findOne({ where: { userId } });
    if (!brand) throw new ForbiddenError();
    // Accept either User.id OR CreatorProfile.id
    const creator = await CreatorProfile.findOne({ where: { userId: otherUserId } })
                 ?? await CreatorProfile.findByPk(otherUserId);
    if (!creator) throw new NotFoundError('Creator not found');
    creatorId = creator.id;
    brandId   = brand.id;
  }

  const [convo, created] = await Conversation.findOrCreate({
    where: { creatorId, brandId },
    defaults: { creatorId, brandId },
  });

  const result = await convo.reload({
    include: [
      { model: CreatorProfile, as: 'creator', attributes: ['userId', 'displayName', 'avatarUrl', 'username'] },
      { model: BrandProfile,   as: 'brand',   attributes: ['userId', 'companyName', 'logoUrl'] },
    ],
  });

  if (created) {
    // Log for both participants
    const brandUserId   = result.brand?.userId;
    const creatorUserId = result.creator?.userId;
    const meta = { with: role === 'CREATOR' ? result.brand?.companyName : result.creator?.displayName };
    if (brandUserId)   logActivity(brandUserId,   'message.conversation_started', { entity: 'conversation', entityId: convo.id, meta });
    if (creatorUserId) logActivity(creatorUserId, 'message.conversation_started', { entity: 'conversation', entityId: convo.id, meta });
  }

  return result;
}

async function getMessages(conversationId, userId, query) {
  const { offset, limit, page } = parsePagination(query, 50);
  await _assertParticipant(conversationId, userId);

  const { rows, count } = await Message.findAndCountAll({
    where: { conversationId },
    offset,
    limit,
    order: [['createdAt', 'ASC']],
    include: [{ model: User, as: 'sender', attributes: ['id', 'role'] }],
  });

  return { items: rows, total: count, page, limit };
}

async function sendMessage(conversationId, userId, content, attachment) {
  await _assertParticipant(conversationId, userId);

  const message = await Message.create({ conversationId, senderId: userId, content, attachment });

  // If there's no text content (attachment-only message), store a readable label
  const displayContent = content?.trim() || (attachment ? '📎 Attachment' : null);

  await Conversation.update(
    { lastMessage: displayContent, lastMessageAt: new Date(), lastMessageSenderId: userId },
    { where: { id: conversationId } }
  );

  const full = await message.reload({ include: [{ model: User, as: 'sender', attributes: ['id', 'role'] }] });
  emitToConversation(conversationId, 'receive-message', full.toJSON());
  return full;
}

async function _assertParticipant(conversationId, userId) {
  const convo = await Conversation.findByPk(conversationId, {
    include: [
      { model: CreatorProfile, as: 'creator' },
      { model: BrandProfile,   as: 'brand' },
    ],
  });
  if (!convo) throw new NotFoundError('Conversation not found');
  if (convo.creator.userId !== userId && convo.brand.userId !== userId) {
    throw new ForbiddenError('Not a participant of this conversation');
  }
  return convo;
}

async function toggleReaction(messageId, userId, emoji) {
  const message = await Message.findByPk(messageId);
  if (!message) throw new NotFoundError('Message not found');

  let reactions = {};
  try { reactions = message.reactions ? JSON.parse(message.reactions) : {}; } catch { reactions = {}; }

  if (!reactions[emoji]) reactions[emoji] = [];
  const idx = reactions[emoji].indexOf(userId);
  if (idx === -1) {
    reactions[emoji].push(userId);
  } else {
    reactions[emoji].splice(idx, 1);
    if (reactions[emoji].length === 0) delete reactions[emoji];
  }

  const reactionsStr = Object.keys(reactions).length ? JSON.stringify(reactions) : null;
  await Message.update({ reactions: reactionsStr }, { where: { id: messageId } });

  emitToConversation(message.conversationId, 'message-reaction', { messageId, reactions });
  return reactions;
}

async function markConversationRead(conversationId, userId) {
  const convo = await _assertParticipant(conversationId, userId);
  if (convo.lastMessageSenderId && convo.lastMessageSenderId !== userId) {
    await Conversation.update(
      { lastMessageSenderId: userId },   // treated as "I've read up to here"
      { where: { id: conversationId } }
    );
  }
}

async function getUnreadCount(userId) {
  const { Op } = require('sequelize');
  const where = {
    // sender is someone other than the current user (NULL != userId is falsy in PG, so NULLs are excluded)
    lastMessageSenderId: { [Op.ne]: userId },
    // exclude null AND empty string (empty string was stored for attachment-only messages before the fix)
    lastMessage: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] },
  };
  // Only count conversations the user participates in
  const conversations = await Conversation.findAll({
    where,
    include: [
      { model: CreatorProfile, as: 'creator', attributes: ['userId'] },
      { model: BrandProfile,   as: 'brand',   attributes: ['userId'] },
    ],
  });
  return conversations.filter(
    (c) => c.creator?.userId === userId || c.brand?.userId === userId
  ).length;
}

module.exports = { getConversations, createConversation, getMessages, sendMessage, markConversationRead, getUnreadCount, toggleReaction };
