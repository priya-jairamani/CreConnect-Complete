'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('verifications', {
      id:               { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      userId:           { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      type:             { type: Sequelize.STRING(50), allowNull: false },  // nic | business | domain | social | email | phone
      status:           { type: Sequelize.ENUM('PENDING','UNDER_REVIEW','VERIFIED','REJECTED','EXPIRED'), defaultValue: 'PENDING' },
      submittedAt:      { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      reviewedAt:       { type: Sequelize.DATE },
      reviewedBy:       { type: Sequelize.UUID },
      expiresAt:        { type: Sequelize.DATE },
      rejectionReason:  { type: Sequelize.TEXT },
      data:             { type: Sequelize.JSONB, defaultValue: {} },
      createdAt:        { type: Sequelize.DATE, allowNull: false },
      updatedAt:        { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('verifications', ['userId', 'type']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('verifications');
  },
};
