'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('collaborations', {
      id:             { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      campaignId:     { type: Sequelize.UUID, allowNull: false, references: { model: 'campaigns', key: 'id' } },
      creatorId:      { type: Sequelize.UUID, allowNull: false, references: { model: 'creator_profiles', key: 'id' } },
      brandId:        { type: Sequelize.UUID, allowNull: false, references: { model: 'brand_profiles', key: 'id' } },
      status:         { type: Sequelize.ENUM('PENDING','ACCEPTED','REJECTED','COMPLETED'), defaultValue: 'PENDING' },
      stage:          { type: Sequelize.ENUM('INQUIRY','NEGOTIATION','CONTRACTED','IN_PROGRESS','DELIVERED','COMPLETED'), defaultValue: 'INQUIRY' },
      priority:       { type: Sequelize.ENUM('LOW','MEDIUM','HIGH'), defaultValue: 'MEDIUM' },
      offerAmountPKR: { type: Sequelize.FLOAT, defaultValue: 0 },
      offerType:      { type: Sequelize.STRING },
      paymentStatus:  { type: Sequelize.ENUM('PENDING','ESCROW','RELEASED','PAID'), defaultValue: 'PENDING' },
      startDate:      { type: Sequelize.DATE },
      endDate:        { type: Sequelize.DATE },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
      updatedAt:      { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('collaborations');
  },
};
