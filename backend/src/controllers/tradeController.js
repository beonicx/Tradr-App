const { Trade, Portfolio, Wallet, Transaction, sequelize } = require('../models');

exports.executeTrade = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      symbol,
      companyName,
      type,
      orderType = 'market',
      quantity,
      price,
      limitPrice,
      stopLossPrice,
      takeProfitPrice,
      notes,
    } = req.body;

    const userId = req.user.id;
    const qty = parseFloat(quantity);
    const unitPrice = parseFloat(price);
    const totalAmount = qty * unitPrice;
    const feeRate = 0.002; // 0.2%
    const fees = totalAmount * feeRate;
    const netAmount = type === 'buy' ? totalAmount + fees : totalAmount - fees;

    const wallet = await Wallet.findOne({ where: { userId }, transaction: t, lock: true });
    if (!wallet) {
      await t.rollback();
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const available = parseFloat(wallet.balance);

    if (type === 'buy') {
      if (available < netAmount) {
        await t.rollback();
        return res.status(400).json({
          error: 'Insufficient funds',
          required: netAmount.toFixed(4),
          available: available.toFixed(4),
        });
      }
      await wallet.update(
        { balance: available - netAmount },
        { transaction: t }
      );
    } else {
      const holding = await Portfolio.findOne({ where: { userId, symbol }, transaction: t, lock: true });
      if (!holding || parseFloat(holding.quantity) < qty) {
        await t.rollback();
        return res.status(400).json({
          error: 'Insufficient shares',
          available: holding?.quantity || 0,
          required: qty,
        });
      }
      await wallet.update(
        { balance: available + (totalAmount - fees) },
        { transaction: t }
      );
    }

    // Calculate P&L for sell orders
    let pnl = null;
    let pnlPercent = null;

    if (type === 'sell') {
      const holding = await Portfolio.findOne({ where: { userId, symbol }, transaction: t });
      if (holding) {
        const costBasis = parseFloat(holding.avgBuyPrice) * qty;
        pnl = totalAmount - fees - costBasis;
        pnlPercent = (pnl / costBasis) * 100;
      }
    }

    const trade = await Trade.create({
      userId,
      symbol,
      companyName: companyName || symbol,
      type,
      orderType,
      quantity: qty,
      price: unitPrice,
      totalAmount,
      fees,
      limitPrice: limitPrice ? parseFloat(limitPrice) : null,
      stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : null,
      takeProfitPrice: takeProfitPrice ? parseFloat(takeProfitPrice) : null,
      status: 'executed',
      executedAt: new Date(),
      notes,
      pnl,
      pnlPercent,
    }, { transaction: t });

    // Update portfolio
    const existing = await Portfolio.findOne({ where: { userId, symbol }, transaction: t, lock: true });

    if (type === 'buy') {
      if (existing) {
        const newQty = parseFloat(existing.quantity) + qty;
        const newInvested = parseFloat(existing.totalInvested) + totalAmount;
        await existing.update({
          quantity: newQty,
          avgBuyPrice: newInvested / newQty,
          totalInvested: newInvested,
          currentPrice: unitPrice,
          lastUpdated: new Date(),
        }, { transaction: t });
      } else {
        await Portfolio.create({
          userId,
          symbol,
          companyName: companyName || symbol,
          quantity: qty,
          avgBuyPrice: unitPrice,
          currentPrice: unitPrice,
          totalInvested: totalAmount,
          lastUpdated: new Date(),
        }, { transaction: t });
      }
    } else if (existing) {
      const remainingQty = parseFloat(existing.quantity) - qty;
      if (remainingQty <= 0.000001) {
        await existing.destroy({ transaction: t });
      } else {
        const remainingInvested = remainingQty * parseFloat(existing.avgBuyPrice);
        await existing.update({
          quantity: remainingQty,
          totalInvested: remainingInvested,
          lastUpdated: new Date(),
        }, { transaction: t });
      }
    }

    // Create transaction record
    const freshWallet = await Wallet.findOne({ where: { userId }, transaction: t });
    await Transaction.create({
      userId,
      walletId: wallet.id,
      type: type === 'buy' ? 'trade_buy' : 'trade_sell',
      amount: netAmount,
      balanceBefore: type === 'buy' ? available : available - (totalAmount - fees),
      balanceAfter: parseFloat(freshWallet.balance),
      status: 'completed',
      description: `${type.toUpperCase()} ${qty} shares of ${symbol} at $${unitPrice.toFixed(2)}`,
      metadata: { tradeId: trade.id, symbol, type, quantity: qty, price: unitPrice, fees },
    }, { transaction: t });

    await t.commit();

    res.json({
      message: `${type === 'buy' ? '📈 Buy' : '📉 Sell'} order executed successfully`,
      trade: {
        id: trade.id,
        symbol: trade.symbol,
        type: trade.type,
        orderType: trade.orderType,
        quantity: parseFloat(trade.quantity),
        price: parseFloat(trade.price),
        totalAmount: parseFloat(trade.totalAmount),
        fees: parseFloat(trade.fees),
        netAmount,
        status: trade.status,
        executedAt: trade.executedAt,
        pnl: trade.pnl ? parseFloat(trade.pnl) : null,
        pnlPercent: trade.pnlPercent ? parseFloat(trade.pnlPercent) : null,
      },
      newBalance: parseFloat(freshWallet.balance),
    });
  } catch (error) {
    await t.rollback();
    console.error('Trade execution error:', error);
    res.status(500).json({ error: 'Trade execution failed', message: error.message });
  }
};

exports.getTradeHistory = async (req, res) => {
  const { page = 1, limit = 20, symbol, type, status, from, to } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { Op } = require('sequelize');

  const where = { userId: req.user.id };
  if (symbol) where.symbol = symbol.toUpperCase();
  if (type) where.type = type;
  if (status) where.status = status;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt[Op.gte] = new Date(from);
    if (to) where.createdAt[Op.lte] = new Date(to);
  }

  const { count, rows } = await Trade.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({
    trades: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
};

exports.getTradeById = async (req, res) => {
  const trade = await Trade.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!trade) return res.status(404).json({ error: 'Trade not found' });
  res.json(trade);
};

exports.getTradeSummary = async (req, res) => {
  const { Op } = require('sequelize');
  const userId = req.user.id;

  const [totalTrades, buyTrades, sellTrades, recentTrades] = await Promise.all([
    Trade.count({ where: { userId, status: 'executed' } }),
    Trade.count({ where: { userId, type: 'buy', status: 'executed' } }),
    Trade.count({ where: { userId, type: 'sell', status: 'executed' } }),
    Trade.findAll({
      where: { userId, status: 'executed' },
      order: [['createdAt', 'DESC']],
      limit: 5,
    }),
  ]);

  const totalPnL = await Trade.sum('pnl', {
    where: { userId, type: 'sell', status: 'executed', pnl: { [Op.not]: null } },
  });

  res.json({
    summary: {
      totalTrades,
      buyTrades,
      sellTrades,
      totalPnL: totalPnL || 0,
    },
    recentTrades,
  });
};
