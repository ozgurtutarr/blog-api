// Node modules
import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

// Custom modules
import { verifyAccessToken } from '@/lib/jwt';
import { AppError } from '@/utils/AppError';

// Types
import type { Types } from 'mongoose';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the Authorization header
    const authHeader = req.headers.authorization;

    // If there's no Bearer token, respond with 401 Unauthorized
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Access denied, no token provided', 401);
    }

    // Split out the token from the 'Bearer' prefix
    const [_, token] = authHeader.split(' ');

    if (!token) {
      throw new AppError('Access denied, malformed token', 401);
    }

    // Verify the token and extract the userId from the payload
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    // Attach the userId to the request object for later use
    req.userId = jwtPayload.userId;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return next(
        new AppError(
          'Access token expired, request a new one with refresh token',
          401,
        ),
      );
    }

    if (err instanceof JsonWebTokenError) {
      return next(new AppError('Access token invalid', 401));
    }

    // Pass detailed error 401 for auth failures
    if (err instanceof AppError) {
      return next(err);
    }

    // For other errors, let global handler decide (mostly 500)
    next(err);
  }
};

export default authenticate;
