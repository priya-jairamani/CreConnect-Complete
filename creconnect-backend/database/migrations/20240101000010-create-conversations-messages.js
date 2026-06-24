'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversations', {
      id:            { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      creatorId:     { type: Sequelize.UUID, allowNull: false, references: { model: 'creator_profiles', key: 'id' } },
      brandId:       { type: Sequelize.UUID, allowNull: false, references: { model: 'brand_profiles', key: 'id' } },
      lastMessage:   { type: Sequelize.TEXT },
      lastMessageAt: { type: Sequelize.DATE },
      createdAt:     { type: Sequelize.DATE, allowNull: false },
      updatedAt:     { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('conversations', ['creatorId', 'brandId'], { unique: true });

    await queryInterface.createTable('messages', {
      id:             { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      conversationId: { type: Sequelize.UUID, allowNull: false, references: { model: 'conversations', key: 'id' }, onDelete: 'CASCADE' },
      senderId:       { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      content:        { type: Sequelize.TEXT, allowNull: false },
      attachment:     { type: Sequelize.STRING },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversations');
  },
};
