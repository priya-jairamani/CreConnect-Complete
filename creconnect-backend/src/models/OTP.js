module.exports = (sequelize, DataTypes) => {
  const OTP = sequelize.define('OTP', {
    id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email:     { type: DataTypes.STRING, allowNull: false },
    code:      { type: DataTypes.STRING(6), allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    used:      { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'otps',
    timestamps: true,
    updatedAt: false,
    indexes: [{ fields: ['email'] }],
  });

  return OTP;
};
