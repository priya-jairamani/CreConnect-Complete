module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    message:  { type: DataTypes.TEXT, allowNull: false },
    type:     { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'SYSTEM' },
    audience: {
      type: DataTypes.ENUM('ALL','CREATORS','BRANDS','ADMINS'),
      defaultValue: 'ALL',
    },
    deliveryMode: {
      type: DataTypes.ENUM('IMMEDIATE','SCHEDULED'),
      defaultValue: 'IMMEDIATE',
    },
    scheduledAt: { type: DataTypes.DATE },
    status: {
      type: DataTypes.ENUM('PENDING','SENT','FAILED'),
      defaultValue: 'SENT',
    },
  }, { tableName: 'notifications', timestamps: true, updatedAt: false });

  Notification.associate = (models) => {
    Notification.hasMany(models.UserNotification, { foreignKey: 'notificationId', as: 'recipients', onDelete: 'CASCADE' });
  };

  return Notification;
};
