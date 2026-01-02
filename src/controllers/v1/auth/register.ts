import { logger } from '@/lib/winston';
import config from '@/config';
import { genUsername } from '@/utils';
import User from '@/models/user';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';

import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';

type UserData = Pick<
  IUser,
  | 'username'
  | 'email'
  | 'password'
  | 'role'
  | 'firstName'
  | 'lastName'
  | 'socialLinks'
>;

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as UserData;
  console.log('Registering user:', { email, password, role });

  try {
    const username = genUsername();
    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // logger.info('User registered successfully', { user });
    // console.log('User registered successfully', { user });

    res.status(201).json({
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    });

    logger.info('User registered successfully', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });
    logger.error('Error during user registration', { error });
  }
};

export default register;
