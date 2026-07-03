'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions', {
      id:                   { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      userId:               { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      role:                 { type: Sequelize.ENUM('BRAND', 'CREATOR'), allowNull: false },
      planTier:             { type: Sequelize.STRING, allowNull: false },
      status:               { type: Sequelize.ENUM('ACTIVE', 'PAST_DUE', 'CANCELED'), defaultValue: 'ACTIVE' },
      stripeCustomerId:     { type: Sequelize.STRING },
      stripeSubscriptionId: { type: Sequelize.STRING },
      stripePriceId:        { type: Sequelize.STRING },
      currentPeriodStart:   { type: Sequelize.DATE },
      currentPeriodEnd:     { type: Sequelize.DATE },
      cancelAtPeriodEnd:    { type: Sequelize.BOOLEAN, defaultValue: false },
      campaignLimit:        { type: Sequelize.INTEGER }, // null = unlimited
      collabLimit:          { type: Sequelize.INTEGER }, // null = unlimited
      aiEnabled:            { type: Sequelize.BOOLEAN, defaultValue: true },
      grantedByAdminId:     { type: Sequelize.UUID }, // set for manually-provisioned Enterprise plans
      createdAt:            { type: Sequelize.DATE, allowNull: false },
      updatedAt:            { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('subscriptions', ['userId'], { unique: true });
    await queryInterface.addIndex('subscriptions', ['stripeSubscriptionId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('subscriptions');
  },
};
