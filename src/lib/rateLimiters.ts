import { rateLimit } from 'express-rate-limit';

// Strict limiter for authentication routes (Login/Register)
// 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
});

// General limiter for API routes
// 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
});
