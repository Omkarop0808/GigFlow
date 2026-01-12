import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ENV } from '../config/env.js';

//   Protect routes - verify JWT from cookie

export const protect = async (req, res, next) => {
  let token;

  // Read JWT from cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, ENV.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

/**
 * Check if user is the owner of a resource
 * Usage: Use after protect middleware
 */
export const checkOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[paramName]);

      if (!resource) {
        res.status(404);
        throw new Error('Resource not found');
      }

      // Check if user owns the resource
      const ownerId = resource.client || resource.freelancer || resource._id;
      
      if (ownerId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this resource');
      }

      // Attach resource to request for use in controller
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};