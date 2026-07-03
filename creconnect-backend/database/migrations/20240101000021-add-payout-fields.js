'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('creator_profiles', 'stripeConnectAccountId', { type: Sequelize.STRING });
    await queryInterface.addColumn('creator_profiles', 'payoutsEnabled', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addColumn('payments', 'stripeTransferId', { type: Sequelize.STRING });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('creator_profiles', 'stripeConnectAccountId');
    await queryInterface.removeColumn('creator_profiles', 'payoutsEnabled');
    await queryInterface.removeColumn('payments', 'stripeTransferId');
  },
};
