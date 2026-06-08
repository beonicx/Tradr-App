const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const crypto = require('crypto');
const { User, Wallet } = require('../models');
const { validationResult } = require('express-validator');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
};

const formatUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  kycStatus: user.kycStatus,
  isEmailVerified: user.isEmailVerified,
  twoFactorEnabled: user.twoFactorEnabled,
  riskProfile: user.riskProfile,
  lastLogin: user.lastLogin,
  notificationPreferences: user.notificationPreferences,
  createdAt: user.createdAt,
});

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { firstName, lastName, email, password, phone } = req.body;

  const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  if (phone) {
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }
  }

  const user = await User.create({ firstName, lastName, email, password, phone });
  await Wallet.create({ userId: user.id });

  const { accessToken, refreshToken } = generateTokens(user.id);
  await user.update({ refreshToken, lastLogin: new Date() });

  res.status(201).json({
    message: 'Registration successful',
    user: formatUser(user),
    accessToken,
    refreshToken,
  });
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { email, password, twoFactorCode } = req.body;

  const user = await User.findOne({ where: { email: email.toLowerCase(), isActive: true } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.twoFactorEnabled) {
    if (!twoFactorCode) {
      return res.status(200).json({
        requiresTwoFactor: true,
        message: 'Two-factor authentication code required',
      });
    }
    const isValidToken = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorCode.toString(),
      window: 2,
    });
    if (!isValidToken) {
      return res.status(401).json({ error: 'Invalid 2FA code' });
    }
  }

  const { accessToken, refreshToken } = generateTokens(user.id);
  await user.update({ refreshToken, lastLogin: new Date() });

  res.json({
    message: 'Login successful',
    user: formatUser(user),
    accessToken,
    refreshToken,
  });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const user = await User.findOne({
    where: { id: decoded.userId, refreshToken, isActive: true },
  });

  if (!user) {
    return res.status(401).json({ error: 'Refresh token revoked or user not found' });
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
  await user.update({ refreshToken: newRefreshToken });

  res.json({ accessToken, refreshToken: newRefreshToken });
};

exports.logout = async (req, res) => {
  await req.user.update({ refreshToken: null });
  res.json({ message: 'Logged out successfully' });
};

exports.getProfile = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

exports.setup2FA = async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `TradePro (${req.user.email})`,
    issuer: 'TradePro',
    length: 20,
  });
  await req.user.update({ twoFactorSecret: secret.base32 });
  res.json({
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
    message: 'Scan this QR code with your authenticator app',
  });
};

exports.enable2FA = async (req, res) => {
  const { code } = req.body;
  if (!req.user.twoFactorSecret) {
    return res.status(400).json({ error: 'Please setup 2FA first' });
  }
  const isValid = speakeasy.totp.verify({
    secret: req.user.twoFactorSecret,
    encoding: 'base32',
    token: code.toString(),
    window: 2,
  });
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  await req.user.update({ twoFactorEnabled: true });
  res.json({ message: '2FA enabled successfully' });
};

exports.disable2FA = async (req, res) => {
  const { password } = req.body;
  const user = await User.findByPk(req.user.id);
  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  await user.update({ twoFactorEnabled: false, twoFactorSecret: null });
  res.json({ message: '2FA disabled successfully' });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);
  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  await user.update({ password: newPassword });
  res.json({ message: 'Password changed successfully' });
};