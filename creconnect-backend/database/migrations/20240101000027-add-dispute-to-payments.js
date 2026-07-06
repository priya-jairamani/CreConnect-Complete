'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_payments_status" ADD VALUE IF NOT EXISTS 'DISPUTED';`
    );
    await queryInterface.addColumn('payments', 'disputeReason', { type: Sequelize.TEXT });
    await queryInterface.addColumn('payments', 'disputedAt',    { type: Sequelize.DATE });
  },
  async down(queryInterface) {
    // PostgreSQL does not support removing enum values
    await queryInterface.removeColumn('payments', 'disputeReason');
    await queryInterface.removeColumn('payments', 'disputedAt');
  },
};
