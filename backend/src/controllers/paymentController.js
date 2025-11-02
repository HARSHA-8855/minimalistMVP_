import Razorpay from 'razorpay';
import crypto from 'crypto';
import Consultation from '../models/Consultation.js';
import { sendConsultationConfirmation } from '../services/emailService.js';
import { createCalendarEvent } from '../services/calendarService.js';

// Initialize Razorpay only if keys are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export const createRazorpayOrder = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway is not configured. Please add Razorpay keys to .env file.',
      });
    }

    const { amount, currency = 'INR', consultationData } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        consultationData: JSON.stringify(consultationData || {}),
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway is not configured. Please add Razorpay keys to .env file.',
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, consultationData } = req.body;

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Payment verified successfully - Save consultation to database
    try {
      const consultation = await Consultation.create({
        name: consultationData.name,
        age: consultationData.age,
        gender: consultationData.gender,
        email: consultationData.email || '',
        phone: consultationData.phone || '',
        consultationType: consultationData.consultationType,
        skinType: consultationData.skinType || '',
        concerns: consultationData.concerns || '',
        currentProducts: consultationData.currentProducts || '',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: 29900, // ₹299 in paise
        paymentStatus: 'completed',
        status: 'scheduled',
        // Auto-schedule for 2 days from now (handled by pre-save hook)
      });

      // Generate reference number
      const referenceNumber = `CONS-${consultation._id.toString().substring(0, 8).toUpperCase()}`;
      
      // Add reference number to consultation for email/calendar
      const consultationWithRef = {
        ...consultation.toObject(),
        referenceNumber,
      };

      // Create Google Calendar event (async, don't block response)
      createCalendarEvent(consultationWithRef).then((calendarData) => {
        if (calendarData) {
          consultation.googleCalendarEventId = calendarData.eventId;
          consultation.googleCalendarLink = calendarData.htmlLink;
          consultation.save().catch(err => console.error('Error saving calendar link:', err));
        }
      }).catch(err => console.error('Error creating calendar event:', err));

      // Send confirmation email (async, don't block response)
      sendConsultationConfirmation(consultationWithRef).catch(err => 
        console.error('Error sending confirmation email:', err)
      );

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully and consultation booked',
        consultation: {
          id: consultation._id,
          referenceNumber: referenceNumber,
          scheduledDate: consultation.scheduledDate,
          scheduledTime: consultation.scheduledTime,
        },
        consultationData,
      });
    } catch (dbError) {
      console.error('Error saving consultation:', dbError);
      // Payment is verified but failed to save consultation
      res.status(500).json({
        success: false,
        message: 'Payment verified but failed to save consultation. Please contact support.',
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};

