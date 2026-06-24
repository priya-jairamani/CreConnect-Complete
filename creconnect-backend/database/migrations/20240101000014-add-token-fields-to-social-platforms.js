'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('social_platforms', 'accessToken',       { type: Sequelize.TEXT });
    await queryInterface.addColumn('social_platforms', 'refreshToken',      { type: Sequelize.TEXT });
    await queryInterface.addColumn('social_platforms', 'tokenExpiresAt',    { type: Sequelize.DATE });
    await queryInterface.addColumn('social_platforms', 'platformUserId',    { type: Sequelize.STRING });
    await queryInterface.addColumn('social_platforms', 'profilePictureUrl', { type: Sequelize.STRING });
    await queryInterface.addColumn('social_platforms', 'engagementRate',    { type: Sequelize.FLOAT, defaultValue: 0 });
    await queryInterface.addColumn('social_platforms', 'mediaCount',        { type: Sequelize.INTEGER, defaultValue: 0 });
    await queryInterface.addColumn('social_platforms', 'lastSyncedAt',      { type: Sequelize.DATE });
  },

  async down(queryInterface) {
    for (const col of ['accessToken','refreshToken','tokenExpiresAt','platformUserId','profilePictureUrl','engagementRate','mediaCount','lastSyncedAt']) {
      await queryInterface.removeColumn('social_platforms', col);
    }
  },
};
