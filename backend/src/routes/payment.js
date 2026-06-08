const router = require('express').Router();
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

router.post(
  '/create-order',
  [body('amount').isFloat({ min: 100 }).withMessage('Minimum amount is 100')],
  validate,
  paymentController.createDepositOrder
);

router.post(
  '/verify',
  [
    body('razorpayOrderId').notEmpty().withMessage('Order ID required'),
    body('razorpayPaymentId').notEmpty().withMessage('Payment ID required'),
    body('razorpaySignature').notEmpty().withMessage('Signature required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount required'),
  ],
  validate,
  paymentController.verifyDeposit
);

router.get('/wallet', paymentController.getWallet);
router.get('/transactions', paymentController.getTransactions);

router.post(
  '/withdraw',
  [
    body('amount').isFloat({ min: 500 }).withMessage('Minimum withdrawal is ₹500'),
    body('bankAccount').notEmpty().withMessage('Bank account required'),
    body('ifscCode').notEmpty().withMessage('IFSC code required'),
  ],
  validate,
  paymentController.initiateWithdrawal
);

module.exports = router;