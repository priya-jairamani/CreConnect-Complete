'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id:              { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      collaborationId: { type: Sequelize.UUID, allowNull: false, references: { model: 'collaborations', key: 'id' }, onDelete: 'CASCADE' },
      amountPKR:       { type: Sequelize.FLOAT, allowNull: false },
      status:          { type: Sequelize.ENUM('PENDING','ESCROW','RELEASED','PAID'), defaultValue: 'PENDING' },
      stripePaymentId: { type: Sequelize.STRING },
      releasedAt:      { type: Sequelize.DATE },
      createdAt:       { type: Sequelize.DATE, allowNull: false },
      updatedAt:       { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments');
  },
};
