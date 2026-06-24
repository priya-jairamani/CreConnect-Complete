module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    campaignId: { type: DataTypes.UUID, allowNull: false },
    creatorId:  { type: DataTypes.UUID, allowNull: false },
    note:       { type: DataTypes.TEXT },
    status: {
      type: DataTypes.ENUM('PENDING','INVITED','ACCEPTED','REJECTED','COMPLETED'),
      defaultValue: 'PENDING',
    },
  }, {
    tableName: 'applications',
    timestamps: true,
    indexes: [{ unique: true, fields: ['campaignId', 'creatorId'] }],
  });

  Application.associate = (models) => {
    Application.belongsTo(models.Campaign,       { foreignKey: 'campaignId', as: 'campaign' });
    Application.belongsTo(models.CreatorProfile, { foreignKey: 'creatorId',  as: 'creator' });
  };

  return Application;
};
