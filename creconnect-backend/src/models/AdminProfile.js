module.exports = (sequelize, DataTypes) => {
  const AdminProfile = sequelize.define('AdminProfile', {
    id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    name:   { type: DataTypes.STRING, allowNull: false },
  }, { tableName: 'admin_profiles', timestamps: true });

  AdminProfile.associate = (models) => {
    AdminProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return AdminProfile;
};
