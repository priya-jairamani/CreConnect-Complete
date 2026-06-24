module.exports = (sequelize, DataTypes) => {
  const BrandProfile = sequelize.define('BrandProfile', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId:      { type: DataTypes.UUID, allowNull: false, unique: true },
    companyName: { type: DataTypes.STRING, allowNull: false },
    contactName: { type: DataTypes.STRING, allowNull: false },
    industry:    { type: DataTypes.STRING, allowNull: false },
    website:     { type: DataTypes.STRING },
    logoUrl:     { type: DataTypes.STRING },
    bannerUrl:   { type: DataTypes.STRING },
    location:    { type: DataTypes.STRING },
    brandSize:   { type: DataTypes.ENUM('STARTUP', 'GROWING', 'ENTERPRISE') },
    isVerified:  { type: DataTypes.BOOLEAN, defaultValue: false },

    // Extended company profile
    tagline:            { type: DataTypes.STRING },
    description:        { type: DataTypes.TEXT },
    foundedYear:        { type: DataTypes.INTEGER },
    brandColor:         { type: DataTypes.STRING },
    legalName:          { type: DataTypes.STRING },
    registrationNumber: { type: DataTypes.STRING },
    taxId:              { type: DataTypes.STRING },
    vatNumber:          { type: DataTypes.STRING },
    businessAddress:    { type: DataTypes.TEXT },

    // Public profile visibility
    publicProfileVisible:     { type: DataTypes.BOOLEAN, defaultValue: true },
    displayTeamMembers:       { type: DataTypes.BOOLEAN, defaultValue: true },
    displayCampaignResults:   { type: DataTypes.BOOLEAN, defaultValue: true },
    displayReviews:           { type: DataTypes.BOOLEAN, defaultValue: true },
    displayBudgetRanges:      { type: DataTypes.BOOLEAN, defaultValue: false },
    displayContactInfo:       { type: DataTypes.BOOLEAN, defaultValue: false },

    // Creator targeting preferences
    preferredCategories:  { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    preferredPlatforms:   { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    audienceAgeMin:       { type: DataTypes.INTEGER, defaultValue: 18 },
    audienceAgeMax:       { type: DataTypes.INTEGER, defaultValue: 34 },
    audienceGenders:      { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    audienceCountries:    { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },

    // Campaign defaults
    defaultBudgetMin: { type: DataTypes.FLOAT, defaultValue: 0 },
    defaultBudgetMax: { type: DataTypes.FLOAT, defaultValue: 0 },

    // Brand safety
    blockedCategories:  { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    contentGuidelines:  { type: DataTypes.TEXT },
    fraudDetection:     { type: DataTypes.BOOLEAN, defaultValue: true },

    // Notification preferences stored as JSON
    notificationCategories: { type: DataTypes.JSONB, defaultValue: {} },
    notificationChannels:   { type: DataTypes.JSONB, defaultValue: {} },

    // Automation
    autoApproveCreators: { type: DataTypes.BOOLEAN, defaultValue: false },
    autoSendInvites:     { type: DataTypes.BOOLEAN, defaultValue: false },

    // Social links
    instagram: { type: DataTypes.STRING },
    tiktok:    { type: DataTypes.STRING },
    youtube:   { type: DataTypes.STRING },
    linkedin:  { type: DataTypes.STRING },
    facebook:  { type: DataTypes.STRING },
    twitter:   { type: DataTypes.STRING },
  }, { tableName: 'brand_profiles', timestamps: true });

  BrandProfile.associate = (models) => {
    BrandProfile.belongsTo(models.User,        { foreignKey: 'userId',  as: 'user' });
    BrandProfile.hasMany(models.Campaign,      { foreignKey: 'brandId', as: 'campaigns',      onDelete: 'CASCADE' });
    BrandProfile.hasMany(models.Collaboration, { foreignKey: 'brandId', as: 'collaborations' });
    BrandProfile.hasMany(models.Conversation,  { foreignKey: 'brandId', as: 'conversations' });
  };

  return BrandProfile;
};
