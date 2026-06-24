module.exports = (sequelize, DataTypes) => {
  const CreatorProfile = sequelize.define('CreatorProfile', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId:        { type: DataTypes.UUID, allowNull: false, unique: true },
    username:      { type: DataTypes.STRING, allowNull: false, unique: true },
    displayName:   { type: DataTypes.STRING, allowNull: false },
    bio:           { type: DataTypes.TEXT },
    niche: {
      type: DataTypes.ENUM('FASHION','BEAUTY','GAMING','TECH','FITNESS','FOOD','LIFESTYLE','TRAVEL','EDUCATION','FINANCE'),
    },
    location:       { type: DataTypes.STRING },
    websiteUrl:     { type: DataTypes.STRING },
    avatarUrl:      { type: DataTypes.STRING },
    bannerUrl:      { type: DataTypes.STRING },
    followerCount:  { type: DataTypes.INTEGER, defaultValue: 0 },
    engagementRate: { type: DataTypes.FLOAT,   defaultValue: 0 },
    rating:         { type: DataTypes.FLOAT,   defaultValue: 0 },
    isVerified:     { type: DataTypes.BOOLEAN, defaultValue: false },
    totalViews:     { type: DataTypes.INTEGER, defaultValue: 0 },
    totalReach:     { type: DataTypes.INTEGER, defaultValue: 0 },

    // Extended identity / contact
    fullName:      { type: DataTypes.STRING },
    headline:      { type: DataTypes.STRING },
    timezone:      { type: DataTypes.STRING },
    nationality:   { type: DataTypes.STRING },
    gender:        { type: DataTypes.STRING },
    phone:         { type: DataTypes.STRING },
    portfolioLink: { type: DataTypes.STRING },
    mediaKitLink:  { type: DataTypes.STRING },
    availabilityStatus: {
      type: DataTypes.ENUM('AVAILABLE','BUSY','ON_BREAK','NOT_ACCEPTING'),
      defaultValue: 'AVAILABLE',
    },

    // Social handles (quick links, separate from SocialPlatform records)
    linkedin:  { type: DataTypes.STRING },
    instagram: { type: DataTypes.STRING },
    tiktok:    { type: DataTypes.STRING },
    youtube:   { type: DataTypes.STRING },
    facebook:  { type: DataTypes.STRING },
    x:         { type: DataTypes.STRING },

    // Specialization / content preferences
    niches:                 { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    contentFormats:         { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    contentStyles:          { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    preferredIndustries:    { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    preferredCampaignTypes: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },

    // Rate / availability
    budgetMin:          { type: DataTypes.FLOAT, defaultValue: 0 },
    budgetMax:          { type: DataTypes.FLOAT, defaultValue: 0 },
    collaborationStyle: { type: DataTypes.STRING },
    remoteOnsite:       { type: DataTypes.STRING },
    travelAvailability: { type: DataTypes.STRING },
  }, { tableName: 'creator_profiles', timestamps: true });

  CreatorProfile.associate = (models) => {
    CreatorProfile.belongsTo(models.User,           { foreignKey: 'userId',    as: 'user' });
    CreatorProfile.hasMany(models.SocialPlatform,   { foreignKey: 'creatorId', as: 'platforms',      onDelete: 'CASCADE' });
    CreatorProfile.hasMany(models.Collaboration,    { foreignKey: 'creatorId', as: 'collaborations' });
    CreatorProfile.hasMany(models.Application,      { foreignKey: 'creatorId', as: 'applications' });
    CreatorProfile.hasMany(models.Conversation,     { foreignKey: 'creatorId', as: 'conversations' });
  };

  return CreatorProfile;
};
