'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('social_posts', {
      id:           { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      platformId:   { type: Sequelize.UUID, allowNull: false, references: { model: 'social_platforms', key: 'id' }, onDelete: 'CASCADE' },
      externalId:   { type: Sequelize.STRING, allowNull: false },
      mediaType:    { type: Sequelize.ENUM('IMAGE','VIDEO','REEL','CAROUSEL_ALBUM','SHORT'), defaultValue: 'IMAGE' },
      caption:      { type: Sequelize.TEXT },
      mediaUrl:     { type: Sequelize.STRING(2048) },
      thumbnailUrl: { type: Sequelize.STRING(2048) },
      permalink:    { type: Sequelize.STRING(2048) },
      likeCount:    { type: Sequelize.INTEGER, defaultValue: 0 },
      commentCount: { type: Sequelize.INTEGER, defaultValue: 0 },
      viewCount:    { type: Sequelize.INTEGER, defaultValue: 0 },
      shareCount:   { type: Sequelize.INTEGER, defaultValue: 0 },
      postedAt:     { type: Sequelize.DATE },
      createdAt:    { type: Sequelize.DATE, allowNull: false },
      updatedAt:    { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('social_posts', ['platformId', 'externalId'], { unique: true, name: 'social_posts_platform_external_unique' });
    await queryInterface.addIndex('social_posts', ['platformId', 'postedAt'],   { name: 'social_posts_platform_date' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('social_posts');
  },
};
