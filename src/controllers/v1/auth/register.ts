import { logger } from '@/lib/winston';
import config from '@/config';

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
    res.status(201).json({
      message: 'User registered successfully',
      env: config.NODE_ENV,
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
