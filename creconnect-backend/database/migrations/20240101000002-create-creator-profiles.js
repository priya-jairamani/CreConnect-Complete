'use strict';

const NICHES = ['FASHION','BEAUTY','GAMING','TECH','FITNESS','FOOD','LIFESTYLE','TRAVEL','EDUCATION','FINANCE'];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('creator_profiles', {
      id:             { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      userId:         { type: Sequelize.UUID, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      username:       { type: Sequelize.STRING, allowNull: false, unique: true },
      displayName:    { type: Sequelize.STRING, allowNull: false },
      bio:            { type: Sequelize.TEXT },
      niche:          { type: Sequelize.ENUM(...NICHES) },
      avatarUrl:      { type: Sequelize.STRING },
      followerCount:  { type: Sequelize.INTEGER, defaultValue: 0 },
      engagementRate: { type: Sequelize.FLOAT, defaultValue: 0 },
      rating:         { type: Sequelize.FLOAT, defaultValue: 0 },
      isVerified:     { type: Sequelize.BOOLEAN, defaultValue: false },
      totalViews:     { type: Sequelize.INTEGER, defaultValue: 0 },
      totalReach:     { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('creator_profiles');
  },
};
