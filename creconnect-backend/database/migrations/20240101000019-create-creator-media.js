'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('creator_media', {
      id:          { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      creatorId:   { type: Sequelize.UUID, allowNull: false, references: { model: 'creator_profiles', key: 'id' }, onDelete: 'CASCADE' },
      fileUrl:     { type: Sequelize.STRING(2048), allowNull: false },
      thumbnailUrl:{ type: Sequelize.STRING(2048) },
      title:       { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      platform:    { type: Sequelize.STRING(50) },
      contentType: { type: Sequelize.STRING(50) },
      fileType:    { type: Sequelize.STRING(20) },
      mimeType:    { type: Sequelize.STRING(100) },
      size:        { type: Sequelize.INTEGER },
      tags:        { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      visibility:  { type: Sequelize.ENUM('PUBLIC','PRIVATE'), defaultValue: 'PUBLIC' },
      isFeatured:  { type: Sequelize.BOOLEAN, defaultValue: false },
      views:       { type: Sequelize.INTEGER, defaultValue: 0 },
      likes:       { type: Sequelize.INTEGER, defaultValue: 0 },
      comments:    { type: Sequelize.INTEGER, defaultValue: 0 },
      reach:       { type: Sequelize.INTEGER, defaultValue: 0 },
      order:       { type: Sequelize.INTEGER, defaultValue: 0 },
      campaignId:  { type: Sequelize.UUID },
      createdAt:   { type: Sequelize.DATE, allowNull: false },
      updatedAt:   { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('creator_media', ['creatorId']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('creator_media');
  },
};
