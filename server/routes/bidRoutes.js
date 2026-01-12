import express from 'express';
import {
  createBid,
  getBidsForGig,
  getMyBids,
  hireBid,
  getBidById,
} from '../controllers/bidController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.post('/', protect, createBid);
router.get('/my-bids', protect, getMyBids);
router.get('/bid/:bidId', protect, getBidById);
router.get('/:gigId', protect, getBidsForGig);

// The critical hiring endpoint
router.patch('/:bidId/hire', protect, hireBid);

export default router;