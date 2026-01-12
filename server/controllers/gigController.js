import Gig from '../models/gig.model.js';

// to get all open gigs
export const getGigs = async (req, res) => {
  try {
    const { search, category, status = 'open' } = req.query;

    // Build query
    const query = { status };

    // Add search if provided
    if (search) {
      query.$text = { $search: search };
    }

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const gigs = await Gig.find(query)
      .populate('client', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Gig.countDocuments(query);

    res.json({
      gigs,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500);
    throw error;
  }
};

// To get gig by id (get gig by id)
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('client', 'name email bio')
      .populate('hiredBid');

    if (!gig) {
      res.status(404);
      throw new Error('Gig not found');
    }

    res.json(gig);
  } catch (error) {
    res.status(res.statusCode || 500);
    throw error;
  }
};

// Creating new gig
export const createGig = async (req, res) => {
  try {
    const { title, description, budget, category } = req.body;

    // Validation
    if (!title || !description || !budget) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    const gig = await Gig.create({
      title,
      description,
      budget,
      category: category || 'other',
      client: req.user._id,
    });

    // Populate client info
    await gig.populate('client', 'name email');

    res.status(201).json(gig);
  } catch (error) {
    res.status(res.statusCode || 500);
    throw error;
  }
};

// getting user gigis
export const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ client: req.user._id })
      .populate('hiredBid')
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error) {
    res.status(500);
    throw error;
  }
};