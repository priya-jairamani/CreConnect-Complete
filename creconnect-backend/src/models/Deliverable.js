module.exports = (sequelize, DataTypes) => {
  const Deliverable = sequelize.define('Deliverable', {
    id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    collaborationId: { type: DataTypes.UUID, allowNull: false },
    submittedBy:     { type: DataTypes.UUID, allowNull: false },
    type:            { type: DataTypes.ENUM('REEL', 'POST', 'STORY', 'VIDEO', 'LIVESTREAM') },
    note:            { type: DataTypes.TEXT, allowNull: false },
    link:            { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM('SUBMITTED', 'APPROVED', 'REVISION_REQUESTED'),
      defaultValue: 'SUBMITTED',
    },
    feedback: { type: DataTypes.TEXT },
  }, { tableName: 'deliverables', timestamps: true });

  Deliverable.associate = (models) => {
    Deliverable.belongsTo(models.Collaboration, { foreignKey: 'collaborationId', as: 'collaboration' });
  };

  return Deliverable;
};
