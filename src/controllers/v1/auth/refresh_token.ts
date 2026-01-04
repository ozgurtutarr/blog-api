// Node Modules
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

// Custom Modules
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

// Models
import Token from '@/models/token';

// Types
import type { Request, Response } from 'express';
import { Types } from 'mongoose';

const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string;

  if (!token) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Refresh token not found',
    });
    return;
  }

  try {
    const jwtPayload = verifyRefreshToken(token) as { userId: string };
    const accessToken = generateAccessToken(jwtPayload.userId as any);

    res.status(200).json({
      accessToken,
    });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Refresh token expired, please login again',
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
      return;
    }

    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error during refresh token', err);
  }
};

export default refreshToken;
