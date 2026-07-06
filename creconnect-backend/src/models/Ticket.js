module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    subject:         { type: DataTypes.STRING, allowNull: false },
    description:     { type: DataTypes.TEXT, allowNull: false },
    category:        { type: DataTypes.STRING, defaultValue: 'GENERAL' },
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
      defaultValue: 'MEDIUM',
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'),
      defaultValue: 'OPEN',
    },
    reporterId:      { type: DataTypes.UUID },
    assignedAdminId: { type: DataTypes.UUID },
    resolvedAt:      { type: DataTypes.DATE },
  }, { tableName: 'tickets', timestamps: true });

  Ticket.associate = (models) => {
    Ticket.belongsTo(models.User, { foreignKey: 'reporterId',      as: 'reporter' });
    Ticket.belongsTo(models.User, { foreignKey: 'assignedAdminId', as: 'assignedAdmin' });
  };

  return Ticket;
};
