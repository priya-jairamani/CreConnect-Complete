module.exports = (sequelize, DataTypes) => {
  const CreatorMedia = sequelize.define('CreatorMedia', {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    creatorId:    { type: DataTypes.UUID, allowNull: false },
    fileUrl:      { type: DataTypes.STRING(2048), allowNull: false },
    thumbnailUrl: { type: DataTypes.STRING(2048) },
    title:        { type: DataTypes.STRING },
    description:  { type: DataTypes.TEXT },
    platform:     { type: DataTypes.STRING(50) },
    contentType:  { type: DataTypes.STRING(50) },
    fileType:     { type: DataTypes.STRING(20) },
    mimeType:     { type: DataTypes.STRING(100) },
    size:         { type: DataTypes.INTEGER },
    tags:         { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    visibility:   { type: DataTypes.ENUM('PUBLIC','PRIVATE'), defaultValue: 'PUBLIC' },
    isFeatured:   { type: DataTypes.BOOLEAN, defaultValue: false },
    views:        { type: DataTypes.INTEGER, defaultValue: 0 },
    likes:        { type: DataTypes.INTEGER, defaultValue: 0 },
    comments:     { type: DataTypes.INTEGER, defaultValue: 0 },
    reach:        { type: DataTypes.INTEGER, defaultValue: 0 },
    order:        { type: DataTypes.INTEGER, defaultValue: 0 },
    campaignId:   { type: DataTypes.UUID },
  }, { tableName: 'creator_media', timestamps: true });

  CreatorMedia.associate = (models) => {
    CreatorMedia.belongsTo(models.CreatorProfile, { foreignKey: 'creatorId', as: 'creator' });
  };

  return CreatorMedia;
};
