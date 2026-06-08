const router = require('express').Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

router.patch(
  '/profile',
  [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    body('riskProfile').optional().isIn(['conservative', 'moderate', 'aggressive']),
  ],
  validate,
  userController.updateProfile
);

router.post(
  '/pin',
  [
    body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  userController.setPin
);

router.post(
  '/verify-pin',
  [body('pin').isLength({ min: 4, max: 6 }).isNumeric()],
  validate,
  userController.verifyPin
);

router.delete('/account', userController.deleteAccount);

module.exports = router;