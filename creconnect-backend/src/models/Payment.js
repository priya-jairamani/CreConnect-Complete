module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    collaborationId: { type: DataTypes.UUID, allowNull: false },
    amountPKR:       { type: DataTypes.FLOAT, allowNull: false },
    status: {
      type: DataTypes.ENUM('PENDING','ESCROW','RELEASED','PAID','DISPUTED'),
      defaultValue: 'PENDING',
    },
    stripePaymentId:  { type: DataTypes.STRING },
    stripeTransferId: { type: DataTypes.STRING },
    releasedAt:       { type: DataTypes.DATE },
    disputeReason:    { type: DataTypes.TEXT },
    disputedAt:       { type: DataTypes.DATE },
  }, { tableName: 'payments', timestamps: true });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Collaboration, { foreignKey: 'collaborationId', as: 'collaboration' });
  };

  return Payment;
};
