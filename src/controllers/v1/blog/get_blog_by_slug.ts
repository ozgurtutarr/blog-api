// Custom Modules
import { logger } from '@/lib/winston';

// Models
import Blog from '@/models/blog';
import User from '@/models/user';

// Types
import type { Request, Response, NextFunction } from 'express';

import { AppError } from '@/utils/AppError';

const getBlogBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug;

    // Get user role if authenticated
    let userRole = 'user';
    if (userId) {
      const user = await User.findById(userId).select('role').lean();
      if (user) userRole = user.role;
    }

    const blog = await Blog.findOne({ slug })
      .select('-banner.publicId -__v')
      .populate('author', 'firstName lastName username email')
      .lean()
      .exec();

    if (!blog) {
      return next(new AppError('Blog not found', 404));
    }

    // Check permissions: users can't see drafts
    if (userRole === 'user' && blog.status === 'draft') {
      return next(
        new AppError('You do not have permission to view this draft', 403),
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        blog,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default getBlogBySlug;
