const { Watchlist } = require('../models');

exports.getWatchlist = async (req, res) => {
  const items = await Watchlist.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
  });
  res.json({ watchlist: items });
};

exports.addToWatchlist = async (req, res) => {
  const { symbol, companyName, sector, alertPrice, alertType } = req.body;

  const [item, created] = await Watchlist.findOrCreate({
    where: { userId: req.user.id, symbol: symbol.toUpperCase() },
    defaults: {
      userId: req.user.id,
      symbol: symbol.toUpperCase(),
      companyName,
      sector,
      alertPrice,
      alertType,
      alertEnabled: !!(alertPrice && alertType),
    },
  });

  if (!created) {
    return res.status(409).json({ error: 'Stock already in watchlist', item });
  }

  res.status(201).json({ message: 'Added to watchlist', item });
};

exports.removeFromWatchlist = async (req, res) => {
  const { symbol } = req.params;
  const deleted = await Watchlist.destroy({
    where: { userId: req.user.id, symbol: symbol.toUpperCase() },
  });
  if (!deleted) return res.status(404).json({ error: 'Item not found in watchlist' });
  res.json({ message: 'Removed from watchlist' });
};

exports.updateAlert = async (req, res) => {
  const { symbol } = req.params;
  const { alertPrice, alertType, alertEnabled } = req.body;

  const item = await Watchlist.findOne({
    where: { userId: req.user.id, symbol: symbol.toUpperCase() },
  });

  if (!item) return res.status(404).json({ error: 'Watchlist item not found' });

  await item.update({ alertPrice, alertType, alertEnabled });
  res.json({ message: 'Alert updated', item });
};