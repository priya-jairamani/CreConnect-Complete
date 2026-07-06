module.exports = (sequelize, DataTypes) => {
  const PlatformSetting = sequelize.define('PlatformSetting', {
    id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    key:       { type: DataTypes.STRING, allowNull: false, unique: true },
    value:     { type: DataTypes.JSONB, allowNull: false },
    updatedBy: { type: DataTypes.UUID },
  }, { tableName: 'platform_settings', timestamps: true });

  PlatformSetting.associate = (models) => {
    PlatformSetting.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'updatedByUser' });
  };

  return PlatformSetting;
};
