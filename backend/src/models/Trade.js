const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trade = sequelize.define(
  'Trade',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    symbol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      set(value) {
        this.setDataValue('symbol', value.toUpperCase());
      },
    },
    companyName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('buy', 'sell'),
      allowNull: false,
    },
    orderType: {
      type: DataTypes.ENUM('market', 'limit', 'stop_loss', 'stop_limit'),
      defaultValue: 'market',
    },
    quantity: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      validate: { min: 0.000001 },
    },
    price: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      validate: { min: 0 },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
    },
    fees: {
      type: DataTypes.DECIMAL(12, 4),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'executed', 'cancelled', 'failed', 'partial'),
      defaultValue: 'pending',
    },
    limitPrice: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    stopLossPrice: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    takeProfitPrice: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    executedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pnl: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    pnlPercent: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['symbol'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);

module.exports = Trade;
