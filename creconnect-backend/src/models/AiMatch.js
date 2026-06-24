'use strict';

module.exports = (sequelize, DataTypes) => {
  const AiMatch = sequelize.define('AiMatch', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    brandId:   { type: DataTypes.UUID, allowNull: false },
    creatorId: { type: DataTypes.UUID, allowNull: false },

    matchScore: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

    breakdown: { type: DataTypes.JSONB, defaultValue: {} },

    method: {
      type: DataTypes.ENUM('content-based', 'hybrid'),
      defaultValue: 'content-based',
    },

    weights: { type: DataTypes.JSONB, defaultValue: {} },

    feedbackAccepted: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: null },
    feedbackAt:       { type: DataTypes.DATE,    allowNull: true },

    generatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'ai_matches',
    timestamps: true,
    indexes: [
      { fields: ['brandId', 'matchScore'] },
      { fields: ['creatorId'] },
      { unique: true, fields: ['brandId', 'creatorId'] },
    ],
  });

  AiMatch.associate = (models) => {
    AiMatch.belongsTo(models.BrandProfile,   { foreignKey: 'brandId',   as: 'brand' });
    AiMatch.belongsTo(models.CreatorProfile, { foreignKey: 'creatorId', as: 'creator' });
  };

  return AiMatch;
};
