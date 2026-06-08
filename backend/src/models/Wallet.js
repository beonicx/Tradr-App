const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wallet = sequelize.define(
  'Wallet',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    balance: {
      type: DataTypes.DECIMAL(18, 4),
      defaultValue: 0,
      validate: { min: 0 },
    },
    blockedAmount: {
      type: DataTypes.DECIMAL(18, 4),
      defaultValue: 0,
      validate: { min: 0 },
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'INR',
    },
    totalDeposited: {
      type: DataTypes.DECIMAL(18, 4),
      defaultValue: 0,
    },
    totalWithdrawn: {
      type: DataTypes.DECIMAL(18, 4),
      defaultValue: 0,
    },
    totalFeesPaid: {
      type: DataTypes.DECIMAL(18, 4),
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
  }
);

Wallet.prototype.getAvailableBalance = function () {
  return parseFloat(this.balance) - parseFloat(this.blockedAmount);
};

module.exports = Wallet;