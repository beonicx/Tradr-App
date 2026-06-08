const router = require('express').Router();
const { body } = require('express-validator');
const watchlistController = require('../controllers/watchlistController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/', watchlistController.getWatchlist);

router.post(
  '/',
  [
    body('symbol').notEmpty().trim().toUpperCase().withMessage('Symbol required'),
    body('alertType').optional().isIn(['above', 'below']),
    body('alertPrice').optional().isFloat({ min: 0 }),
  ],
  validate,
  watchlistController.addToWatchlist
);

router.delete('/:symbol', watchlistController.removeFromWatchlist);
router.patch('/:symbol/alert', watchlistController.updateAlert);

module.exports = router;