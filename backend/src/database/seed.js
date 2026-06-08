require('dotenv').config();
const { sequelize, User, Wallet, Portfolio } = require('../models');

const seed = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Create demo user
    const [user] = await User.findOrCreate({
      where: { email: 'demo@tradepro.com' },
      defaults: {
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@tradepro.com',
        password: 'Demo@12345',
        phone: '+919876543210',
        kycStatus: 'verified',
        isEmailVerified: true,
      },
    });

    const [wallet] = await Wallet.findOrCreate({
      where: { userId: user.id },
      defaults: {
        userId: user.id,
        balance: 100000,
        totalDeposited: 100000,
        currency: 'INR',
      },
    });

    const sampleHoldings = [
      { symbol: 'AAPL', companyName: 'Apple Inc.', quantity: 10, avgBuyPrice: 150, currentPrice: 175, totalInvested: 1500 },
      { symbol: 'GOOGL', companyName: 'Alphabet Inc.', quantity: 2, avgBuyPrice: 2800, currentPrice: 3000, totalInvested: 5600 },
      { symbol: 'MSFT', companyName: 'Microsoft Corp.', quantity: 5, avgBuyPrice: 280, currentPrice: 310, totalInvested: 1400 },
    ];

    for (const holding of sampleHoldings) {
      await Portfolio.findOrCreate({
        where: { userId: user.id, symbol: holding.symbol },
        defaults: { ...holding, userId: user.id },
      });
    }

    console.log('✅ Seed completed successfully');
    console.log('📧 Demo login: demo@tradepro.com / Demo@12345');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();