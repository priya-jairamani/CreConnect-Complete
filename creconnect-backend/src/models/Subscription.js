module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    id:                   { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId:               { type: DataTypes.UUID, allowNull: false, unique: true },
    role:                 { type: DataTypes.ENUM('BRAND', 'CREATOR'), allowNull: false },
    planTier:             { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'PAST_DUE', 'CANCELED'),
      defaultValue: 'ACTIVE',
    },
    stripeCustomerId:     { type: DataTypes.STRING },
    stripeSubscriptionId: { type: DataTypes.STRING },
    stripePriceId:        { type: DataTypes.STRING },
    currentPeriodStart:   { type: DataTypes.DATE },
    currentPeriodEnd:     { type: DataTypes.DATE },
    cancelAtPeriodEnd:    { type: DataTypes.BOOLEAN, defaultValue: false },
    campaignLimit:        { type: DataTypes.INTEGER }, // null = unlimited
    collabLimit:          { type: DataTypes.INTEGER }, // null = unlimited
    aiEnabled:            { type: DataTypes.BOOLEAN, defaultValue: true },
    grantedByAdminId:     { type: DataTypes.UUID },
  }, { tableName: 'subscriptions', timestamps: true });

  Subscription.associate = (models) => {
    Subscription.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Subscription;
};
