import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [1500, 'Description cannot be more than 2000 characters'],
    },
    budget: {
      type: Number,
      required: [true, 'Please provide a budget'],
      min: [0, 'Budget cannot be negative'],
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'completed', 'cancelled'],
      default: 'open',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['web-development', 'mobile-development', 'design', 'writing', 'marketing','VedioEditing','other'],
      default: 'other',
    },
    // Track which bid was accepted (if any)
    hiredBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null,
    },
  },
  {
    timestamps: true,
    // Virtual TO get or for getting all bids
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate - To get all bids for this gig
gigSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'gig',
});

// Index for efficient searching
gigSchema.index({ title: 'text', description: 'text' });
gigSchema.index({ status: 1, createdAt: -1 });

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;