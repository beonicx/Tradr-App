const router = require('express').Router();
const marketController = require('../controllers/marketController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/search', marketController.searchStocks);
router.get('/status', marketController.getMarketStatus);
router.get('/movers', marketController.getTopMovers);
router.get('/stock/:symbol', marketController.getStockDetails);
router.get('/chart/:symbol', marketController.getChartData);
router.get('/snapshot/:symbol', marketController.getTickerSnapshot);
router.get('/prev-close/:symbol', marketController.getPreviousClose);

module.exports = router;
