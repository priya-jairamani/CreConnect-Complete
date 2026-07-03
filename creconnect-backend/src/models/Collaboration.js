module.exports = (sequelize, DataTypes) => {
  const Collaboration = sequelize.define('Collaboration', {
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    campaignId: { type: DataTypes.UUID, allowNull: false },
    creatorId:  { type: DataTypes.UUID, allowNull: false },
    brandId:    { type: DataTypes.UUID, allowNull: false },
    status: {
      type: DataTypes.ENUM('PENDING','ACCEPTED','REJECTED','COMPLETED'),
      defaultValue: 'PENDING',
    },
    stage: {
      type: DataTypes.ENUM('INQUIRY','NEGOTIATION','CONTRACTED','IN_PROGRESS','DELIVERED','COMPLETED'),
      defaultValue: 'INQUIRY',
    },
    priority: {
      type: DataTypes.ENUM('LOW','MEDIUM','HIGH'),
      defaultValue: 'MEDIUM',
    },
    offerAmountPKR: { type: DataTypes.FLOAT, defaultValue: 0 },
    offerType:      { type: DataTypes.STRING },
    paymentStatus: {
      type: DataTypes.ENUM('PENDING','ESCROW','RELEASED','PAID'),
      defaultValue: 'PENDING',
    },
    startDate: { type: DataTypes.DATE },
    endDate:   { type: DataTypes.DATE },
  }, { tableName: 'collaborations', timestamps: true });

  Collaboration.associate = (models) => {
    Collaboration.belongsTo(models.Campaign,       { foreignKey: 'campaignId', as: 'campaign' });
    Collaboration.belongsTo(models.CreatorProfile, { foreignKey: 'creatorId',  as: 'creator' });
    Collaboration.belongsTo(models.BrandProfile,   { foreignKey: 'brandId',    as: 'brand' });
    Collaboration.hasMany(models.Payment,          { foreignKey: 'collaborationId', as: 'payments', onDelete: 'CASCADE' });
    Collaboration.hasMany(models.Deliverable,      { foreignKey: 'collaborationId', as: 'deliverables', onDelete: 'CASCADE' });
  };

  return Collaboration;
};
