const { Portfolio, Trade } = require('../models');

exports.getPortfolio = async (req, res) => {
  const holdings = await Portfolio.findAll({
    where: { userId: req.user.id },
    order: [['totalInvested', 'DESC']],
  });

  const portfolioData = holdings.map((h) => {
    const qty = parseFloat(h.quantity);
    const avgBuy = parseFloat(h.avgBuyPrice);
    const current = parseFloat(h.currentPrice) || avgBuy;
    const currentValue = qty * current;
    const invested = parseFloat(h.totalInvested);
    const pnl = currentValue - invested;
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

    return {
      id: h.id,
      symbol: h.symbol,
      companyName: h.companyName,
      quantity: qty,
      avgBuyPrice: avgBuy,
      currentPrice: current,
      currentValue,
      totalInvested: invested,
      pnl,
      pnlPercent,
      sector: h.sector,
      lastUpdated: h.lastUpdated,
    };
  });

  const totals = portfolioData.reduce(
    (acc, h) => ({
      totalValue: acc.totalValue + h.currentValue,
      totalInvested: acc.totalInvested + h.totalInvested,
      totalPnL: acc.totalPnL + h.pnl,
    }),
    { totalValue: 0, totalInvested: 0, totalPnL: 0 }
  );

  const totalPnLPercent =
    totals.totalInvested > 0 ? (totals.totalPnL / totals.totalInvested) * 100 : 0;

  res.json({
    holdings: portfolioData,
    summary: { ...totals, totalPnLPercent },
  });
};

exports.updatePortfolioPrices = async (req, res) => {
  const { prices } = req.body; // { AAPL: 150.25, GOOGL: 2800.00 }
  const userId = req.user.id;

  const holdings = await Portfolio.findAll({ where: { userId } });
  const updatePromises = holdings
    .filter((h) => prices[h.symbol])
    .map((h) =>
      h.update({
        currentPrice: prices[h.symbol],
        lastUpdated: new Date(),
      })
    );

  await Promise.all(updatePromises);
  res.json({ message: 'Portfolio prices updated', updatedCount: updatePromises.length });
};

exports.getHoldingDetail = async (req, res) => {
  const { symbol } = req.params;
  const holding = await Portfolio.findOne({
    where: { userId: req.user.id, symbol: symbol.toUpperCase() },
  });
  if (!holding) {
    return res.status(404).json({ error: 'Holding not found' });
  }

  const trades = await Trade.findAll({
    where: { userId: req.user.id, symbol: symbol.toUpperCase() },
    order: [['createdAt', 'DESC']],
    limit: 20,
  });

  const qty = parseFloat(holding.quantity);
  const avgBuy = parseFloat(holding.avgBuyPrice);
  const current = parseFloat(holding.currentPrice) || avgBuy;

  res.json({
    holding: {
      ...holding.toJSON(),
      currentValue: qty * current,
      pnl: qty * (current - avgBuy),
      pnlPercent: avgBuy > 0 ? ((current - avgBuy) / avgBuy) * 100 : 0,
    },
    trades,
  });
};