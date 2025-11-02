import express from 'express';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

// ✅ 1. Route for creating Razorpay order (already have)
router.post('/create-razorpay-order', createRazorpayOrder);

// ✅ 2. Route for verifying payment (already have)
router.post('/verify-payment', verifyPayment);

// ✅ 3. Route for sending public Razorpay key to frontend
router.get('/razorpay-key', (req, res) => {
  try {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Razorpay key' });
  }
});

export default router;
