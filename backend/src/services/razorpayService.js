const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayService {
  constructor() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('⚠️  Razorpay credentials not configured');
    }
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }

  async createOrder(amount, currency = 'INR', receipt, notes = {}) {
    const options = {
      amount: Math.round(parseFloat(amount) * 100),
      currency,
      receipt: receipt.substring(0, 40),
      notes,
      payment_capture: 1,
    };
    return await this.razorpay.orders.create(options);
  }

  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );
    } catch {
      return false;
    }
  }

  async getPaymentDetails(paymentId) {
    return await this.razorpay.payments.fetch(paymentId);
  }

  async capturePayment(paymentId, amount, currency = 'INR') {
    return await this.razorpay.payments.capture(paymentId, Math.round(amount * 100), currency);
  }

  async createRefund(paymentId, amount, notes = {}) {
    return await this.razorpay.payments.refund(paymentId, {
      amount: Math.round(parseFloat(amount) * 100),
      notes,
    });
  }

  async getOrderDetails(orderId) {
    return await this.razorpay.orders.fetch(orderId);
  }

  async getOrderPayments(orderId) {
    return await this.razorpay.orders.fetchPayments(orderId);
  }
}

module.exports = new RazorpayService();