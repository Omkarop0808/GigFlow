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
    // DO NOT set domain - let browser handle it for cross-origin
  };

  // Detect production: check if CLIENT_URL is not localhost (production deployment)
  const isProduction = ENV.NODE_ENV === 'production' || 
                       (ENV.CLIENT_URL && !ENV.CLIENT_URL.includes('localhost'));

  if (isProduction) {
    // In production, use 'none' for cross-origin cookies (Vercel + Render)
    cookieOptions.sameSite = 'none'; // Required for cross-origin cookies
    cookieOptions.secure = true; // Required when sameSite is 'none' (HTTPS only)
  } else {
    // In development, use permissive settings
    cookieOptions.sameSite = 'lax'; // Allow cross-origin in dev
    cookieOptions.secure = false; // Allow HTTP in dev
  }

  // Set cookie
  res.cookie('jwt', token, cookieOptions);

  console.log('🍪 Cookie set with options:', {
    httpOnly: cookieOptions.httpOnly,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
    maxAge: cookieOptions.maxAge,
    path: cookieOptions.path,
  });

  return token;
};

export default generateToken;