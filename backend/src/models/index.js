const sequelize = require('../config/database');
const User = require('./User');
const Portfolio = require('./Portfolio');
const Trade = require('./Trade');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const Watchlist = require('./Watchlist');

// User <-> Wallet (One-to-One)
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet', onDelete: 'CASCADE' });
Wallet.belongsTo(User, { foreignKey: 'userId' });

// User <-> Portfolio (One-to-Many)
User.hasMany(Portfolio, { foreignKey: 'userId', as: 'portfolio', onDelete: 'CASCADE' });
Portfolio.belongsTo(User, { foreignKey: 'userId' });

// User <-> Trade (One-to-Many)
User.hasMany(Trade, { foreignKey: 'userId', as: 'trades', onDelete: 'CASCADE' });
Trade.belongsTo(User, { foreignKey: 'userId' });

// User <-> Transaction (One-to-Many)
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

// Wallet <-> Transaction (One-to-Many)
Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId' });

// User <-> Watchlist (One-to-Many)
User.hasMany(Watchlist, { foreignKey: 'userId', as: 'watchlist', onDelete: 'CASCADE' });
Watchlist.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Portfolio,
  Trade,
  Wallet,
  Transaction,
  Watchlist,
};