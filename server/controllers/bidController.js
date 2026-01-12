import Bid from '../models/bid.model.js';
import Gig from '../models/gig.model.js';
import mongoose from 'mongoose';

//    Create a new bid for a gig
export const createBid = async (req, res) => {
  try {
    const { gigId, proposedAmount, coverLetter, deliveryTime } = req.body;

    // Validation
    if (!gigId || !proposedAmount || !coverLetter || !deliveryTime) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);

    if (!gig) {
      res.status(404);
      throw new Error('Gig not found');
    }

    if (gig.status !== 'open') {
      res.status(400);
      throw new Error('This gig is no longer accepting bids');
    }

    // Prevent client from bidding on their own gig
    if (gig.client.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot bid on your own gig');
    }

    // Check if user already bid on this gig
    const existingBid = await Bid.findOne({
      gig: gigId,
      freelancer: req.user._id,
    });

    if (existingBid) {
      res.status(400);
      throw new Error('You have already submitted a bid for this gig');
    }

    // Create bid
    const bid = await Bid.create({
      gig: gigId,
      freelancer: req.user._id,
      proposedAmount,
      coverLetter,
      deliveryTime,
    });

    // Populate freelancer info
    await bid.populate('freelancer', 'name email bio skills');

    res.status(201).json(bid);
  } catch (error) {
    res.status(res.statusCode || 500);
    throw error;
  }
};

// get all bid for a specific gig

export const getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    // Check if gig exists
    const gig = await Gig.findById(gigId);

    if (!gig) {
      res.status(404);
      throw new Error('Gig not found');
    }

    // Check if user is the gig owner
    if (gig.client.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view bids for this gig');
    }

    // Get all bids
    const bids = await Bid.find({ gig: gigId })
      .populate('freelancer', 'name email bio skills')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(res.statusCode || 500);
    throw error;
  }
};

// get user bids
export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user._id })
      .populate('gig', 'title budget status')
      .populate('gig.client', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500);
    throw error;
  }
};

/**
 * @desc    Hire a freelancer (CRITICAL ATOMIC OPERATION)
 * @route   PATCH /api/bids/:bidId/hire
 * @access -  Private (Only gig owner)
 * 
 * THIS IS THE MOST IMPORTANT FUNCTION - IT HANDLES:
 * 1. Validate the bid exists and gig is still open
 * 2. Change gig status to 'assigned'
 * 3. Set the selected bid to 'hired'
 * 4. Reject ALL other bids atomically
 */

export const hireBid = async (req, res) => {
  // Start a session for transaction (BONUS: Prevents race conditions)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    // Find the bid with session
    const bid = await Bid.findById(bidId).populate('gig').session(session);

    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      res.status(404);
      throw new Error('Bid not found');
    }

    const gig = bid.gig;

    // Authorization: Check if user is the gig owner
    if (gig.client.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      res.status(403);
      throw new Error('Not authorized to hire for this gig');
    }

    // Validation: Check if gig is still open
    if (gig.status !== 'open') {
      await session.abortTransaction();
      session.endSession();
      res.status(400);
      throw new Error('This gig is no longer open for hiring');
    }

    // ATOMIC OPERATIONS (All or nothing):

    // 1. Update the gig status to 'assigned' and set hiredBid
    await Gig.findByIdAndUpdate(
      gig._id,
      {
        status: 'assigned',
        hiredBid: bid._id,
      },
      { session }
    );

    // 2. Update the selected bid to 'hired'
    await Bid.findByIdAndUpdate(
      bid._id,
      { status: 'hired' },
      { session }
    );

    // 3. Reject ALL other bids for this gig
    await Bid.updateMany(
      {
        gig: gig._id,
        _id: { $ne: bid._id }, // Not the hired bid
        status: 'pending', // Only update pending bids
      },
      { status: 'rejected' },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Fetch updated bid with populated data
    const updatedBid = await Bid.findById(bid._id)
      .populate('freelancer', 'name email')
      .populate('gig', 'title budget');

    res.json({
      message: 'Freelancer hired successfully',
      bid: updatedBid,
    });
  } catch (error) {
    // If anything fails, rollback everything
    await session.abortTransaction();
    session.endSession();
    res.status(res.statusCode || 500);
    throw error;
  }
};

/**
 * @desc    Get single bid by ID
 * @route   GET /api/bids/bid/:bidId
 * @access  Private
 */
export const getBidById = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId)
      .populate('freelancer', 'name email bio skills')
      .populate('gig', 'title description budget status');

    if (!bid) {
      res.status(404);
      throw new Error('Bid not found');
    }

    res.json(bid);
  } catch (error) {
    res.status(res.statusCode || 500);
    throw error;
  }
};