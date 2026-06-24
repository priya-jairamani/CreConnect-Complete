const { Conversation, Message, CreatorProfile, BrandProfile, User } = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const { emitToConversation } = require('../config/socket');

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
    const brand = await BrandProfile.findOne({ where: { userId: otherUserId } });
    if (!brand)   throw new NotFoundError('Brand not found');
    creatorId = creator.id;
    brandId   = brand.id;
  } else {
    const brand   = await BrandProfile.findOne({ where: { userId } });
    if (!brand)   throw new ForbiddenError();
    const creator = await CreatorProfile.findOne({ where: { userId: otherUserId } });
    if (!creator) throw new NotFoundError('Creator not found');
    creatorId = creator.id;
    brandId   = brand.id;
  }

  const [convo] = await Conversation.findOrCreate({
    where: { creatorId, brandId },
    defaults: { creatorId, brandId },
  });

  return convo.reload({
    include: [
      { model: CreatorProfile, as: 'creator', attributes: ['userId', 'displayName', 'avatarUrl', 'username'] },
      { model: BrandProfile,   as: 'brand',   attributes: ['userId', 'companyName', 'logoUrl'] },
    ],
  });
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

  await Conversation.update(
    { lastMessage: content, lastMessageAt: new Date(), lastMessageSenderId: userId },
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
  const where = {
    lastMessageSenderId: { [require('sequelize').Op.ne]: userId },
    lastMessage:         { [require('sequelize').Op.ne]: null },
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

module.exports = { getConversations, createConversation, getMessages, sendMessage, markConversationRead, getUnreadCount };
