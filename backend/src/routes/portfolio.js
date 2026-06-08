const router = require('express').Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', portfolioController.getPortfolio);
router.post('/update-prices', portfolioController.updatePortfolioPrices);
router.get('/:symbol', portfolioController.getHoldingDetail);

module.exports = router;