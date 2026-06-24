module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    creatorId:     { type: DataTypes.UUID, allowNull: false },
    brandId:       { type: DataTypes.UUID, allowNull: false },
    lastMessage:         { type: DataTypes.TEXT },
    lastMessageAt:       { type: DataTypes.DATE },
    lastMessageSenderId: { type: DataTypes.UUID },
  }, {
    tableName: 'conversations',
    timestamps: true,
    indexes: [{ unique: true, fields: ['creatorId', 'brandId'] }],
  });

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.CreatorProfile, { foreignKey: 'creatorId', as: 'creator' });
    Conversation.belongsTo(models.BrandProfile,   { foreignKey: 'brandId',   as: 'brand' });
    Conversation.hasMany(models.Message,          { foreignKey: 'conversationId', as: 'messages', onDelete: 'CASCADE' });
  };

  return Conversation;
};
