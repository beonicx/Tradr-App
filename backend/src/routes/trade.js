const router = require('express').Router();
const { body, query } = require('express-validator');
const tradeController = require('../controllers/tradeController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

router.post(
  '/execute',
  [
    body('symbol').notEmpty().trim().toUpperCase().withMessage('Symbol required'),
    body('type').isIn(['buy', 'sell']).withMessage('Type must be buy or sell'),
    body('quantity').isFloat({ min: 0.000001 }).withMessage('Valid quantity required'),
    body('price').isFloat({ min: 0.0001 }).withMessage('Valid price required'),
    body('orderType').optional().isIn(['market', 'limit', 'stop_loss', 'stop_limit']),
  ],
  validate,
  tradeController.executeTrade
);

router.get(
  '/history',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  tradeController.getTradeHistory
);

router.get('/summary', tradeController.getTradeSummary);
router.get('/:id', tradeController.getTradeById);

module.exports = router;