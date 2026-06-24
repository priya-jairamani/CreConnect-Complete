'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('conversations', 'lastMessageSenderId', {
      type:      Sequelize.UUID,
      allowNull: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('conversations', 'lastMessageSenderId');
  },
};
