const { User } = require('../models');

exports.updateProfile = async (req, res) => {
  const { firstName, lastName, phone, dateOfBirth, address, riskProfile, notificationPreferences } = req.body;
  const updates = {};
  if (firstName) updates.firstName = firstName;
  if (lastName) updates.lastName = lastName;
  if (phone) updates.phone = phone;
  if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
  if (address) updates.address = address;
  if (riskProfile) updates.riskProfile = riskProfile;
  if (notificationPreferences) updates.notificationPreferences = notificationPreferences;

  await req.user.update(updates);
  res.json({ message: 'Profile updated', user: req.user.toSafeJSON() });
};

exports.setPin = async (req, res) => {
  const { pin, password } = req.body;
  const user = await User.findByPk(req.user.id);
  const isValid = await user.comparePassword(password);
  if (!isValid) return res.status(401).json({ error: 'Invalid password' });
  await user.update({ pin });
  res.json({ message: 'PIN set successfully' });
};

exports.verifyPin = async (req, res) => {
  const { pin } = req.body;
  const user = await User.findByPk(req.user.id);
  const isValid = await user.comparePin(pin);
  if (!isValid) return res.status(401).json({ error: 'Invalid PIN' });
  res.json({ valid: true });
};

exports.deleteAccount = async (req, res) => {
  const { password } = req.body;
  const user = await User.findByPk(req.user.id);
  const isValid = await user.comparePassword(password);
  if (!isValid) return res.status(401).json({ error: 'Invalid password' });
  await user.update({ isActive: false, refreshToken: null });
  res.json({ message: 'Account deactivated successfully' });
};
