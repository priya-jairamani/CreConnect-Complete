module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId:   { type: DataTypes.UUID },
    action:   { type: DataTypes.STRING, allowNull: false },
    entity:   { type: DataTypes.STRING },
    entityId: { type: DataTypes.STRING },
    meta:     { type: DataTypes.JSONB },
    ip:       { type: DataTypes.STRING },
  }, { tableName: 'audit_logs', timestamps: true, updatedAt: false });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'SET NULL' });
  };

  return AuditLog;
};
