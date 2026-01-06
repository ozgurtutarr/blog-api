// Custom Modules
import config from '@/config';
import { logger } from '@/lib/winston';

// Models
import Blog from '@/models/blog';
import User from '@/models/user';

// Types
import { NextFunction } from 'express';
import { AppError } from '@/utils/AppError';
import type { Request, Response } from 'express';

interface QueryType {
  status?: 'draft' | 'published';
}

const getBlogsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUserId = req.userId;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset =
      parseInt(req.query.offset as string) || config.defaultResOffset;
    const query: any = {};

    const userId = req.params.userId;

    // Check if the current user (if any) is querying their own blogs or if it's a public request
    let currentUserRole = 'user';
    if (currentUserId) {
      const u = await User.findById(currentUserId).select('role').lean();
      if (u) currentUserRole = u.role;
    }

    // Identify if the request is for the own profile
    const isOwner = currentUserId && currentUserId.toString() === userId;

    // If not owner and not admin, only show published
    if (!isOwner && currentUserRole !== 'admin') {
      query.status = 'published';
    }

    const total = await Blog.countDocuments({ author: userId, ...query });
    const blogs = await Blog.find({ author: userId, ...query })
      .select('-banner.publicId -__v')
      .populate('author', 'firstName lastName username email')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      status: 'success',
      results: blogs.length,
      data: {
        total,
        limit,
        offset,
        blogs,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default getBlogsByUser;
