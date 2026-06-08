const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Watchlist = sequelize.define(
  'Watchlist',
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
    sector: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    alertPrice: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    alertType: {
      type: DataTypes.ENUM('above', 'below'),
      allowNull: true,
    },
    alertEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId', 'symbol'] }],
  }
);

module.exports = Watchlist;