module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('CREATOR', 'BRAND', 'ADMIN'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'),
      defaultValue: 'PENDING',
    },
    emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    emailToken:    { type: DataTypes.STRING },
    resetToken:    { type: DataTypes.STRING },
    resetTokenExp: { type: DataTypes.DATE },
  }, {
    tableName: 'users',
    timestamps: true,
  });

  User.associate = (models) => {
    User.hasOne(models.CreatorProfile, { foreignKey: 'userId', as: 'creatorProfile', onDelete: 'CASCADE' });
    User.hasOne(models.BrandProfile,   { foreignKey: 'userId', as: 'brandProfile',   onDelete: 'CASCADE' });
    User.hasOne(models.AdminProfile,   { foreignKey: 'userId', as: 'adminProfile',   onDelete: 'CASCADE' });
    User.hasMany(models.Message,          { foreignKey: 'senderId',      as: 'sentMessages' });
    User.hasMany(models.UserNotification, { foreignKey: 'userId',        as: 'userNotifications', onDelete: 'CASCADE' });
    User.hasMany(models.Report,           { foreignKey: 'reporterId',    as: 'reportsFiled' });
    User.hasMany(models.Report,           { foreignKey: 'reportedUserId',as: 'reportsReceived' });
    User.hasMany(models.AuditLog,         { foreignKey: 'userId',        as: 'auditLogs' });
  };

  return User;
};
