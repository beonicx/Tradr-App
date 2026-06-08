const PolygonService = require('../services/polygonService');

const polygon = new PolygonService(null);

exports.searchStocks = async (req, res) => {
  const { q, limit = 20 } = req.query;
  if (!q || q.trim().length < 1) {
    return res.status(400).json({ error: 'Search query required (min 1 character)' });
  }
  const results = await polygon.searchTickers(q.trim(), parseInt(limit));
  res.json({ results, query: q });
};

exports.getStockDetails = async (req, res) => {
  const { symbol } = req.params;
  const details = await polygon.getStockDetails(symbol);
  if (!details) return res.status(404).json({ error: 'Stock not found' });
  res.json(details);
};

exports.getChartData = async (req, res) => {
  const { symbol } = req.params;
  const { timespan = 'day', multiplier = 1, from, to } = req.query;

  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fromDate = from || defaultFrom.toISOString().split('T')[0];
  const toDate = to || now.toISOString().split('T')[0];

  const data = await polygon.getAggregates(
    symbol,
    parseInt(multiplier),
    timespan,
    fromDate,
    toDate
  );

  res.json({ symbol: symbol.toUpperCase(), data, count: data.length });
};

exports.getMarketStatus = async (req, res) => {
  const status = await polygon.getMarketStatus();
  res.json(status);
};

exports.getTopMovers = async (req, res) => {
  const movers = await polygon.getTopMovers();
  res.json(movers);
};

exports.getTickerSnapshot = async (req, res) => {
  const { symbol } = req.params;
  const snapshot = await polygon.getTickerSnapshot(symbol);
  if (!snapshot) return res.status(404).json({ error: 'Snapshot not found' });
  res.json(snapshot);
};

exports.getPreviousClose = async (req, res) => {
  const { symbol } = req.params;
  const data = await polygon.getPreviousClose(symbol);
  if (!data) return res.status(404).json({ error: 'Previous close data not found' });
  res.json(data);
};