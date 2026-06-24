module.exports = (sequelize, DataTypes) => {
  const UserNotification = sequelize.define('UserNotification', {
    id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId:         { type: DataTypes.UUID, allowNull: false },
    notificationId: { type: DataTypes.UUID, allowNull: false },
    isRead:         { type: DataTypes.BOOLEAN, defaultValue: false },
    readAt:         { type: DataTypes.DATE },
  }, {
    tableName: 'user_notifications',
    timestamps: true,
    updatedAt: false,
    indexes: [{ unique: true, fields: ['userId', 'notificationId'] }],
  });

  UserNotification.associate = (models) => {
    UserNotification.belongsTo(models.User,         { foreignKey: 'userId',         as: 'user' });
    UserNotification.belongsTo(models.Notification, { foreignKey: 'notificationId', as: 'notification' });
  };

  return UserNotification;
};
