module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    conversationId: { type: DataTypes.UUID, allowNull: false },
    senderId:       { type: DataTypes.UUID, allowNull: false },
    content:        { type: DataTypes.TEXT, allowNull: false },
    attachment:     { type: DataTypes.STRING },
    reactions:      { type: DataTypes.TEXT, defaultValue: null },
  }, { tableName: 'messages', timestamps: true, updatedAt: false });

  // Use sentAt as the creation timestamp alias
  Message.addHook('beforeCreate', (msg) => { msg.createdAt = msg.createdAt || new Date(); });

  Message.associate = (models) => {
    Message.belongsTo(models.Conversation, { foreignKey: 'conversationId', as: 'conversation' });
    Message.belongsTo(models.User,         { foreignKey: 'senderId',       as: 'sender' });
  };

  return Message;
};
