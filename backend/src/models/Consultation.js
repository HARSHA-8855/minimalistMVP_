import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120,
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  consultationType: {
    type: String,
    required: true,
    enum: ['skin', 'hair'],
  },
  skinType: {
    type: String,
    enum: ['dry', 'oily', 'combination', 'normal', 'sensitive'],
  },
  concerns: {
    type: String,
    default: '',
  },
  currentProducts: {
    type: String,
    default: '',
  },
  // Payment details
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  // Scheduling
  scheduledDate: {
    type: Date,
  },
  scheduledTime: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending',
  },
  // Google Calendar
  googleCalendarEventId: {
    type: String,
  },
  googleCalendarLink: {
    type: String,
  },
  // User reference (if authenticated)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Admin/Expert notes
  expertNotes: {
    type: String,
    default: '',
  },
  assignedExpert: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Generate consultation reference number
consultationSchema.virtual('referenceNumber').get(function() {
  return `CONS-${this._id.toString().substring(0, 8).toUpperCase()}`;
});

// Auto-schedule consultation for next available slot (2 days from booking)
consultationSchema.pre('save', async function(next) {
  if (this.isNew && !this.scheduledDate) {
    // Schedule for 2 days from now at 10 AM by default
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 2);
    scheduledDate.setHours(10, 0, 0, 0);
    this.scheduledDate = scheduledDate;
    this.scheduledTime = '10:00 AM';
    this.status = 'scheduled';
  }
  next();
});

export default mongoose.model('Consultation', consultationSchema);

