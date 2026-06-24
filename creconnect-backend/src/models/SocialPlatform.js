module.exports = (sequelize, DataTypes) => {
  const SocialPlatform = sequelize.define('SocialPlatform', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    creatorId: { type: DataTypes.UUID, allowNull: false },
    name: {
      type: DataTypes.ENUM('INSTAGRAM','TIKTOK','YOUTUBE','TWITTER','FACEBOOK','LINKEDIN','SNAPCHAT'),
      allowNull: false,
    },
    handle:            { type: DataTypes.STRING },
    url:               { type: DataTypes.STRING },
    followerCount:     { type: DataTypes.INTEGER, defaultValue: 0 },
    isConnected:       { type: DataTypes.BOOLEAN, defaultValue: true },
    accessToken:       { type: DataTypes.TEXT },
    refreshToken:      { type: DataTypes.TEXT },
    tokenExpiresAt:    { type: DataTypes.DATE },
    platformUserId:    { type: DataTypes.STRING },
    profilePictureUrl: { type: DataTypes.STRING },
    engagementRate:    { type: DataTypes.FLOAT, defaultValue: 0 },
    mediaCount:        { type: DataTypes.INTEGER, defaultValue: 0 },
    lastSyncedAt:      { type: DataTypes.DATE },
  }, { tableName: 'social_platforms', timestamps: true });

  SocialPlatform.associate = (models) => {
    SocialPlatform.belongsTo(models.CreatorProfile, { foreignKey: 'creatorId', as: 'creator' });
    SocialPlatform.hasMany(models.SocialPost, { foreignKey: 'platformId', as: 'posts', onDelete: 'CASCADE' });
  };

  return SocialPlatform;
};
