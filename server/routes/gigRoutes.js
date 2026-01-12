import express from 'express';
import {
  getGigs,
  getGigById,
  createGig,
  getMyGigs,
} from '../controllers/gigController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// IMPORTANT: Specific routes MUST come before dynamic routes
// Put /my/gigs BEFORE /:id to prevent route conflicts

// Public routes
router.get('/', getGigs);

// Protected routes (specific paths first)
router.get('/my/gigs', protect, getMyGigs); // Move this BEFORE /:id
router.post('/', protect, createGig);

// Dynamic routes (must be last)
router.get('/:id', getGigById);

export default router;