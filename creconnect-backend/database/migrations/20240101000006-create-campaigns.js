'use strict';

const NICHES = ['FASHION','BEAUTY','GAMING','TECH','FITNESS','FOOD','LIFESTYLE','TRAVEL','EDUCATION','FINANCE'];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaigns', {
      id:             { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      brandId:        { type: Sequelize.UUID, allowNull: false, references: { model: 'brand_profiles', key: 'id' }, onDelete: 'CASCADE' },
      title:          { type: Sequelize.STRING, allowNull: false },
      description:    { type: Sequelize.TEXT, allowNull: false },
      objective:      { type: Sequelize.ENUM('AWARENESS','ENGAGEMENT','CONVERSIONS','LAUNCH'), allowNull: false },
      niche:          { type: Sequelize.ENUM(...NICHES) },
      platforms:      { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      followerMin:    { type: Sequelize.INTEGER, defaultValue: 0 },
      followerMax:    { type: Sequelize.INTEGER, defaultValue: 0 },
      engagementMin:  { type: Sequelize.FLOAT, defaultValue: 0 },
      targetLocation: { type: Sequelize.STRING },
      languages:      { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      budgetType:     { type: Sequelize.ENUM('FIXED','MILESTONE','PERFORMANCE'), allowNull: false },
      budgetPKR:      { type: Sequelize.FLOAT },
      budgetMin:      { type: Sequelize.FLOAT },
      budgetMax:      { type: Sequelize.FLOAT },
      reels:          { type: Sequelize.INTEGER, defaultValue: 0 },
      posts:          { type: Sequelize.INTEGER, defaultValue: 0 },
      stories:        { type: Sequelize.INTEGER, defaultValue: 0 },
      videos:         { type: Sequelize.INTEGER, defaultValue: 0 },
      livestreams:    { type: Sequelize.INTEGER, defaultValue: 0 },
      status:         { type: Sequelize.ENUM('DRAFT','PUBLISHED','PAUSED','COMPLETED'), defaultValue: 'DRAFT' },
      contentType:    { type: Sequelize.STRING },
      requirements:   { type: Sequelize.TEXT },
      startDate:      { type: Sequelize.DATE },
      deadline:       { type: Sequelize.DATE },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('campaigns');
  },
};
