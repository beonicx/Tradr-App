const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').trim().notEmpty().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be 8+ chars with uppercase, lowercase and number'),
    body('phone').optional({ values: 'falsy' }).isMobilePhone().withMessage('Valid phone number required'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  authController.login
);

router.post(
  '/refresh-token',
  [body('refreshToken').notEmpty().withMessage('Refresh token required')],
  validate,
  authController.refreshToken
);

router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getProfile);
router.post('/setup-2fa', authenticate, authController.setup2FA);
router.post(
  '/enable-2fa',
  authenticate,
  [body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Valid 6-digit code required')],
  validate,
  authController.enable2FA
);
router.post('/disable-2fa', authenticate, authController.disable2FA);
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  ],
  validate,
  authController.changePassword
);

module.exports = router;
