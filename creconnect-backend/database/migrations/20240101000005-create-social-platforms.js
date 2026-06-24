'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('social_platforms', {
      id:           { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      creatorId:    { type: Sequelize.UUID, allowNull: false, references: { model: 'creator_profiles', key: 'id' }, onDelete: 'CASCADE' },
      name:         { type: Sequelize.ENUM('INSTAGRAM','TIKTOK','YOUTUBE','TWITTER','FACEBOOK','LINKEDIN','SNAPCHAT'), allowNull: false },
      handle:       { type: Sequelize.STRING },
      url:          { type: Sequelize.STRING },
      followerCount:{ type: Sequelize.INTEGER, defaultValue: 0 },
      isConnected:  { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:    { type: Sequelize.DATE, allowNull: false },
      updatedAt:    { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('social_platforms', ['creatorId', 'name'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('social_platforms');
  },
};
