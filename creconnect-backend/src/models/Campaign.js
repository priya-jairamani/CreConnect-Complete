module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define('Campaign', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    brandId:    { type: DataTypes.UUID, allowNull: false },
    title:      { type: DataTypes.STRING, allowNull: false },
    description:{ type: DataTypes.TEXT, allowNull: false },
    objective: {
      type: DataTypes.ENUM('AWARENESS','ENGAGEMENT','CONVERSIONS','LAUNCH'),
      allowNull: false,
    },
    niche: {
      type: DataTypes.ENUM('FASHION','BEAUTY','GAMING','TECH','FITNESS','FOOD','LIFESTYLE','TRAVEL','EDUCATION','FINANCE'),
    },
    // Stored as text[] in PostgreSQL
    platforms:     { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    followerMin:   { type: DataTypes.INTEGER, defaultValue: 0 },
    followerMax:   { type: DataTypes.INTEGER, defaultValue: 0 },
    engagementMin: { type: DataTypes.FLOAT,   defaultValue: 0 },
    targetLocation:{ type: DataTypes.STRING },
    languages:     { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    budgetType: {
      type: DataTypes.ENUM('FIXED','MILESTONE','PERFORMANCE'),
      allowNull: false,
    },
    budgetPKR: { type: DataTypes.FLOAT },
    budgetMin: { type: DataTypes.FLOAT },
    budgetMax: { type: DataTypes.FLOAT },
    reels:      { type: DataTypes.INTEGER, defaultValue: 0 },
    posts:      { type: DataTypes.INTEGER, defaultValue: 0 },
    stories:    { type: DataTypes.INTEGER, defaultValue: 0 },
    videos:     { type: DataTypes.INTEGER, defaultValue: 0 },
    livestreams:{ type: DataTypes.INTEGER, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('DRAFT','PUBLISHED','PAUSED','COMPLETED'),
      defaultValue: 'DRAFT',
    },
    contentType:  { type: DataTypes.STRING },
    requirements: { type: DataTypes.TEXT },
    startDate:    { type: DataTypes.DATE },
    deadline:     { type: DataTypes.DATE },
  }, { tableName: 'campaigns', timestamps: true });

  Campaign.associate = (models) => {
    Campaign.belongsTo(models.BrandProfile, { foreignKey: 'brandId', as: 'brand' });
    Campaign.hasMany(models.Application,    { foreignKey: 'campaignId', as: 'applications', onDelete: 'CASCADE' });
    Campaign.hasMany(models.Collaboration,  { foreignKey: 'campaignId', as: 'collaborations' });
  };

  return Campaign;
};
