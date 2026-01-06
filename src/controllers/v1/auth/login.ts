// Node Modules
import { Request, Response, NextFunction } from 'express';

// Custom Modules
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import config from '@/config';
import { AppError } from '@/utils/AppError';

// Models
import User from '@/models/user';
import Token from '@/models/token';

const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // 2. Check if user exists & password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3. Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 4. Save refresh token
    await Token.create({
      token: refreshToken,
      userId: user._id,
    });

    logger.info('Refresh token created for user', { userId: user._id });

    // 5. Send cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 6. Send response
    res.status(200).json({
      status: 'success',
      token: accessToken,
      data: {
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });

    logger.info('User logged in successfully', { userId: user._id });
  } catch (err) {
    next(err);
  }
};

export default login;
