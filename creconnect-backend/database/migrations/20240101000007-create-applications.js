'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('applications', {
      id:         { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      campaignId: { type: Sequelize.UUID, allowNull: false, references: { model: 'campaigns', key: 'id' }, onDelete: 'CASCADE' },
      creatorId:  { type: Sequelize.UUID, allowNull: false, references: { model: 'creator_profiles', key: 'id' }, onDelete: 'CASCADE' },
      note:       { type: Sequelize.TEXT },
      status:     { type: Sequelize.ENUM('PENDING','ACCEPTED','REJECTED','COMPLETED'), defaultValue: 'PENDING' },
      createdAt:  { type: Sequelize.DATE, allowNull: false },
      updatedAt:  { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('applications', ['campaignId', 'creatorId'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('applications');
  },
};
