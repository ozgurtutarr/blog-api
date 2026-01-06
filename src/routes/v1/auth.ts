// Node Modules
import { Router } from 'express';
import { body, cookie } from 'express-validator';

// Controllers
import register from '@/controllers/v1/auth/register';
import login from '@/controllers/v1/auth/login';
import refreshToken from '@/controllers/v1/auth/refresh_token';
import logout from '@/controllers/v1/auth/logout';

// Middlewares
import authenticate from '@/middlewares/authenticate';
import validationError from '@/middlewares/validationError';
import User from '@/models/user';

const router = Router();

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      // Check for existing user
      const userExists = await User.exists({ email: value });
      if (userExists) throw new Error('Email already in use');
    }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role'),
  validationError,
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validationError,
];

const tokenValidation = [
  cookie('refreshToken').isJWT().withMessage('Invalid refresh token'),
  validationError,
];

// --- Routes ---

router.post('/register', registerValidation, register);

router.post('/login', loginValidation, login);

router.post('/refresh-token', tokenValidation, refreshToken);

router.post('/logout', authenticate, tokenValidation, logout);

export default router;
