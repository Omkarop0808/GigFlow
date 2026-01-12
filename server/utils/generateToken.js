import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

/**
 * Generate JWT and set as HttpOnly cookie
 * @param {Object} res - Express response object
 * @param {String} userId - User's MongoDB _id
 */
const generateToken = (res, userId) => {
  // Create JWT
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRE,
  });

  // Cookie options based on environment
  const cookieOptions = {
    httpOnly: true, // Cannot be accessed via JavaScript (XSS protection)
    maxAge: parseInt(ENV.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/', // Cookie available to all routes
  };

  // In development, use permissive settings
  if (ENV.NODE_ENV === 'development') {
    cookieOptions.sameSite = 'lax'; // Allow cross-origin in dev
    cookieOptions.secure = false; // Allow HTTP in dev
  } else {
    // In production, use strict security
    cookieOptions.sameSite = 'strict';
    cookieOptions.secure = true; // HTTPS only
  }

  // Set cookie
  res.cookie('jwt', token, cookieOptions);

  console.log('🍪 Cookie set with options:', {
    httpOnly: cookieOptions.httpOnly,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
    maxAge: cookieOptions.maxAge,
  });

  return token;
};

export default generateToken;