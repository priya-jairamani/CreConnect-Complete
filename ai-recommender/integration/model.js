'use strict';

/**
 * AiMatch Sequelize model.
 * Table: ai_matches
 *
 * Stores pre-computed match scores so API reads are instant (< 500ms).
 * The engine re-runs periodically to refresh scores.
 */
module.exports = (sequelize, DataTypes) => {
  const AiMatch = sequelize.define('AiMatch', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    brandId:   { type: DataTypes.UUID, allowNull: false },
    creatorId: { type: DataTypes.UUID, allowNull: false },

    // 0–100 final hybrid score
    matchScore: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

    // Breakdown of the 7 content-based factors (stored as JSONB)
    breakdown: { type: DataTypes.JSONB, defaultValue: {} },

    // Which method produced this score
    method: {
      type: DataTypes.ENUM('content-based', 'hybrid'),
      defaultValue: 'content-based',
    },

    // Weights used at generation time
    weights: { type: DataTypes.JSONB, defaultValue: {} },

    // Brand's feedback on this match (null = not acted on yet)
    feedbackAccepted: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: null },
    feedbackAt:       { type: DataTypes.DATE,    allowNull: true },

    // Engine run timestamp
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
