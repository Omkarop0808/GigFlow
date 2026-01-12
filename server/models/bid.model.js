import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposedAmount: {
      type: Number,
      required: [true, 'Please provide a proposed amount'],
      min: [0, 'Amount cannot be negative'],
    },
    coverLetter: {
      type: String,
      required: [true, 'Please provide a cover letter'],
      maxlength: [1000, 'Cover letter cannot be more than 1000 characters'],
    },
    deliveryTime: {
      type: Number, // in days
      required: [true, 'Please provide estimated delivery time'],
      min: [1, 'Delivery time must be at least 1 day'],
    },
    status: {
      type: String,
      enum: ['pending', 'hired', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index - prevent duplicate bids
bidSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

// Index for efficient queries
bidSchema.index({ gig: 1, status: 1 });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;