const { v4: uuidv4 } = require('uuid');
const { Wallet, Transaction, sequelize } = require('../models');
const razorpayService = require('../services/razorpayService');
const emailService = require('../services/emailService');

exports.createDepositOrder = async (req, res) => {
  const { amount } = req.body;
  if (!amount || parseFloat(amount) < 100) {
    return res.status(400).json({ error: 'Minimum deposit amount is ₹100' });
  }
  if (parseFloat(amount) > 1000000) {
    return res.status(400).json({ error: 'Maximum deposit amount is ₹10,00,000' });
  }

  const receipt = `dep_${uuidv4().replace(/-/g, '').slice(0, 20)}`;
  const order = await razorpayService.createOrder(parseFloat(amount), 'INR', receipt, {
    userId: req.user.id,
    type: 'deposit',
    userEmail: req.user.email,
  });

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    keyId: process.env.RAZORPAY_KEY_ID,
    prefill: {
      name: `${req.user.firstName} ${req.user.lastName}`,
      email: req.user.email,
      contact: req.user.phone || '',
    },
  });
};

exports.verifyDeposit = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = req.body;

    const isValid = razorpayService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      await t.rollback();
      return res.status(400).json({ error: 'Payment verification failed - invalid signature' });
    }

    // Check for duplicate payment
    const existing = await Transaction.findOne({
      where: { razorpayPaymentId },
      transaction: t,
    });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ error: 'Payment already processed' });
    }

    const wallet = await Wallet.findOne({
      where: { userId: req.user.id },
      transaction: t,
      lock: true,
    });

    const depositAmount = parseFloat(amount) / 100;
    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore + depositAmount;

    await wallet.update(
      {
        balance: balanceAfter,
        totalDeposited: parseFloat(wallet.totalDeposited) + depositAmount,
      },
      { transaction: t }
    );

    const txn = await Transaction.create(
      {
        userId: req.user.id,
        walletId: wallet.id,
        type: 'deposit',
        amount: depositAmount,
        balanceBefore,
        balanceAfter,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: 'completed',
        description: `Deposit via Razorpay`,
        metadata: { orderId: razorpayOrderId, paymentId: razorpayPaymentId },
      },
      { transaction: t }
    );

    await t.commit();

    // Send email (non-blocking)
    emailService.sendDepositConfirmation(req.user, depositAmount).catch(console.error);

    res.json({
      message: '✅ Payment verified successfully',
      transaction: {
        id: txn.id,
        amount: depositAmount,
        balanceAfter,
        status: 'completed',
      },
      newBalance: balanceAfter,
    });
  } catch (error) {
    await t.rollback();
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

exports.getWallet = async (req, res) => {
  const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  res.json({
    ...wallet.toJSON(),
    availableBalance: wallet.getAvailableBalance(),
  });
};

exports.getTransactions = async (req, res) => {
  const { page = 1, limit = 20, type, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = { userId: req.user.id };
  if (type) where.type = type;
  if (status) where.status = status;

  const { count, rows } = await Transaction.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({
    transactions: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
};

exports.initiateWithdrawal = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount, bankAccount, ifscCode } = req.body;
    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount < 500) {
      await t.rollback();
      return res.status(400).json({ error: 'Minimum withdrawal is ₹500' });
    }

    const wallet = await Wallet.findOne({ where: { userId: req.user.id }, transaction: t, lock: true });
    const available = wallet.getAvailableBalance();

    if (available < withdrawAmount) {
      await t.rollback();
      return res.status(400).json({
        error: 'Insufficient balance',
        available,
        requested: withdrawAmount,
      });
    }

    await wallet.update(
      {
        balance: parseFloat(wallet.balance) - withdrawAmount,
        totalWithdrawn: parseFloat(wallet.totalWithdrawn) + withdrawAmount,
      },
      { transaction: t }
    );

    await Transaction.create(
      {
        userId: req.user.id,
        walletId: wallet.id,
        type: 'withdrawal',
        amount: withdrawAmount,
        balanceBefore: parseFloat(wallet.balance) + withdrawAmount,
        balanceAfter: parseFloat(wallet.balance),
        status: 'processing',
        description: `Withdrawal to bank account ending ${bankAccount?.slice(-4)}`,
        metadata: { bankAccount, ifscCode },
      },
      { transaction: t }
    );

    await t.commit();
    res.json({ message: 'Withdrawal initiated. Funds will be credited in 1-3 business days.' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Withdrawal failed' });
  }
};