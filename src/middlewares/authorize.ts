// Custom Modules
import { AppError } from '@/utils/AppError';

// Models
import User from '@/models/user';

// Types
import type { Request, Response, NextFunction } from 'express';

export type AuthRole = 'admin' | 'user';

const authorize = (roles: AuthRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await User.findById(userId).select('role').lean().exec();

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!roles.includes(user.role)) {
        throw new AppError('Access denied, insufficient permissions', 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default authorize;
