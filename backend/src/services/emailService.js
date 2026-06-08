const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: `"TradePro" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const html = `
      
        Welcome to TradePro! 🚀
        Hi ${user.firstName},
        Your account has been created successfully. Start your trading journey today!
        
          Start Trading
        
        TradePro - Smart Trading Platform
      
    `;
    return this.sendEmail(user.email, 'Welcome to TradePro!', html);
  }

  async sendTradeConfirmation(user, trade) {
    const html = `
      
        
          Trade ${trade.type === 'buy' ? 'Executed ✅' : 'Completed 📤'}
        
        Hi ${user.firstName}, your trade has been executed:
        
          Symbol${trade.symbol}
          Type${trade.type}
          Quantity${trade.quantity}
          Price₹${parseFloat(trade.price).toFixed(2)}
          Total₹${parseFloat(trade.totalAmount).toFixed(2)}
        
        TradePro - Smart Trading Platform
      
    `;
    return this.sendEmail(user.email, `Trade Confirmation - ${trade.symbol}`, html);
  }

  async sendDepositConfirmation(user, amount) {
    const html = `
      
        Deposit Successful 💰
        Hi ${user.firstName}, your deposit has been processed:
        ₹${parseFloat(amount).toFixed(2)}
        Your wallet has been credited. Happy Trading!
        TradePro - Smart Trading Platform
      
    `;
    return this.sendEmail(user.email, 'Deposit Confirmed - TradePro', html);
  }
}

module.exports = new EmailService();
