const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Portfolio = sequelize.define(
  'Portfolio',
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
    quantity: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    avgBuyPrice: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      validate: { min: 0 },
    },
    currentPrice: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    totalInvested: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
    },
    sector: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    exchange: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'symbol'] },
    ],
  }
);

module.exports = Portfolio;