module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reporterId:     { type: DataTypes.UUID, allowNull: false },
    reportedUserId: { type: DataTypes.UUID, allowNull: false },
    violationType:  { type: DataTypes.STRING, allowNull: false },
    description:    { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM('OPEN','RESOLVED','DISMISSED'),
      defaultValue: 'OPEN',
    },
    resolution: { type: DataTypes.TEXT },
    resolvedAt: { type: DataTypes.DATE },
  }, { tableName: 'reports', timestamps: true });

  Report.associate = (models) => {
    Report.belongsTo(models.User, { foreignKey: 'reporterId',     as: 'reporter' });
    Report.belongsTo(models.User, { foreignKey: 'reportedUserId', as: 'reportedUser' });
  };

  return Report;
};
