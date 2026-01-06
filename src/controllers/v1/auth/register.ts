// Node Modules
import { Request, Response, NextFunction } from 'express';

// Custom Modules
import { logger } from '@/lib/winston';
import config from '@/config';
import { genUsername } from '@/utils';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { AppError } from '@/utils/AppError';

// Models
import User from '@/models/user';
import Token from '@/models/token';

const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    // Check strict admin whitelist
    if (role === 'admin' && !config.WHITELIST_ADMINS_MAIL.includes(email)) {
      return next(new AppError('You are not authorized to be an admin', 403));
    }

    const username = genUsername();

    // Create new user (password hashing is handled by pre-save hook)
    const newUser = await User.create({
      username,
      email,
      password,
      role: role || 'user',
    });

    // Generate Tokens
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // Save Refresh Token
    await Token.create({
      token: refreshToken,
      userId: newUser._id,
    });

    // Send Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send Response
    res.status(201).json({
      status: 'success',
      token: accessToken,
      data: {
        user: {
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });

    logger.info('User registered successfully', {
      userId: newUser._id,
      email: newUser.email,
    });
  } catch (error) {
    next(error);
  }
};

export default register;
