'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id:           { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      message:      { type: Sequelize.TEXT, allowNull: false },
      audience:     { type: Sequelize.ENUM('ALL','CREATORS','BRANDS'), defaultValue: 'ALL' },
      deliveryMode: { type: Sequelize.ENUM('IMMEDIATE','SCHEDULED'), defaultValue: 'IMMEDIATE' },
      scheduledAt:  { type: Sequelize.DATE },
      status:       { type: Sequelize.ENUM('PENDING','SENT','FAILED'), defaultValue: 'SENT' },
      createdAt:    { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('user_notifications', {
      id:             { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      userId:         { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      notificationId: { type: Sequelize.UUID, allowNull: false, references: { model: 'notifications', key: 'id' }, onDelete: 'CASCADE' },
      isRead:         { type: Sequelize.BOOLEAN, defaultValue: false },
      readAt:         { type: Sequelize.DATE },
      createdAt:      { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('user_notifications', ['userId', 'notificationId'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_notifications');
    await queryInterface.dropTable('notifications');
  },
};
