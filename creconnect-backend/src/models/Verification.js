module.exports = (sequelize, DataTypes) => {
  const Verification = sequelize.define('Verification', {
    id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId:          { type: DataTypes.UUID, allowNull: false },
    type:            { type: DataTypes.STRING(50), allowNull: false },
    status:          { type: DataTypes.ENUM('PENDING','UNDER_REVIEW','VERIFIED','REJECTED','EXPIRED'), defaultValue: 'PENDING' },
    submittedAt:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    reviewedAt:      { type: DataTypes.DATE },
    reviewedBy:      { type: DataTypes.UUID },
    expiresAt:       { type: DataTypes.DATE },
    rejectionReason: { type: DataTypes.TEXT },
    data:            { type: DataTypes.JSONB, defaultValue: {} },
  }, { tableName: 'verifications', timestamps: true });

  Verification.associate = (models) => {
    Verification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Verification;
};
