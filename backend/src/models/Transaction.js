const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define(
  'Transaction',
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
    walletId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Wallets', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM(
        'deposit',
        'withdrawal',
        'trade_buy',
        'trade_sell',
        'fee',
        'refund',
        'bonus'
      ),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
    },
    balanceBefore: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
    },
    razorpayOrderId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    razorpayPaymentId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    razorpaySignature: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'processing'),
      defaultValue: 'pending',
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['razorpayOrderId'] },
      { fields: ['createdAt'] },
    ],
  }
);

module.exports = Transaction;