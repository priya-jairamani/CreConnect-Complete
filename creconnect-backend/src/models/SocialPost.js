module.exports = (sequelize, DataTypes) => {
  const SocialPost = sequelize.define('SocialPost', {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    platformId:   { type: DataTypes.UUID, allowNull: false },
    externalId:   { type: DataTypes.STRING, allowNull: false },
    mediaType:    { type: DataTypes.ENUM('IMAGE','VIDEO','REEL','CAROUSEL_ALBUM','SHORT'), defaultValue: 'IMAGE' },
    caption:      { type: DataTypes.TEXT },
    mediaUrl:     { type: DataTypes.STRING(2048) },
    thumbnailUrl: { type: DataTypes.STRING(2048) },
    permalink:    { type: DataTypes.STRING(2048) },
    likeCount:    { type: DataTypes.INTEGER, defaultValue: 0 },
    commentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    viewCount:    { type: DataTypes.INTEGER, defaultValue: 0 },
    shareCount:   { type: DataTypes.INTEGER, defaultValue: 0 },
    postedAt:     { type: DataTypes.DATE },
  }, { tableName: 'social_posts', timestamps: true });

  SocialPost.associate = (models) => {
    SocialPost.belongsTo(models.SocialPlatform, { foreignKey: 'platformId', as: 'platform' });
  };

  return SocialPost;
};
